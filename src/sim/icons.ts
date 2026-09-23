export interface IconRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class IconManager {
  icons: IconRect[] = [];

  add(rect: IconRect): void {
    this.icons.push(rect);
  }

  clear(): void {
    this.icons = [];
  }

  update(rects: IconRect[]): void {
    this.icons = [...rects];
  }

  isInside(px: number, py: number): boolean {
    for (const r of this.icons) {
      if (px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height) {
        return true;
      }
    }
    return false;
  }

  getAvoidance(px: number, py: number, margin: number = 60): { x: number; y: number } | null {
    for (const r of this.icons) {
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influenceDist = Math.max(r.width, r.height) / 2 + margin;
      if (dist < influenceDist) {
        const strength = (influenceDist - dist) / influenceDist;
        const d = dist || 1;
        let ux = dx / d;
        let uy = dy / d;
        if (dist === 0) {
          ux = 1;
          uy = 0;
        }
        // radial push away + tangential steer-around so fish swim around islands
        return {
          x: (ux - uy) * strength * 25,
          y: (uy + ux) * strength * 25,
        };
      }
    }
    return null;
  }
}
