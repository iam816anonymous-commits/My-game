import { PostHogProvider, type AnalyticsProvider } from './analytics/Providers';

export class AnalyticsManager {
  private static provider: AnalyticsProvider = new PostHogProvider();
  private static sessionStart: number = Date.now();
  private static activeGameStart: number | null = null;
  private static activeGameId: string | null = null;

  private static readonly LOCAL_STORAGE_KEY = 'playverse_raw_events';

  public static trackEvent(event: string, properties: any = {}) {
    const payload = {
        ...properties,
        timestamp: Date.now(),
        session_id: this.sessionStart.toString()
    };

    // 1. Send to Provider
    this.provider.track(event, payload);

    // 2. Persist locally for Admin Dashboard
    this.persistEvent(event, payload);
  }

  private static persistEvent(event: string, payload: any) {
    try {
        const history = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '[]');
        history.push({ event, ...payload });
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(history.slice(-500))); // Keep last 500 for admin
    } catch (e) {
        console.error('Failed to persist analytics event', e);
    }
  }

  // --- Session Tracking ---
  public static trackSessionStart(isReturning: boolean, dailyReturn: boolean, streak: number) {
    this.sessionStart = Date.now();
    this.trackEvent('session_start', {
        is_returning: isReturning,
        daily_return: dailyReturn,
        streak_continuation: streak > 1,
        streak_count: streak
    });
  }

  public static trackSessionEnd() {
    const duration = (Date.now() - this.sessionStart) / 1000;
    this.trackEvent('session_end', { duration_seconds: duration });
  }

  // --- Game Lifecycle ---
  public static trackGameOpen(gameId: string) {
    this.activeGameId = gameId;
    this.activeGameStart = Date.now();
    this.trackEvent('game_opened', { game_id: gameId });

    // Funnel Start
    this.trackEvent('funnel_dashboard_to_game', { game_id: gameId });
  }

  public static trackFirstAction(gameId: string) {
    this.trackEvent('game_first_action', { game_id: gameId });
  }

  public static trackGameHeartbeat(gameId: string, secondsPlayed: number) {
    if (secondsPlayed === 30) {
        this.trackEvent('game_30s_played', { game_id: gameId });
    }
  }

  public static trackGameComplete(gameId: string, score: number) {
    const duration = this.activeGameStart ? (Date.now() - this.activeGameStart) / 1000 : 0;
    this.trackEvent('game_completed', {
        game_id: gameId,
        score: score,
        duration_seconds: duration
    });
  }

  public static trackGameRestart(gameId: string) {
    this.trackEvent('game_restarted', { game_id: gameId });
  }

  public static trackGameAbandon(gameId: string) {
      if (!this.activeGameStart) return;
      const duration = (Date.now() - this.activeGameStart) / 1000;
      if (duration < 30) {
          this.trackEvent('game_abandoned', {
              game_id: gameId,
              duration_seconds: duration
          });
      }
      this.activeGameStart = null;
  }

  // --- Dashboard ---
  public static trackDashboardInteraction(type: 'click' | 'search' | 'favorite', target: string) {
      this.trackEvent('dashboard_interaction', {
          interaction_type: type,
          target: target
      });
  }

  public static getRawEvents() {
      return JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '[]');
  }
}
