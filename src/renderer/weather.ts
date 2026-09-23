import { WeatherCondition } from "../sim/weather";

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export class WeatherRenderer {
  private particles: Particle[] = [];
  private condition: WeatherCondition = WeatherCondition.Clear;
  private intensity: number = 0;

  setWeather(condition: WeatherCondition, intensity: number): void {
    this.condition = condition;
    this.intensity = intensity;
  }

  update(dt: number, w: number, h: number): void {
    const targetCount = Math.floor(this.intensity * 200);
    while (this.particles.length < targetCount) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        speed: 200 + Math.random() * 200,
        size: 1 + Math.random() * 2,
      });
    }
    while (this.particles.length > targetCount) {
      this.particles.pop();
    }

    for (const p of this.particles) {
      p.y += p.speed * dt;
      if (p.y > h) {
        p.y = -10;
        p.x = Math.random() * w;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (this.condition === WeatherCondition.Rain) {
      ctx.strokeStyle = "rgba(150, 180, 220, 0.5)";
      ctx.lineWidth = 1;
      for (const p of this.particles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 1, p.y + p.speed * 0.02);
        ctx.stroke();
      }
    } else if (this.condition === WeatherCondition.Snow) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (const p of this.particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.condition === WeatherCondition.Fog) {
      ctx.fillStyle = `rgba(200, 200, 200, ${0.15 * this.intensity})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
}
