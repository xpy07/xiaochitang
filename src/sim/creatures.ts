export enum LifeStage {
  Juvenile = "juvenile",
  Adult = "adult",
  Aging = "aging",
  Dead = "dead",
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
    if (!this.alive) return;
    this.age += dt;
    if (this.age > this.maxAge * 0.7 && this.stage === LifeStage.Adult) {
      this.stage = LifeStage.Aging;
    }
    if (this.age >= this.maxAge) {
      this.stage = LifeStage.Dead;
      this.alive = false;
    }
  }

  tick(dt: number, boundsW: number, boundsH: number): void {
    this.grow(dt * 60);
    this.advanceAge(dt * 60);
    this.update(dt, boundsW, boundsH);
  }

  update(dt: number, boundsW: number, boundsH: number): void {
    if (!this.alive) return;
    if (Math.random() < 0.02) {
      this.direction += (Math.random() - 0.5) * 1.5;
    }
    this.x += Math.cos(this.direction) * this.speed * dt;
    this.y += Math.sin(this.direction) * this.speed * dt;
    if (this.x < 0) {
      this.x = 0;
      this.direction = Math.PI - this.direction;
    }
    if (this.x > boundsW) {
      this.x = boundsW;
      this.direction = Math.PI - this.direction;
    }
    if (this.y < 0) {
      this.y = 0;
      this.direction = -this.direction;
    }
    if (this.y > boundsH) {
      this.y = boundsH;
      this.direction = -this.direction;
    }
  }
}

export class FishManager {
  fish: Fish[] = [];

  addFish(x: number, y: number, name: string): Fish {
    const f = new Fish(x, y, name);
    this.fish.push(f);
    return f;
  }

  update(dt: number, boundsW: number, boundsH: number): void {
    for (const f of this.fish) {
      f.tick(dt, boundsW, boundsH);
    }
    this.fish = this.fish.filter((f) => f.alive);
  }

  get count(): number {
    return this.fish.length;
  }
}
