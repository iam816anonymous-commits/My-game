/**
 * V12 Reality Core Feedback System
 * Manages psychological and emotional feedback loops (Juice)
 */
export class JuiceManager {
  private static shakeIntensity = 0;
  private static shakeTimeout: any = null;
  private static listeners: Set<(intensity: number) => void> = new Set();

  /**
   * Triggers a screen shake event
   */
  public static shake(intensity: number = 5) {
    if (this.shakeTimeout) clearTimeout(this.shakeTimeout);

    this.shakeIntensity = intensity;
    this.notify();

    this.shakeTimeout = setTimeout(() => {
        this.shakeIntensity = 0;
        this.notify();
        this.shakeTimeout = null;
    }, 120);
  }

  /**
   * Triggers a "Success Flash" for high-satisfaction moments
   */
  public static success() {
      document.body.classList.add('reality-success-flash');
      setTimeout(() => document.body.classList.remove('reality-success-flash'), 400);
  }

  /**
   * Triggers a "Danger Vignette" for near-death tension
   */
  public static danger() {
      document.body.classList.add('reality-danger-vignette');
      setTimeout(() => document.body.classList.remove('reality-danger-vignette'), 1000);
  }

  private static notify() {
      this.listeners.forEach(l => l(this.shakeIntensity));
  }

  public static subscribe(l: (i: number) => void) {
      this.listeners.add(l);
      return () => this.listeners.delete(l);
  }
}
