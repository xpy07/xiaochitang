export enum SceneMode {
  Pond = "pond",
  Immersive = "immersive",
}

export enum PondShape {
  Circle = "circle",
  Oval = "oval",
  Irregular = "irregular",
  RoundedRect = "roundedRect",
}

export interface ClipRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: PondShape;
}

export class SceneManager {
  mode: SceneMode = SceneMode.Pond;
  pondShape: PondShape = PondShape.Circle;

  toggleMode(): void {
    this.mode =
      this.mode === SceneMode.Pond ? SceneMode.Immersive : SceneMode.Pond;
  }

  setPondShape(shape: PondShape): void {
    this.pondShape = shape;
  }

  getClipRegion(screenW: number, screenH: number): ClipRegion | null {
    if (this.mode === SceneMode.Immersive) return null;

    const cx = screenW / 2;
    const cy = screenH / 2;
    switch (this.pondShape) {
      case PondShape.Circle: {
        const r = Math.min(screenW, screenH) * 0.4;
        return { x: cx - r, y: cy - r, width: r * 2, height: r * 2, shape: PondShape.Circle };
      }
      case PondShape.Oval: {
        const rx = screenW * 0.38;
        const ry = screenH * 0.32;
        return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2, shape: PondShape.Oval };
      }
      case PondShape.RoundedRect: {
        const w = screenW * 0.7;
        const h = screenH * 0.6;
        return { x: cx - w / 2, y: cy - h / 2, width: w, height: h, shape: PondShape.RoundedRect };
      }
      case PondShape.Irregular: {
        const r = Math.min(screenW, screenH) * 0.42;
        // wider than tall to differentiate from circle
        return { x: cx - r * 1.2, y: cy - r * 0.8, width: r * 2.4, height: r * 1.6, shape: PondShape.Irregular };
      }
      default:
        return null;
    }
  }
}
