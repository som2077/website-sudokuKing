import { Difficulty } from "@/lib/sudokuEngine";

export interface VersusPlayer {
  id: string;
  username: string;
  countryCode: string;
  countryName: string;
  avatarSeed: string;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
  botDifficulty?: "Easy" | "Medium" | "Hard";
  progress: number; // Number of filled/solved cells (out of 81)
  totalGivens: number; // Total initial clues
  mistakes: number;
  solvedIndices?: number[];
  completedAt?: number;
  timeSeconds?: number;
  forfeit?: boolean;
}

export type VersusMatchStatus =
  | "lobby" // Waiting for player 2 or ready
  | "countdown" // 3.. 2.. 1..
  | "playing" // Match in progress
  | "finished" // Someone won or game ended
  | "abandoned"; // Opponent disconnected

export interface VersusRoomState {
  roomCode: string;
  difficulty: Difficulty;
  puzzleSeed: string;
  status: VersusMatchStatus;
  countdown: number;
  startTime?: number;
  endTime?: number;
  winnerId: string | null;
  players: Record<string, VersusPlayer>;
}

export type VersusBroadcastEvent =
  | { type: "player_join"; player: VersusPlayer }
  | { type: "player_ready"; playerId: string; isReady: boolean }
  | { type: "difficulty_change"; difficulty: Difficulty }
  | {
      type: "game_start";
      puzzleSeed: string;
      difficulty: Difficulty;
      startTime: number;
    }
  | {
      type: "player_progress";
      playerId: string;
      progress: number;
      mistakes: number;
      lastCellIndex?: number;
    }
  | {
      type: "player_finish";
      playerId: string;
      timeSeconds: number;
      mistakes: number;
    }
  | { type: "player_forfeit"; playerId: string }
  | { type: "rematch_request"; playerId: string }
  | { type: "rematch_accept"; puzzleSeed: string };
