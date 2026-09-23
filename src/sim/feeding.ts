export class Food {
  x: number;
  y: number;
  nutrition: number = 5;
  consumed: boolean = false;
  sinkSpeed: number = 10;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number): void {
    this.y += this.sinkSpeed * dt;
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

  drop(x: number, y: number): void {
    this.foods.push(new Food(x, y));
  }

  update(dt: number, boundsH: number): void {
    for (const f of this.foods) {
      f.update(dt);
    }
    this.foods = this.foods.filter((f) => !f.consumed && f.y < boundsH);
  }

  get count(): number {
    return this.foods.length;
  }
}
