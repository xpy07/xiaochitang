import { Decoration, DecorationType } from "../sim/decor";

export class DecorRenderer {
  render(ctx: CanvasRenderingContext2D, d: Decoration): void {
    ctx.save();
    ctx.translate(d.x, d.y);
    switch (d.type) {
      case DecorationType.Rock:
        ctx.fillStyle = d.tint;
        ctx.beginPath();
        ctx.ellipse(0, 0, d.width / 2, d.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.ellipse(-3, -3, d.width / 3, d.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case DecorationType.Bridge:
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);
        ctx.fillStyle = "#A0782C";
        ctx.fillRect(-d.width / 2 + 2, -d.height / 2 - 2, d.width - 4, 4);
        break;
      case DecorationType.Lotus:
        ctx.fillStyle = "#228B22";
        ctx.beginPath();
        ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF69B4";
        ctx.beginPath();
        ctx.arc(0, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case DecorationType.Stone:
        ctx.fillStyle = d.tint;
        ctx.beginPath();
        ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}
