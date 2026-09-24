import { SceneManager } from "./scene";
import { RenderEngine } from "./renderer/engine";
import { WaterRenderer } from "./renderer/water";
import { FishRenderer } from "./renderer/fish";
import { WeatherRenderer } from "./renderer/weather";
import { VERT_SRC, FRAG_SRC } from "./renderer/shaders";
import { ColorTint, DayCycleManager } from "./sim/time";
import { Fish, FishManager, Bounds } from "./sim/creatures";
import { CreatureFactory, CreatureSpecies } from "./sim/species";
import { FoodManager } from "./sim/feeding";
import { DecorationManager, DecorationType } from "./sim/decor";
import { DecorRenderer } from "./renderer/decor";
import { PlayManager } from "./sim/play";
import { RippleRenderer } from "./renderer/ripple";
import { IconManager, IconRect } from "./sim/icons";
import { LifeStage } from "./sim/creatures";

const clock = new Date();

export class CreatureLayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mgr = new FishManager();
  private foods = new FoodManager();
  private decorMgr = new DecorationManager();
  private play = new PlayManager();
  private icons = new IconManager();
  private renderer = new FishRenderer();
  private decorRenderer = new DecorRenderer();
  private rippleRenderer = new RippleRenderer();
  private weather: WeatherRenderer | null = null;
  private lastTime = 0;
  private matured = new WeakSet<Fish>();
  onEaten?: () => void;
  onMature?: () => void;

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

  addCreature(species: CreatureSpecies, x: number, y: number, name: string): Fish {
    const c = CreatureFactory.create(species, x, y, name);
    c.immortal = true;
    this.mgr.fish.push(c);
    return c;
  }

  addFish(f: Fish): void {
    f.immortal = true;
    this.mgr.fish.push(f);
  }

  dropFood(x: number, y: number, type: string = "pellet"): void {
    this.foods.drop(x, y, type);
  }

  placeDecoration(x: number, y: number, type: DecorationType, tint?: string): void {
    this.decorMgr.place(x, y, type, tint);
  }

  removeDecorationAt(x: number, y: number): void {
    const d = this.decorMgr.getAt(x, y);
    if (d) this.decorMgr.remove(d.id);
  }

  moveMouse(x: number, y: number): void {
    this.play.moveMouse(x, y);
  }

  setPlayActive(active: boolean): void {
    this.play.active = active;
  }

  setWeather(w: WeatherRenderer): void {
    this.weather = w;
  }

  setOnEaten(cb: () => void): void {
    this.foods.onEaten = cb;
  }

  updateIcons(rects: IconRect[]): void {
    this.icons.update(rects);
  }

  render(timeMs: number, w: number, h: number, bounds?: Bounds): void {
    const dt = this.lastTime
      ? Math.min((timeMs - this.lastTime) / 1000, 0.1)
      : 0.016;
    this.lastTime = timeMs;
    this.foods.update(dt, h);
    this.play.update(dt);
    const b = bounds ?? { minX: 0, minY: 0, maxX: w, maxY: h };
    this.mgr.update(
      dt,
      b,
      this.foods.foods,
      this.play.mouseX,
      this.play.mouseY,
      this.play.active,
      this.icons,
    );
    for (const f of this.mgr.fish) {
      if (f.stage === LifeStage.Adult && !this.matured.has(f)) {
        this.matured.add(f);
        this.onMature?.();
      }
    }
    this.ctx.clearRect(0, 0, w, h);
    for (const d of this.decorMgr.decorations) {
      this.decorRenderer.render(this.ctx, d);
    }
    // Draw food with type-specific visuals + fade-in
    for (const f of this.foods.foods) {
      const a = Math.min(1, f.opacity);
      this.ctx.globalAlpha = a;
      switch (f.type) {
        case "bread":
          this.ctx.fillStyle = "#e8c870";
          this.ctx.beginPath();
          this.ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#f0d890";
          this.ctx.beginPath();
          this.ctx.arc(f.x - 1, f.y - 1, 2, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        case "worm":
          this.ctx.strokeStyle = "#c87060";
          this.ctx.lineWidth = 3;
          this.ctx.lineCap = "round";
          this.ctx.beginPath();
          this.ctx.moveTo(f.x - 4, f.y);
          this.ctx.quadraticCurveTo(f.x, f.y + 3 * Math.sin(f.age * 5), f.x + 4, f.y);
          this.ctx.stroke();
          break;
        case "shrimp":
          this.ctx.fillStyle = "#f08070";
          this.ctx.beginPath();
          this.ctx.ellipse(f.x, f.y, 5, 3, 0.3, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#f0a090";
          this.ctx.beginPath();
          this.ctx.ellipse(f.x + 2, f.y - 1, 2, 1.5, 0.3, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        default: // pellet
          this.ctx.fillStyle = "#d4a040";
          this.ctx.beginPath();
          this.ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#f0d080";
          this.ctx.beginPath();
          this.ctx.arc(f.x - 1, f.y - 1, 2, 0, Math.PI * 2);
          this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }
    for (const f of this.mgr.fish) {
      this.renderer.render(this.ctx, f);
    }
    for (const r of this.icons.icons) {
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      this.ctx.fillStyle = "rgba(85, 107, 47, 0.35)";
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, r.width * 0.6, r.height * 0.5, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = "rgba(139, 90, 43, 0.3)";
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, r.width * 0.4, r.height * 0.35, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.rippleRenderer.render(this.ctx, this.play.ripples);
    if (this.weather) {
      this.weather.update(dt, w, h);
      this.weather.render(this.ctx, w, h);
    }
  }
}

export class PondCanvas {
  private canvas: HTMLCanvasElement;
  private engine: RenderEngine;
  water: WaterRenderer;
  private creatures = new CreatureLayer();
  private dayCycle = new DayCycleManager();
  private logicalW = 0;
  private logicalH = 0;
  private lightingHour = -1;
  private lightingTint: ColorTint = { r: 1, g: 1, b: 1 };
  private lightingBrightness = 1;
  scene: SceneManager;
  private bounds: Bounds = { minX: 0, minY: 0, maxX: 1920, maxY: 1080 };

  constructor() {
    this.canvas = document.getElementById("pond") as HTMLCanvasElement;
    this.engine = new RenderEngine(this.canvas);
    this.water = new WaterRenderer(this.engine);
    this.scene = new SceneManager();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.engine.init(VERT_SRC, FRAG_SRC);
  }

  addCreature(species: CreatureSpecies, x: number, y: number, name: string): Fish {
    return this.creatures.addCreature(species, x, y, name);
  }

  addFish(f: Fish): void {
    this.creatures.addFish(f);
  }

  dropFood(x: number, y: number, type: string = "pellet"): void {
    this.creatures.dropFood(x, y, type);
  }

  placeDecoration(x: number, y: number, type: DecorationType, tint?: string): void {
    this.creatures.placeDecoration(x, y, type, tint);
  }

  removeDecorationAt(x: number, y: number): void {
    this.creatures.removeDecorationAt(x, y);
  }

  moveMouse(x: number, y: number): void {
    this.creatures.moveMouse(x, y);
  }

  setPlayActive(active: boolean): void {
    this.creatures.setPlayActive(active);
  }

  setWeather(w: WeatherRenderer): void {
    this.creatures.setWeather(w);
  }

  setOnEaten(cb: () => void): void {
    this.creatures.setOnEaten(cb);
  }

  setOnMature(cb: () => void): void {
    this.creatures.onMature = cb;
  }

  updateIcons(rects: IconRect[]): void {
    this.creatures.updateIcons(rects);
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

    // Compute pond bounds from scene clip
    const clip = this.scene.getClipRegion(this.logicalW, this.logicalH);
    if (clip) {
      this.bounds = {
        minX: clip.x + 10,
        minY: clip.y + 10,
        maxX: clip.x + clip.width - 10,
        maxY: clip.y + clip.height - 10,
      };
    } else {
      this.bounds = {
        minX: 0,
        minY: 0,
        maxX: this.logicalW,
        maxY: this.logicalH,
      };
    }

    this.water.setLighting(this.lightingTint, this.lightingBrightness);
    this.water.setScene(this.scene, this.logicalW, this.logicalH);
    this.water.update(timeMs);
    this.water.render(this.canvas.width, this.canvas.height);
    this.creatures.render(timeMs, this.logicalW, this.logicalH, this.bounds);
  }
}
