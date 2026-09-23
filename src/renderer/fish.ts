import { CreatureSpecies, Fish } from "../sim/creatures";

export class FishRenderer {
  render(ctx: CanvasRenderingContext2D, fish: Fish): void {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.direction);

    const s = fish.size;
    const base = `rgb(${fish.color[0] * 255}, ${fish.color[1] * 255}, ${fish.color[2] * 255})`;
    const pat = `rgb(${fish.patternColor[0] * 255}, ${fish.patternColor[1] * 255}, ${fish.patternColor[2] * 255})`;
    if (fish.patternType === "gradient") {
      const g = ctx.createLinearGradient(-s * 2, -s, s * 2, s);
      g.addColorStop(0, base);
      g.addColorStop(1, pat);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = base;
    }

    if (fish.isTadpole) {
      this.drawTadpole(ctx, s);
    } else {
      switch (fish.species) {
        case CreatureSpecies.Frog:
          this.drawFrog(ctx, s);
          break;
        case CreatureSpecies.Crab:
          this.drawCrab(ctx, s);
          break;
        case CreatureSpecies.Lobster:
          this.drawLobster(ctx, s);
          break;
        case CreatureSpecies.Eel:
          this.drawEel(ctx, s, fish.phase);
          break;
        default:
          this.drawFish(ctx, s);
      }
    }

    if (fish.patternType === "spots" || fish.patternType === "stripes") {
      this.drawPattern(ctx, fish.patternType, pat, s);
    }

    ctx.restore();
  }

  private drawFish(ctx: CanvasRenderingContext2D, s: number): void {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.5, s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-s * 1.5, 0);
    ctx.lineTo(-s * 2.5, -s * 0.8);
    ctx.lineTo(-s * 2.5, s * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  private drawTadpole(ctx: CanvasRenderingContext2D, s: number): void {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.9, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = Math.max(1, s * 0.2);
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, 0);
    ctx.quadraticCurveTo(-s * 1.5, s * 0.3, -s * 2.2, 0);
    ctx.stroke();
  }

  private drawPattern(ctx: CanvasRenderingContext2D, type: string, patColor: string, s: number): void {
    ctx.fillStyle = patColor;
    ctx.strokeStyle = patColor;
    if (type === "spots") {
      ctx.beginPath();
      ctx.arc(-s * 0.4, -s * 0.3, s * 0.25, 0, Math.PI * 2);
      ctx.arc(s * 0.3, s * 0.2, s * 0.3, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.4, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.lineWidth = Math.max(1, s * 0.25);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.6, -s * 0.8);
        ctx.lineTo(i * s * 0.6, s * 0.8);
        ctx.stroke();
      }
    }
  }

  private drawFrog(ctx: CanvasRenderingContext2D, s: number): void {
    ctx.beginPath();
    ctx.ellipse(-s * 0.8, -s * 0.9, s * 0.6, s * 0.3, -0.5, 0, Math.PI * 2);
    ctx.ellipse(-s * 0.8, s * 0.9, s * 0.6, s * 0.3, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.1, s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(s * 0.7, -s * 0.7, s * 0.35, s * 0.2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(s * 0.7, s * 0.7, s * 0.35, s * 0.2, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 0.5, -s * 0.5, Math.max(1, s * 0.18), 0, Math.PI * 2);
    ctx.arc(s * 0.5, s * 0.5, Math.max(1, s * 0.18), 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCrab(ctx: CanvasRenderingContext2D, s: number): void {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.1, s * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(s * 1.3, -s * 0.9, s * 0.4, s * 0.25, -0.4, 0, Math.PI * 2);
    ctx.ellipse(s * 1.3, s * 0.9, s * 0.4, s * 0.25, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = Math.max(1, s * 0.15);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const bx = -s * 0.3 - i * s * 0.35;
        ctx.beginPath();
        ctx.moveTo(bx, side * s * 0.6);
        ctx.lineTo(bx - s * 0.2, side * s * 1.2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 0.7, -s * 0.3, Math.max(1, s * 0.12), 0, Math.PI * 2);
    ctx.arc(s * 0.7, s * 0.3, Math.max(1, s * 0.12), 0, Math.PI * 2);
    ctx.fill();
  }

  private drawLobster(ctx: CanvasRenderingContext2D, s: number): void {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.8, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-s * 1.7, 0);
    ctx.lineTo(-s * 2.5, -s * 0.6);
    ctx.lineTo(-s * 2.5, s * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(s * 1.6, -s * 0.7, s * 0.5, s * 0.22, -0.3, 0, Math.PI * 2);
    ctx.ellipse(s * 1.6, s * 0.7, s * 0.5, s * 0.22, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = Math.max(1, s * 0.1);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * 1.4, side * s * 0.2);
      ctx.quadraticCurveTo(s * 2.2, side * s * 0.5, s * 3, side * s * 0.3);
      ctx.stroke();
    }
  }

  private drawEel(ctx: CanvasRenderingContext2D, s: number, phase: number): void {
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = s * 0.7;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = -s * 2 + t * s * 4.5;
      const y = Math.sin(t * Math.PI * 2.5 + phase) * s * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
