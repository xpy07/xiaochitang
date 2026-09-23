import { CreatureSpecies, Fish } from "../sim/creatures";

export class FishRenderer {
  render(ctx: CanvasRenderingContext2D, fish: Fish): void {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.direction);

    const s = fish.size;
    const r = Math.round(fish.color[0] * 255);
    const g = Math.round(fish.color[1] * 255);
    const b = Math.round(fish.color[2] * 255);
    const base = `rgb(${r},${g},${b})`;
    const dark = `rgb(${Math.round(r * 0.6)},${Math.round(g * 0.6)},${Math.round(b * 0.6)})`;
    const light = `rgb(${Math.min(255, Math.round(r * 1.3 + 30))},${Math.min(255, Math.round(g * 1.3 + 30))},${Math.min(255, Math.round(b * 1.3 + 30))})`;
    const pr = Math.round(fish.patternColor[0] * 255);
    const pg = Math.round(fish.patternColor[1] * 255);
    const pb = Math.round(fish.patternColor[2] * 255);
    const pat = `rgb(${pr},${pg},${pb})`;

    if (fish.isTadpole) {
      this.drawTadpole(ctx, s, base, dark);
    } else {
      switch (fish.species) {
        case CreatureSpecies.Frog:
          this.drawFrog(ctx, s, base, dark, light);
          break;
        case CreatureSpecies.Crab:
          this.drawCrab(ctx, s, base, dark, light);
          break;
        case CreatureSpecies.Lobster:
          this.drawLobster(ctx, s, base, dark, light);
          break;
        case CreatureSpecies.Eel:
          this.drawEel(ctx, s, fish.phase, base, dark, light);
          break;
        default:
          this.drawFish(ctx, s, base, dark, light);
      }
    }

    if (fish.patternType === "spots" || fish.patternType === "stripes") {
      this.drawPattern(ctx, fish.patternType, pat, s);
    }

