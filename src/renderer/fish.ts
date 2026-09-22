import { Fish } from "../sim/creatures";

export class FishRenderer {
  render(ctx: CanvasRenderingContext2D, fish: Fish): void {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.direction);

    const s = fish.size;
    ctx.fillStyle = `rgb(${fish.color[0] * 255}, ${fish.color[1] * 255}, ${fish.color[2] * 255})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.5, s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-s * 1.5, 0);
    ctx.lineTo(-s * 2.5, -s * 0.8);
    ctx.lineTo(-s * 2.5, s * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
