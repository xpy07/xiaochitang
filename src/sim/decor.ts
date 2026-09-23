export enum DecorationType {
  Rock = "rock",
  Bridge = "bridge",
  Lotus = "lotus",
  Stone = "stone",
}

let nextId = 1;

export class Decoration {
  id: number = nextId++;
  x: number;
  y: number;
  type: DecorationType;
  width: number;
  height: number;
  radius: number;
  tint: string = "#888";

  constructor(x: number, y: number, type: DecorationType, tint: string = "#888") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.tint = tint;
    switch (type) {
      case DecorationType.Rock:
        this.width = 40; this.height = 30; this.radius = 20;
        break;
      case DecorationType.Bridge:
        this.width = 120; this.height = 20; this.radius = 60;
        break;
      case DecorationType.Lotus:
        this.width = 25; this.height = 25; this.radius = 12;
        break;
      case DecorationType.Stone:
        this.width = 15; this.height = 15; this.radius = 8;
        break;
    }
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

export class DecorationManager {
  decorations: Decoration[] = [];

  place(x: number, y: number, type: DecorationType, tint?: string): Decoration {
    const d = new Decoration(x, y, type, tint);
    this.decorations.push(d);
    return d;
  }

  remove(id: number): void {
    this.decorations = this.decorations.filter((d) => d.id !== id);
  }

  getAt(x: number, y: number): Decoration | null {
    for (const d of this.decorations) {
      if (d.containsPoint(x, y)) return d;
    }
    return null;
  }

  get count(): number {
    return this.decorations.length;
  }
}
