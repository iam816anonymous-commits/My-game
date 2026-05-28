export class AnalyticsManager {
  private static readonly KEY = 'playverse_analytics';

  public static trackEvent(eventName: string, data: any = {}) {
    const payload = {
      event: eventName,
      timestamp: Date.now(),
      ...data
    };

    // Placeholder for actual analytics service
    console.log(`[Analytics] ${eventName}`, payload);

    // Local persistence for return rate calculation
    const history = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    history.push(payload);
    localStorage.setItem(this.KEY, JSON.stringify(history.slice(-100))); // Keep last 100 events
  }

  public static trackSessionStart() {
    this.trackEvent('session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language
    });
  }

  public static trackRageQuit(gameId: string, duration: number) {
    this.trackEvent('rage_quit', { gameId, duration });
  }
}
