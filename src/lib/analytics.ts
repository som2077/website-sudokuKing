import { track as vercelTrack } from "@vercel/analytics";
import { logFirebaseEvent, setFirebaseUser } from "@/lib/firebaseAnalytics";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

/** Sends custom product events to Firebase Analytics and Vercel Analytics. */
export function trackEvent(name: string, properties?: AnalyticsProperties): void {
  if (typeof window === "undefined") return;

  logFirebaseEvent(name, properties);

  try {
    vercelTrack(name, properties);
  } catch {
    // Analytics must never interrupt gameplay.
  }
}

export const analytics = {
  track(eventName: string, properties?: AnalyticsProperties) {
    trackEvent(eventName, properties);
  },

  trackFeature(featureName: string, properties?: AnalyticsProperties) {
    this.track("feature_used", {
      feature: featureName,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackGameAction(
    action:
      | "hint"
      | "undo"
      | "erase"
      | "pencil_mode"
      | "fast_pencil"
      | "autofill_notes"
      | "digit_input"
      | "difficulty_change"
      | "new_game"
      | "restart",
    metadata?: AnalyticsProperties,
  ) {
    this.track("game_action", { action, ...metadata });
  },

  trackGameCompleted(
    difficulty: string,
    timeSeconds: number,
    mistakes: number,
    hintsUsed: number,
  ) {
    this.track("game_completed", {
      difficulty,
      time_seconds: timeSeconds,
      mistakes,
      hints_used: hintsUsed,
    });
  },

  trackVersus(
    action: "create_room" | "join_room" | "game_start" | "game_end",
    details?: AnalyticsProperties,
  ) {
    this.track("versus_mode", { action, ...details });
  },

  identifyUser(userId: string, userTraits?: AnalyticsProperties) {
    setFirebaseUser(userId, userTraits);
  },

  resetUser() {
    setFirebaseUser(null);
  },
};
