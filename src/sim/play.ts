export class Ripple {
  x: number;
  y: number;
  radius: number = 2;
  alpha: number = 0.6;
  alive: boolean = true;
  maxRadius: number = 40;
  expandSpeed: number = 30;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number): void {
    this.radius += this.expandSpeed * dt;
    this.alpha -= dt * 0.5;
    if (this.alpha <= 0 || this.radius >= this.maxRadius) {
      this.alive = false;
    }
  }
}

export class PlayManager {
  ripples: Ripple[] = [];
  mouseX: number = 0;
  mouseY: number = 0;
  mouseSpeed: number = 0;
  active: boolean = true;
  private lastX: number = 0;
  private lastY: number = 0;
  private lastTime: number = 0;
  private minDist: number = 5;

  moveMouse(x: number, y: number): void {
    const now = performance.now();
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (now > this.lastTime) {
      this.mouseSpeed = dist / ((now - this.lastTime) / 1000);
    }

    if (this.active && dist >= this.minDist) {
      this.ripples.push(new Ripple(x, y));
    }

    this.lastX = x;
    this.lastY = y;
    this.lastTime = now;
    this.mouseX = x;
    this.mouseY = y;
  }

  update(dt: number): void {
    for (const r of this.ripples) {
      r.update(dt);
    }
    this.ripples = this.ripples.filter((r) => r.alive);
  }
}
