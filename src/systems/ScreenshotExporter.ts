import { useStore } from '../store/useStore';

export class ScreenshotExporter {
  public static async exportPNG() {
    const { world, totalMemories } = useStore.getState();

    const canvases = document.querySelectorAll('canvas');
    if (canvases.length < 1) return;

    // Create a temporary canvas for the share card (1080x1920)
    const card = document.createElement('canvas');
    card.width = 1080;
    card.height = 1920;
    const ctx = card.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#070B18';
    ctx.fillRect(0, 0, 1080, 1920);

    // Vignette / Cinematic Gradient
    const grad = ctx.createRadialGradient(540, 960, 200, 540, 960, 1000);
    grad.addColorStop(0, 'rgba(103, 232, 249, 0.05)');
    grad.addColorStop(1, 'rgba(7, 11, 24, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw game screenshots (Full frame with organic crop)
    canvases.forEach(canvas => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 300, 1000, 1300, 40);
        ctx.clip();
        ctx.drawImage(canvas, -200, 300, 1480, 1300);
        ctx.restore();
    });

    // Artistic border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 300, 1000, 1300);

    // Text Overlay
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    ctx.font = '200 100px sans-serif';
    ctx.letterSpacing = '12px';
    ctx.fillText('LAST LIGHT', 540, 200);

    ctx.font = '300 36px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(`A VISION FROM SOL ${world.age}`, 540, 1680);
    ctx.fillText(`Memories Protected: ${totalMemories}`, 540, 1620);
    ctx.fillText(`Companion Personality: ${this.getTopTrait()}`, 540, 1690);

    // Download
    const link = document.createElement('a');
    link.download = `last-light-day-${world.age}.png`;
    link.href = card.toDataURL('image/png');
    link.click();
  }

  private static getTopTrait(): string {
    const traits = useStore.getState().companion.traits;
    let top = 'gentle';
    let max = -1;
    for (const [key, val] of Object.entries(traits)) {
      if (val > max) {
        max = val;
        top = key;
      }
    }
    return top.charAt(0).toUpperCase() + top.slice(1);
  }

  public static generateVisitCode(): string {
    const state = useStore.getState();
    const data = {
        w: state.world,
        c: state.companion,
        m: state.totalMemories
    };
    return btoa(JSON.stringify(data));
  }

  public static importVisitCode(code: string) {
    try {
      const data = JSON.parse(atob(code));
      // In a real app, this would switch to a "Visitor Mode"
      console.log("Visiting world:", data);
    } catch {
      console.error("Invalid visit code");
    }
  }
}
