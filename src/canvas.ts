import { SceneManager } from "./scene";
import { RenderEngine } from "./renderer/engine";
import { WaterRenderer } from "./renderer/water";
import { FishRenderer } from "./renderer/fish";
import { WeatherRenderer } from "./renderer/weather";
import { VERT_SRC, FRAG_SRC } from "./renderer/shaders";
import { ColorTint, DayCycleManager } from "./sim/time";
import { Fish, FishManager } from "./sim/creatures";
import { FoodManager } from "./sim/feeding";

const clock = new Date();

export class CreatureLayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mgr = new FishManager();
  private foods = new FoodManager();
  private renderer = new FishRenderer();
  private weather: WeatherRenderer | null = null;
  private lastTime = 0;

  constructor() {
    this.canvas = document.getElementById("creatures") as HTMLCanvasElement;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas not supported");
    this.ctx = ctx;
  }

  resize(w: number, h: number, dpr: number): void {
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  addFish(x: number, y: number, name: string): Fish {
    return this.mgr.addFish(x, y, name);
  }

  dropFood(x: number, y: number): void {
    this.foods.drop(x, y);
  }

  setWeather(w: WeatherRenderer): void {
    this.weather = w;
  }

  render(timeMs: number, w: number, h: number): void {
    const dt = this.lastTime
      ? Math.min((timeMs - this.lastTime) / 1000, 0.1)
      : 0.016;
    this.lastTime = timeMs;
    this.foods.update(dt, h);
    this.mgr.update(dt, w, h, this.foods.foods);
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = "#8b5a2b";
    for (const f of this.foods.foods) {
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    for (const f of this.mgr.fish) {
      this.renderer.render(this.ctx, f);
    }
    if (this.weather) {
      this.weather.update(dt, w, h);
      this.weather.render(this.ctx, w, h);
    }
  }
}

export class PondCanvas {
  private canvas: HTMLCanvasElement;
  private engine: RenderEngine;
  private water: WaterRenderer;
  private creatures = new CreatureLayer();
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

  addFish(x: number, y: number, name: string): Fish {
    return this.creatures.addFish(x, y, name);
  }

  dropFood(x: number, y: number): void {
    this.creatures.dropFood(x, y);
  }

  setWeather(w: WeatherRenderer): void {
    this.creatures.setWeather(w);
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.logicalW = window.innerWidth;
    this.logicalH = window.innerHeight;
    this.canvas.width = this.logicalW * dpr;
    this.canvas.height = this.logicalH * dpr;
    this.canvas.style.width = this.logicalW + "px";
    this.canvas.style.height = this.logicalH + "px";
    this.creatures.resize(this.logicalW, this.logicalH, dpr);
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
    this.creatures.render(timeMs, this.logicalW, this.logicalH);
  }
}
