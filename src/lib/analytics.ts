import posthog from 'posthog-js';
import { track as vercelTrack } from '@vercel/analytics';

/**
 * Legacy & Universal event tracker - tracks to both PostHog and Vercel
 */
export function trackEvent(
  name: string,
  properties?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Track to PostHog
  try {
    if (posthog.__loaded) {
      posthog.capture(name, properties);
    }
  } catch {
    // Ignore adblocker errors
  }

  // Track to Vercel Analytics
  try {
    vercelTrack(name, properties);
  } catch {
    // Ignore adblocker errors
  }
}

/**
 * Type-safe analytics helper for Sudoku King
 */
export const analytics = {
  /**
   * Track general custom event
   */
  track(eventName: string, properties?: Record<string, any>) {
    trackEvent(eventName, properties);
  },

  /**
   * Track user interacting with a specific website feature
   */
  trackFeature(featureName: string, properties?: Record<string, any>) {
    this.track('feature_used', {
      feature: featureName,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  /**
   * Track game-specific actions (hints, undo, pencil, etc.)
   */
  trackGameAction(
    action:
      | 'hint'
      | 'undo'
      | 'erase'
      | 'pencil_mode'
      | 'fast_pencil'
      | 'autofill_notes'
      | 'digit_input'
      | 'difficulty_change'
      | 'new_game'
      | 'restart',
    metadata?: Record<string, any>
  ) {
    this.track('game_action', {
      action,
      ...metadata,
    });
  },

  /**
   * Track game completion / win
   */
  trackGameCompleted(
    difficulty: string,
    timeSeconds: number,
    mistakes: number,
    hintsUsed: number
  ) {
    this.track('game_completed', {
      difficulty,
      time_seconds: timeSeconds,
      mistakes,
      hints_used: hintsUsed,
    });
  },

  /**
   * Track Versus 1v1 multiplayer actions
   */
  trackVersus(
    action: 'create_room' | 'join_room' | 'game_start' | 'game_end',
    details?: Record<string, any>
  ) {
    this.track('versus_mode', {
      action,
      ...details,
    });
  },

  /**
   * Identify a logged in user (Supabase Auth)
   */
  identifyUser(userId: string, userTraits?: Record<string, any>) {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.identify(userId, userTraits);
    }
  },

  /**
   * Reset on logout
   */
  resetUser() {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.reset();
    }
  },
};
