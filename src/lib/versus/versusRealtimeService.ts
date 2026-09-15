import { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { VersusBroadcastEvent, VersusPlayer } from "./types";

export interface RealtimeVersusCallbacks {
  onEvent: (event: VersusBroadcastEvent) => void;
  onPeerJoin?: (player: VersusPlayer) => void;
  onPeerLeave?: (playerId: string) => void;
  onStatusChange?: (
    status: "connected" | "connecting" | "disconnected",
  ) => void;
}

export class VersusRealtimeManager {
  private channel: RealtimeChannel | null = null;
  private roomCode: string;
  private currentPlayer: VersusPlayer;
  private callbacks: RealtimeVersusCallbacks;
  private isSubscribed: boolean = false;

  constructor(
    roomCode: string,
    currentPlayer: VersusPlayer,
    callbacks: RealtimeVersusCallbacks,
  ) {
    this.roomCode = roomCode;
    this.currentPlayer = currentPlayer;
    this.callbacks = callbacks;
  }

  public connect(): void {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn(
        "Supabase not available, using local versus channel simulation",
      );
      this.callbacks.onStatusChange?.("connected");
      return;
    }

    this.callbacks.onStatusChange?.("connecting");
    const channelName = `versus_room_${this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: this.currentPlayer.id },
      },
    });

    // Listen for broadcast events
    this.channel.on("broadcast", { event: "versus_action" }, (payload) => {
      const data = payload.payload as VersusBroadcastEvent;
      if (data) {
        this.callbacks.onEvent(data);
      }
    });

    // Track presence changes
    this.channel
      .on("presence", { event: "sync" }, () => {
        if (!this.channel) return;
        const presenceState = this.channel.presenceState();
        // Check peers in presence
        Object.keys(presenceState).forEach((key) => {
          if (key !== this.currentPlayer.id) {
            const presences = presenceState[key] as unknown as {
              player?: VersusPlayer;
            }[];
            if (presences && presences.length > 0 && presences[0].player) {
              this.callbacks.onPeerJoin?.(presences[0].player);
            }
          }
        });
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        if (Array.isArray(newPresences)) {
          newPresences.forEach((p) => {
            const player = p.player as VersusPlayer;
            if (player && player.id !== this.currentPlayer.id) {
              this.callbacks.onPeerJoin?.(player);
            }
          });
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (Array.isArray(leftPresences)) {
          leftPresences.forEach((p) => {
            const player = p.player as VersusPlayer;
            if (player && player.id !== this.currentPlayer.id) {
              this.callbacks.onPeerLeave?.(player.id);
            }
          });
        }
      });

    this.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        this.isSubscribed = true;
        this.callbacks.onStatusChange?.("connected");

        // Track our presence in the room
        await this.channel?.track({
          player: this.currentPlayer,
          onlineAt: new Date().toISOString(),
        });

        // Broadcast that we joined
        this.sendEvent({
          type: "player_join",
          player: this.currentPlayer,
        });
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        this.isSubscribed = false;
        this.callbacks.onStatusChange?.("disconnected");
      }
    });
  }

  public sendEvent(event: VersusBroadcastEvent): void {
    if (!this.channel || !this.isSubscribed) {
      // Local fallback
      return;
    }

    this.channel.send({
      type: "broadcast",
      event: "versus_action",
      payload: event,
    });
  }

  public updatePresence(player: Partial<VersusPlayer>): void {
    if (!this.channel || !this.isSubscribed) return;
    this.currentPlayer = { ...this.currentPlayer, ...player };
    this.channel.track({
      player: this.currentPlayer,
      updatedAt: new Date().toISOString(),
    });
  }

  public disconnect(): void {
    if (this.channel) {
      const supabase = getSupabaseClient();
      this.channel.untrack();
      if (supabase) {
        supabase.removeChannel(this.channel);
      }
      this.channel = null;
      this.isSubscribed = false;
      this.callbacks.onStatusChange?.("disconnected");
    }
  }
}
