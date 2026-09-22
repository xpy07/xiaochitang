import { SceneManager, PondShape } from "./scene";

export class PondCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private logicalW = 0;
  private logicalH = 0;
  scene: SceneManager;

  constructor() {
    this.canvas = document.getElementById("pond") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.scene = new SceneManager();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.logicalW = window.innerWidth;
    this.logicalH = window.innerHeight;
    this.canvas.width = this.logicalW * dpr;
    this.canvas.height = this.logicalH * dpr;
    this.canvas.style.width = this.logicalW + "px";
    this.canvas.style.height = this.logicalH + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(): void {
    const { ctx, scene } = this;
    const w = this.logicalW;
    const h = this.logicalH;
    ctx.clearRect(0, 0, w, h);

    const clip = scene.getClipRegion(w, h);
    if (clip) {
      ctx.save();
      ctx.beginPath();
      if (clip.shape === PondShape.Circle) {
        ctx.ellipse(clip.x + clip.width / 2, clip.y + clip.height / 2, clip.width / 2, clip.height / 2, 0, 0, Math.PI * 2);
      } else if (clip.shape === PondShape.Oval) {
        ctx.ellipse(clip.x + clip.width / 2, clip.y + clip.height / 2, clip.width / 2, clip.height / 2, 0, 0, Math.PI * 2);
      } else if (clip.shape === PondShape.Irregular) {
        const cx = clip.x + clip.width / 2;
        const cy = clip.y + clip.height / 2;
        const rx = clip.width / 2;
        const ry = clip.height / 2;
        ctx.moveTo(cx + rx, cy);
        for (let i = 0; i <= 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const wobble = 1 + 0.15 * Math.sin(angle * 3);
          const px = cx + rx * wobble * Math.cos(angle);
          const py = cy + ry * wobble * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.roundRect(clip.x, clip.y, clip.width, clip.height, Math.min(40, clip.width / 2, clip.height / 2));
      }
      ctx.clip();
    }

    ctx.fillStyle = "rgba(30, 100, 160, 0.7)";
    ctx.fillRect(0, 0, w, h);

    if (clip) {
      ctx.restore();
    }
  }
}
