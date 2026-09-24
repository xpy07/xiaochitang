import { Decoration, DecorationType } from "../sim/decor";

export class DecorRenderer {
  render(ctx: CanvasRenderingContext2D, d: Decoration): void {
    ctx.save();
    ctx.translate(d.x, d.y);

    switch (d.type) {
      case DecorationType.Rock:
        this.drawRock(ctx, d);
        break;
      case DecorationType.Bridge:
        this.drawBridge(ctx, d);
        break;
      case DecorationType.Lotus:
        this.drawLotus(ctx, d);
        break;
      case DecorationType.Stone:
        this.drawStone(ctx, d);
        break;
    }

    ctx.restore();
  }

  private drawRock(ctx: CanvasRenderingContext2D, d: Decoration): void {
    const w = d.width;
    const h = d.height;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(3, 3, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main rock body (irregular)
    ctx.fillStyle = d.tint;
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, 0);
    ctx.quadraticCurveTo(-w * 0.5, -h * 0.4, -w * 0.15, -h * 0.5);
    ctx.quadraticCurveTo(w * 0.2, -h * 0.55, w * 0.4, -h * 0.15);
    ctx.quadraticCurveTo(w * 0.5, h * 0.1, w * 0.3, h * 0.4);
    ctx.quadraticCurveTo(0, h * 0.5, -w * 0.3, h * 0.35);
    ctx.quadraticCurveTo(-w * 0.5, h * 0.2, -w * 0.45, 0);
    ctx.fill();

    // Highlight facet
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.25);
    ctx.quadraticCurveTo(w * 0.1, -h * 0.4, w * 0.3, -h * 0.1);
    ctx.quadraticCurveTo(w * 0.1, -h * 0.1, -w * 0.1, -h * 0.05);
    ctx.fill();

    // Shadow facet
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, h * 0.1);
    ctx.quadraticCurveTo(-w * 0.1, h * 0.35, w * 0.2, h * 0.3);
    ctx.quadraticCurveTo(-w * 0.05, h * 0.1, -w * 0.2, 0);
    ctx.fill();

    // Moss
    ctx.fillStyle = "rgba(80,120,60,0.3)";
    ctx.beginPath();
    ctx.arc(-w * 0.1, -h * 0.2, w * 0.1, 0, Math.PI * 2);
    ctx.arc(w * 0.15, -h * 0.1, w * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Border for visibility
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, 0);
    ctx.quadraticCurveTo(-w * 0.5, -h * 0.4, -w * 0.15, -h * 0.5);
    ctx.quadraticCurveTo(w * 0.2, -h * 0.55, w * 0.4, -h * 0.15);
    ctx.stroke();
  }

  private drawBridge(ctx: CanvasRenderingContext2D, d: Decoration): void {
    const w = d.width;
    const h = d.height;

    // Shadow under bridge
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w, h);

    // Arch shape
    ctx.fillStyle = "#6B4226";
    ctx.beginPath();
    ctx.moveTo(-w / 2, h / 3);
    ctx.quadraticCurveTo(0, -h * 1.2, w / 2, h / 3);
    ctx.lineTo(w / 2, h / 2);
    ctx.quadraticCurveTo(0, -h * 0.8, -w / 2, h / 2);
    ctx.fill();

    // Planks
    ctx.fillStyle = "#8B6534";
    for (let i = -3; i <= 3; i++) {
      const px = i * w * 0.12;
      const py = -h * 0.4 + Math.abs(i) * h * 0.08;
      ctx.fillRect(px - w * 0.04, py, w * 0.08, h * 0.35);
    }

    // Railings
    ctx.strokeStyle = "#5A3A1A";
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, side * h * 0.2);
      ctx.quadraticCurveTo(0, side * h * 0.6, w * 0.4, side * h * 0.2);
      ctx.stroke();
      // Posts
      for (let i = -1; i <= 1; i++) {
        const px = i * w * 0.25;
        const py = -h * 0.3 + Math.abs(i) * h * 0.1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + h * 0.3);
        ctx.stroke();
      }
    }

    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h * 0.1);
    ctx.quadraticCurveTo(0, -h * 0.8, w * 0.3, -h * 0.1);
    ctx.quadraticCurveTo(0, -h * 0.5, -w * 0.3, -h * 0.1);
    ctx.fill();
  }

  private drawLotus(ctx: CanvasRenderingContext2D, d: Decoration): void {
    const r = d.radius;

    // Pad (lily pad)
    ctx.fillStyle = "#2D7A3A";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0.15, Math.PI * 2 - 0.15);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Pad veins
    ctx.strokeStyle = "#1D5A2A";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const angle = 0.3 + (i / 5) * (Math.PI * 2 - 0.6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r * 0.8, Math.sin(angle) * r * 0.8);
      ctx.stroke();
    }

    // Pad highlight
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Flower (if pad is big enough)
    if (r > 10) {
      const petals = 5;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
        ctx.fillStyle = i % 2 === 0 ? "#FFB6C1" : "#FF69B4";
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * r * 0.25,
          Math.sin(angle) * r * 0.25 - 1,
          r * 0.18, r * 0.1,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      // Center
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(0, -1, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawStone(ctx: CanvasRenderingContext2D, d: Decoration): void {
    const r = d.radius;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.arc(2, 2, r, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = d.tint;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.9, 0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.9, -r * 0.7, r, 0);
    ctx.quadraticCurveTo(r * 0.7, r * 0.8, 0, r * 0.75);
    ctx.quadraticCurveTo(-r * 0.8, r * 0.7, -r, 0);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.2, r * 0.4, r * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Shadow side
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(r * 0.15, r * 0.2, r * 0.4, r * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Border for visibility
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.9, 0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.9, -r * 0.7, r, 0);
    ctx.stroke();
  }
}
