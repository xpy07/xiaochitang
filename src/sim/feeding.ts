export class Food {
  x: number;
  y: number;
  nutrition: number = 5;
  consumed: boolean = false;
  sinkSpeed: number = 8;
  type: string = "pellet";
  age: number = 0;
  opacity: number = 0;

  constructor(x: number, y: number, type: string = "pellet") {
    this.x = x;
    this.y = y;
    this.type = type;
    switch (type) {
      case "bread": this.nutrition = 3; this.sinkSpeed = 5; break;
      case "worm": this.nutrition = 8; this.sinkSpeed = 15; break;
      case "shrimp": this.nutrition = 10; this.sinkSpeed = 12; break;
      default: this.nutrition = 5; this.sinkSpeed = 8;
    }
  }

  update(dt: number): void {
    this.y += this.sinkSpeed * dt;
    this.age += dt;
    if (this.opacity < 1) this.opacity = Math.min(1, this.opacity + dt * 4);
  }

  eat(amount: number): void {
    this.nutrition -= amount;
    if (this.nutrition <= 0) {
      this.nutrition = 0;
      this.consumed = true;
    }
  }
}

export class FoodManager {
  foods: Food[] = [];
  onEaten?: () => void;

  drop(x: number, y: number, type: string = "pellet"): void {
    this.foods.push(new Food(x, y, type));
  }

  update(dt: number, boundsH: number): void {
    for (const f of this.foods) {
      f.update(dt);
    }
    for (const f of this.foods) {
      if (f.consumed) this.onEaten?.();
    }
    this.foods = this.foods.filter((f) => !f.consumed && f.y < boundsH);
  }

  get count(): number {
    return this.foods.length;
  }
}