    ctx.restore();
  }

  private drawFish(ctx: CanvasRenderingContext2D, s: number, base: string, dark: string, light: string): void {
    // Body shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(1, 1, s * 1.6, s * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail (behind body)
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-s * 1.2, 0);
    ctx.quadraticCurveTo(-s * 2.2, -s * 0.9, -s * 2.8, -s * 0.5);
    ctx.lineTo(-s * 2.4, 0);
    ctx.lineTo(-s * 2.8, s * 0.5);
    ctx.quadraticCurveTo(-s * 2.2, s * 0.9, -s * 1.2, 0);
    ctx.fill();

    // Body base
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.55, s * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly highlight
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(s * 0.2, s * 0.2, s * 1.0, s * 0.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Dorsal fin
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.8);
    ctx.quadraticCurveTo(0, -s * 1.5, s * 0.8, -s * 0.7);
    ctx.quadraticCurveTo(0, -s * 0.9, -s * 0.5, -s * 0.8);
    ctx.fill();

    // Pectoral fin
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(s * 0.3, s * 0.5, s * 0.35, s * 0.18, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.85, -s * 0.2, Math.max(1.5, s * 0.2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 0.9, -s * 0.2, Math.max(0.8, s * 0.1), 0, Math.PI * 2);
    ctx.fill();

    // Mouth line
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(0.5, s * 0.06);
    ctx.beginPath();
    ctx.arc(s * 1.4, s * 0.1, s * 0.15, -0.3, 0.3);
    ctx.stroke();
  }

  private drawTadpole(ctx: CanvasRenderingContext2D, s: number, base: string, dark: string): void {
    // Body
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.9, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1, s * 0.18);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, 0);
    ctx.quadraticCurveTo(-s * 1.4, s * 0.35, -s * 2.2, s * 0.1);
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.4, -s * 0.1, Math.max(1, s * 0.15), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.1, Math.max(0.6, s * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFrog(ctx: CanvasRenderingContext2D, s: number, base: string, dark: string, light: string): void {
    // Back legs
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(-s * 0.8, -s * 0.8, s * 0.55, s * 0.25, -0.5, 0, Math.PI * 2);
    ctx.ellipse(-s * 0.8, s * 0.8, s * 0.55, s * 0.25, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.1, s * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots on back
    ctx.fillStyle = dark;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.2, s * 0.2, 0, Math.PI * 2);
    ctx.arc(s * 0.3, s * 0.1, s * 0.15, 0, Math.PI * 2);
    ctx.arc(-s * 0.1, s * 0.3, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Front legs
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.ellipse(s * 0.7, -s * 0.6, s * 0.3, s * 0.15, -0.4, 0, Math.PI * 2);
    ctx.ellipse(s * 0.7, s * 0.6, s * 0.3, s * 0.15, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(s * 0.1, s * 0.15, s * 0.7, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eyes (bumped)
    for (const side of [-1, 1]) {
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(s * 0.5, side * s * 0.55, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s * 0.55, side * s * 0.55, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(s * 0.6, side * s * 0.55, Math.max(0.8, s * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCrab(ctx: CanvasRenderingContext2D, s: number, base: string, dark: string, light: string): void {
    // Legs
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1, s * 0.15);
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const bx = -s * 0.2 - i * s * 0.4;
        const by = side * s * 0.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - s * 0.15, side * s * 1.0, bx - s * 0.3, side * s * 1.3);
        ctx.stroke();
      }
    }

    // Shell shadow
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(1, 1, s * 1.15, s * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.1, s * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell highlight
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(-s * 0.1, -s * 0.15, s * 0.6, s * 0.4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Shell pattern
    ctx.fillStyle = dark;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Claws
    for (const side of [-1, 1]) {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(s * 1.1, side * s * 0.7, s * 0.4, s * 0.2, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.ellipse(s * 1.2, side * s * 0.65, s * 0.3, s * 0.13, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes
    for (const side of [-1, 1]) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s * 0.6, side * s * 0.3, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(s * 0.65, side * s * 0.3, Math.max(0.5, s * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawLobster(ctx: CanvasRenderingContext2D, s: number, base: string, dark: string, light: string): void {
    // Antennae
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(0.5, s * 0.07);
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * 1.3, side * s * 0.15);
      ctx.quadraticCurveTo(s * 2.2, side * s * 0.5, s * 3.2, side * s * 0.2);
      ctx.stroke();
    }

    // Tail fan
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-s * 1.5, 0);
    ctx.quadraticCurveTo(-s * 2.3, -s * 0.7, -s * 2.8, -s * 0.3);
    ctx.lineTo(-s * 2.5, 0);
    ctx.lineTo(-s * 2.8, s * 0.3);
    ctx.quadraticCurveTo(-s * 2.3, s * 0.7, -s * 1.5, 0);
    ctx.fill();

    // Body segments
    for (let i = 0; i < 3; i++) {
      const cx = s * (0.8 - i * 0.8);
      ctx.fillStyle = i % 2 === 0 ? base : dark;
      ctx.beginPath();
      ctx.ellipse(cx, 0, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Carapace (head)
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(s * 1.1, 0, s * 0.7, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(s * 0.8, -s * 0.1, s * 1.2, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Claws
    for (const side of [-1, 1]) {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(s * 1.7, side * s * 0.5, s * 0.5, s * 0.2, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.ellipse(s * 1.8, side * s * 0.45, s * 0.35, s * 0.13, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(0.5, s * 0.08);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const lx = s * (0.5 - i * 0.5);
        ctx.beginPath();
        ctx.moveTo(lx, side * s * 0.3);
        ctx.lineTo(lx - s * 0.1, side * s * 0.7);
        ctx.stroke();
      }
    }

    // Eyes
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 1.4, -s * 0.15, Math.max(0.8, s * 0.08), 0, Math.PI * 2);
    ctx.arc(s * 1.4, s * 0.15, Math.max(0.8, s * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }

  private drawEel(ctx: CanvasRenderingContext2D, s: number, phase: number, base: string, dark: string, light: string): void {
    // Body (wavy thick stroke)
    ctx.strokeStyle = base;
    ctx.lineWidth = s * 0.65;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = -s * 2 + t * s * 4.5;
      const y = Math.sin(t * Math.PI * 2.5 + phase) * s * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight stripe
    ctx.strokeStyle = light;
    ctx.lineWidth = s * 0.15;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = -s * 2 + t * s * 4.5;
      const y = Math.sin(t * Math.PI * 2.5 + phase) * s * 0.5 - s * 0.15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Head detail
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(s * 2.3, Math.sin(Math.PI * 2.5 + phase) * s * 0.5, s * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 2.4, Math.sin(Math.PI * 2.5 + phase) * s * 0.5 - s * 0.05, Math.max(0.8, s * 0.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 2.45, Math.sin(Math.PI * 2.5 + phase) * s * 0.5 - s * 0.05, Math.max(0.5, s * 0.05), 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPattern(ctx: CanvasRenderingContext2D, type: string, patColor: string, s: number): void {
    ctx.fillStyle = patColor;
    ctx.strokeStyle = patColor;
    ctx.globalAlpha = 0.4;
    if (type === "spots") {
      ctx.beginPath();
      ctx.arc(-s * 0.4, -s * 0.3, s * 0.2, 0, Math.PI * 2);
      ctx.arc(s * 0.3, s * 0.15, s * 0.22, 0, Math.PI * 2);
      ctx.arc(s * 0.0, -s * 0.35, s * 0.15, 0, Math.PI * 2);
      ctx.arc(-s * 0.1, s * 0.3, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "stripes") {
      ctx.lineWidth = Math.max(1, s * 0.2);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.5, -s * 0.75);
        ctx.quadraticCurveTo(i * s * 0.5 + s * 0.1, 0, i * s * 0.5, s * 0.75);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}
