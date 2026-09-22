import { SceneManager, PondShape } from "./scene";

export class PondCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
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
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(): void {
    const { ctx, canvas, scene } = this;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    const clip = scene.getClipRegion(w, h);
    if (clip) {
      ctx.save();
      ctx.beginPath();
      if (clip.shape === PondShape.Circle || clip.shape === PondShape.Irregular || clip.shape === PondShape.Oval) {
        ctx.ellipse(clip.x + clip.width / 2, clip.y + clip.height / 2, clip.width / 2, clip.height / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.roundRect(clip.x, clip.y, clip.width, clip.height, 40);
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
