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
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw game screenshots in the middle (composite all canvases)
    canvases.forEach(canvas => {
        ctx.drawImage(canvas, 40, 460, 1000, 1000);
    });

    // Text Overlay
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    ctx.font = '200 80px sans-serif';
    ctx.fillText('LAST LIGHT', 540, 200);

    ctx.font = '300 40px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`World Age: Day ${world.age}`, 540, 1550);
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
