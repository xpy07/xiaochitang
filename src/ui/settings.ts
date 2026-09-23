import { PondShape, SceneMode } from "../scene";

export type Vec3 = [number, number, number];

export interface SettingsCallbacks {
  onModeChange: (mode: SceneMode) => void;
  onShapeChange: (shape: PondShape) => void;
  onWaterColorChange: (shallow: Vec3, deep: Vec3) => void;
}

const SHAPES: [string, PondShape][] = [
  ["st-shape-circle", PondShape.Circle],
  ["st-shape-oval", PondShape.Oval],
  ["st-shape-irregular", PondShape.Irregular],
  ["st-shape-rect", PondShape.RoundedRect],
];

const COLORS: [string, Vec3, Vec3][] = [
  ["st-color-clear", [0.1, 0.45, 0.55], [0.02, 0.1, 0.25]],
  ["st-color-jade", [0.1, 0.5, 0.3], [0.02, 0.2, 0.1]],
  ["st-color-dusk", [0.3, 0.2, 0.5], [0.1, 0.05, 0.2]],
  ["st-color-deep", [0.05, 0.3, 0.5], [0.01, 0.05, 0.15]],
];

function btn(id: string): HTMLButtonElement {
  return document.getElementById(id) as HTMLButtonElement;
}

export class SettingsPanel {
  private panel: HTMLElement;
  private open = false;

  constructor(callbacks: SettingsCallbacks) {
    this.panel = document.getElementById("settings")!;

    btn("st-mode-pond").addEventListener("click", () => {
      callbacks.onModeChange(SceneMode.Pond);
      this.updateModeUI(SceneMode.Pond);
    });
    btn("st-mode-immersive").addEventListener("click", () => {
      callbacks.onModeChange(SceneMode.Immersive);
      this.updateModeUI(SceneMode.Immersive);
    });

    for (const [id, shape] of SHAPES) {
      btn(id).addEventListener("click", () => {
        callbacks.onShapeChange(shape);
        this.updateShapeUI(shape);
      });
    }

    for (const [id, shallow, deep] of COLORS) {
      btn(id).addEventListener("click", () => {
        callbacks.onWaterColorChange(shallow, deep);
        this.updateColorUI(id);
      });
    }

    btn("st-close").addEventListener("click", () => this.close());
  }

  toggle(): void {
    this.setOpen(!this.open);
  }

  close(): void {
    this.setOpen(false);
  }

  syncState(mode: SceneMode, shape: PondShape): void {
    this.updateModeUI(mode);
    this.updateShapeUI(shape);
  }

  private setOpen(v: boolean): void {
    this.open = v;
    this.panel.classList.toggle("open", v);
  }

  private updateModeUI(mode: SceneMode): void {
    btn("st-mode-pond").classList.toggle("active", mode === SceneMode.Pond);
    btn("st-mode-immersive").classList.toggle("active", mode === SceneMode.Immersive);
    for (const [id] of SHAPES) {
      btn(id).disabled = mode === SceneMode.Immersive;
    }
  }

  private updateShapeUI(shape: PondShape): void {
    for (const [id, s] of SHAPES) {
      btn(id).classList.toggle("active", s === shape);
    }
  }

  private updateColorUI(activeId: string): void {
    for (const [id] of COLORS) {
      btn(id).classList.toggle("active", id === activeId);
    }
  }
}
