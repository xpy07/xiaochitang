export enum LifeStage {
  Juvenile = "juvenile",
  Adult = "adult",
  Aging = "aging",
  Dead = "dead",
}

export enum CreatureSpecies {
  Fish = "fish",
  Frog = "frog",
  Crab = "crab",
  Lobster = "lobster",
  Eel = "eel",
}

export type MovementType = "swim" | "crawl" | "undulate";

export interface FoodTarget {
  x: number;
  y: number;
  consumed: boolean;
  eat(amount: number): void;
}

export interface AvoidanceSource {
  getAvoidance(px: number, py: number, margin?: number): { x: number; y: number } | null;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const ATTRACT_RANGE = 250;
const EAT_RANGE = 14;
const PLAY_RANGE = 120;
const FOOD_SPEED_BOOST = 2.2;

function distToEdge(x: number, y: number, b: Bounds): number {
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const rx = (b.maxX - b.minX) / 2;
  const ry = (b.maxY - b.minY) / 2;
  if (rx < 1 || ry < 1) return 0;
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return 1.0 - Math.sqrt(nx * nx + ny * ny);
}

export class Fish {
  x: number;
  y: number;
  name: string;
  direction: number = Math.random() * Math.PI * 2;
  speed: number = 20 + Math.random() * 30;
  size: number = 3;
  adultSize: number = 8 + Math.random() * 4;
  age: number = 0;
  maxAge: number = 3600 + Math.random() * 3600;
  alive: boolean = true;
  stage: LifeStage = LifeStage.Juvenile;
  color: [number, number, number] = [0.9, 0.5, 0.3];
  species: CreatureSpecies = CreatureSpecies.Fish;
  movementType: MovementType = "swim";
  patternType: string = "solid";
  patternColor: [number, number, number] = [1, 1, 1];
  isTadpole: boolean = false;
  phase: number = 0;
  immortal: boolean = true;
  fleeing: boolean = false;
  fleeTimer: number = 0;
  wobble: number = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, name: string) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = [
      0.5 + Math.random() * 0.5,
      0.3 + Math.random() * 0.5,
      0.2 + Math.random() * 0.5,
    ];
  }

  grow(dt: number): void {
    if (!this.alive) return;
    if (this.size < this.adultSize) {
      this.size = Math.min(this.adultSize, this.size + dt * 0.005);
    }
    if (this.size >= this.adultSize && this.stage === LifeStage.Juvenile) {
      this.stage = LifeStage.Adult;
    }
  }

  private advanceAge(dt: number): void {
    if (!this.alive || this.immortal) return;
    this.age += dt;
    if (this.age > this.maxAge * 0.7 && this.stage === LifeStage.Adult) {
      this.stage = LifeStage.Aging;
    }
    if (this.age >= this.maxAge) {
      this.stage = LifeStage.Dead;
      this.alive = false;
    }
  }

  tick(
    dt: number,
    bounds: Bounds,
    foods?: FoodTarget[],
    playX?: number,
    playY?: number,
    playActive?: boolean,
    icons?: AvoidanceSource,
  ): void {
    this.grow(dt * 60);
    this.advanceAge(dt * 60);
    this.update(dt, bounds, foods, playX, playY, playActive, icons);
  }

  update(
    dt: number,
    bounds: Bounds,
    foods?: FoodTarget[],
    playX?: number,
    playY?: number,
    playActive?: boolean,
    icons?: AvoidanceSource,
  ): void {
    if (!this.alive) return;
    this.wobble += dt * 3;

    let speedMul = 1;
    let target: FoodTarget | null = null;
    let bestDist = ATTRACT_RANGE;

    // Food seeking (highest priority)
    if (foods) {
      for (const f of foods) {
        if (f.consumed) continue;
        const d = Math.hypot(f.x - this.x, f.y - this.y);
        if (d < bestDist) {
          bestDist = d;
          target = f;
        }
      }
    }

    if (target) {
      const angle = Math.atan2(target.y - this.y, target.x - this.x);
      this.direction += (angle - this.direction) * Math.min(1, dt * 10);
      speedMul = FOOD_SPEED_BOOST;
      if (bestDist < EAT_RANGE) {
        target.eat(1);
      }
    } else if (
      playActive &&
      playX !== undefined &&
      playY !== undefined &&
      Math.hypot(playX - this.x, playY - this.y) < PLAY_RANGE
    ) {
      // Play reaction: curiosity vs flee with smooth transition
      const dist = Math.hypot(playX - this.x, playY - this.y);
      const isClose = dist < 50;

      if (this.fleeTimer > 0) {
        this.fleeTimer -= dt;
        this.fleeing = true;
        const awayAngle = Math.atan2(this.y - playY, this.x - playX);
        this.direction += (awayAngle - this.direction) * Math.min(1, dt * 8);
        speedMul = 1.8;
      } else if (isClose) {
        this.fleeing = true;
        this.fleeTimer = 0.8 + Math.random() * 0.5;
        const awayAngle = Math.atan2(this.y - playY, this.x - playX);
        this.direction = awayAngle;
        speedMul = 2.2;
      } else {
        this.fleeing = false;
        const towardAngle = Math.atan2(playY - this.y, playX - this.x);
        const wobbleOffset = Math.sin(this.wobble * 2) * 0.3;
        this.direction += (towardAngle + wobbleOffset - this.direction) * Math.min(1, dt * 3);
        speedMul = 0.7;
      }
    } else if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
    } else if (Math.random() < 0.015) {
      this.direction += (Math.random() - 0.5) * 0.8;
    }

    if (icons) {
      const avoid = icons.getAvoidance(this.x, this.y);
      if (avoid) {
        this.direction = Math.atan2(avoid.y, avoid.x);
      }
    }

    this.applyMotion(dt, bounds, speedMul);
  }

  protected applyMotion(dt: number, bounds: Bounds, speedMul: number = 1): void {
    if (this.movementType === "crawl" && this.y < bounds.maxY - 4) {
      this.direction = Math.atan2(bounds.maxY - this.y, Math.cos(this.direction) * 30 + 0.01);
    }

    const spd = this.speed * speedMul;
    let vx = Math.cos(this.direction) * spd * dt;
    let vy = Math.sin(this.direction) * spd * dt;

    if (this.movementType === "undulate") {
      this.phase += dt * 6;
      const wiggle = Math.sin(this.phase) * spd * 0.4 * dt;
      vx += -Math.sin(this.direction) * wiggle;
      vy += Math.cos(this.direction) * wiggle;
    }

    this.x += vx;
    this.y += vy;

    // Rectangular hard boundary
    const margin = this.size;
    if (this.x < bounds.minX + margin) {
      this.x = bounds.minX + margin;
      this.direction = Math.PI - this.direction;
    }
    if (this.x > bounds.maxX - margin) {
      this.x = bounds.maxX - margin;
      this.direction = Math.PI - this.direction;
    }
    if (this.y < bounds.minY + margin) {
      this.y = bounds.minY + margin;
      this.direction = -this.direction;
    }
    if (this.y > bounds.maxY - margin) {
      this.y = bounds.maxY - margin;
      if (this.movementType === "crawl") {
        this.direction = Math.cos(this.direction) >= 0 ? 0.05 : Math.PI - 0.05;
      } else {
        this.direction = -this.direction;
      }
    }

    // Elliptical soft guide: gently steer toward center if near edge (inside ellipse only)
    const edgeDist = distToEdge(this.x, this.y, bounds);
    if (edgeDist > 0 && edgeDist < 0.08) {
      const cx = (bounds.minX + bounds.maxX) / 2;
      const cy = (bounds.minY + bounds.maxY) / 2;
      const toCenter = Math.atan2(cy - this.y, cx - this.x);
      this.direction += (toCenter - this.direction) * 0.1;
    }
  }
}

export class FishManager {
  fish: Fish[] = [];

  addFish(x: number, y: number, name: string, immortal: boolean = true): Fish {
    const f = new Fish(x, y, name);
    f.immortal = immortal;
    this.fish.push(f);
    return f;
  }

  update(
    dt: number,
    bounds: Bounds,
    foods?: FoodTarget[],
    playX?: number,
    playY?: number,
    playActive?: boolean,
    icons?: AvoidanceSource,
  ): void {
    for (const f of this.fish) {
      f.tick(dt, bounds, foods, playX, playY, playActive, icons);
    }
    this.fish = this.fish.filter((f) => f.alive);
  }

  get count(): number {
    return this.fish.length;
  }
}
