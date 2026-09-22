import { SceneManager } from "./scene";
import { RenderEngine } from "./renderer/engine";
import { WaterRenderer } from "./renderer/water";
import { VERT_SRC, FRAG_SRC } from "./renderer/shaders";
import { ColorTint, DayCycleManager } from "./sim/time";

const clock = new Date();

export class PondCanvas {
  private canvas: HTMLCanvasElement;
  private engine: RenderEngine;
  private water: WaterRenderer;
  private dayCycle = new DayCycleManager();
  private logicalW = 0;
  private logicalH = 0;
  private lightingHour = -1;
  private lightingTint: ColorTint = { r: 1, g: 1, b: 1 };
  private lightingBrightness = 1;
  scene: SceneManager;

  constructor() {
    this.canvas = document.getElementById("pond") as HTMLCanvasElement;
    this.engine = new RenderEngine(this.canvas);
    this.water = new WaterRenderer(this.engine);
    this.scene = new SceneManager();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.engine.init(VERT_SRC, FRAG_SRC);
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.logicalW = window.innerWidth;
    this.logicalH = window.innerHeight;
    this.canvas.width = this.logicalW * dpr;
    this.canvas.height = this.logicalH * dpr;
    this.canvas.style.width = this.logicalW + "px";
    this.canvas.style.height = this.logicalH + "px";
  }

  render(timeMs: number): void {
    clock.setTime(Date.now());
    const hour = clock.getHours() + clock.getMinutes() / 60;
    if (hour !== this.lightingHour) {
      this.lightingHour = hour;
      this.lightingTint = this.dayCycle.getLightingTint(hour);
      this.lightingBrightness = this.dayCycle.getBrightness(hour);
    }
    this.water.setLighting(this.lightingTint, this.lightingBrightness);
    this.water.update(timeMs);
    this.water.render(this.canvas.width, this.canvas.height);
  }
}
