import { Ripple } from "../sim/play";

export class RippleRenderer {
  render(ctx: CanvasRenderingContext2D, ripples: Ripple[]): void {
    for (const r of ripples) {
      ctx.strokeStyle = `rgba(180, 220, 255, ${r.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
