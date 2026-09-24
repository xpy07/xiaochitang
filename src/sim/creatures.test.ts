import { describe, it, expect, vi } from "vitest";
import { Fish, FishManager, LifeStage, Bounds } from "./creatures";
import { IconManager } from "./icons";

function B(w: number, h: number): Bounds {
  return { minX: 0, minY: 0, maxX: w, maxY: h };
}

describe("Fish", () => {
  it("starts as juvenile", () => {
    const fish = new Fish(0, 0, "test");
    expect(fish.stage).toBe(LifeStage.Juvenile);
  });

  it("has initial size less than adult size", () => {
    const fish = new Fish(0, 0, "test");
    expect(fish.size).toBeLessThan(fish.adultSize);
  });

  it("grows over time", () => {
    const fish = new Fish(0, 0, "test");
    const initialSize = fish.size;
    fish.grow(10);
    expect(fish.size).toBeGreaterThan(initialSize);
  });

  it("reaches adult stage at full size", () => {
    const fish = new Fish(0, 0, "test");
    for (let i = 0; i < 100; i++) fish.grow(100);
    expect(fish.stage).toBe(LifeStage.Adult);
  });

  it("ages and eventually dies", () => {
    const fish = new Fish(0, 0, "test");
    expect(fish.alive).toBe(true);
    for (let i = 0; i < 500; i++) fish.tick(1, B(100, 100));
    expect(fish.alive).toBe(false);
  });

  it("moves within bounds", () => {
    const fish = new Fish(50, 50, "test");
    for (let i = 0; i < 100; i++) fish.update(0.016, B(100, 100));
    expect(fish.x).toBeGreaterThanOrEqual(0);
    expect(fish.x).toBeLessThanOrEqual(100);
    expect(fish.y).toBeGreaterThanOrEqual(0);
    expect(fish.y).toBeLessThanOrEqual(100);
  });

  it("changes direction randomly", () => {
    const fish = new Fish(50, 50, "test");
    for (let i = 0; i < 50; i++) fish.update(0.016, B(100, 100));
    expect(fish.alive).toBe(true);
  });
});

describe("Fish food-seeking", () => {
  function makeFood(x: number, y: number) {
    return {
      x,
      y,
      nutrition: 5,
      consumed: false,
      eat(amount: number) {
        this.nutrition -= amount;
        if (this.nutrition <= 0) this.consumed = true;
      },
    };
  }

  it("moves toward food within range", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    const food = makeFood(100, 50);
    food.nutrition = 1000;
    for (let i = 0; i < 20; i++) fish.update(0.1, B(600, 600), [food]);
    expect(Math.hypot(food.x - fish.x, food.y - fish.y)).toBeLessThan(15);
  });

  it("eats food when within 10px", () => {
    const fish = new Fish(50, 50, "test");
    const food = makeFood(55, 50);
    fish.update(0.016, B(600, 600), [food]);
    expect(food.nutrition).toBeLessThan(5);
  });

  it("ignores food beyond 150px", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    const food = makeFood(500, 50);
    for (let i = 0; i < 10; i++) fish.update(0.016, B(600, 600), [food]);
    expect(food.nutrition).toBe(5);
    expect(Math.hypot(food.x - fish.x, food.y - fish.y)).toBeGreaterThan(140);
  });

  it("eats nearest food first", () => {
    const fish = new Fish(50, 50, "test");
    const near = makeFood(53, 50);
    const far = makeFood(58, 50);
    fish.update(0.016, B(600, 600), [far, near]);
    expect(near.nutrition).toBe(4);
    expect(far.nutrition).toBe(5);
  });

  it("FishManager passes food to fish", () => {
    const fm = new FishManager();
    const fish = fm.addFish(50, 50, "A");
    fish.speed = 50;
    const food = makeFood(80, 50);
    food.nutrition = 1000;
    for (let i = 0; i < 30; i++) fm.update(0.1, B(600, 600), [food]);
    expect(food.nutrition).toBeLessThan(1000);
  });
});

describe("Fish play reaction", () => {
  it("moves toward mouse when curious", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    fish.direction = Math.PI / 2;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    try {
      fish.update(0.1, B(600, 600), undefined, 100, 50, true);
    } finally {
      spy.mockRestore();
    }
    expect(fish.x).toBeGreaterThan(50);
  });

  it("flees from mouse when scared", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    fish.direction = Math.PI / 2;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.9);
    try {
      fish.update(0.1, B(600, 600), undefined, 100, 50, true);
    } finally {
      spy.mockRestore();
    }
    expect(fish.x).toBeLessThan(50);
  });

  it("ignores play when inactive", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    fish.direction = Math.PI / 2;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.9);
    try {
      fish.update(0.1, B(600, 600), undefined, 100, 50, false);
    } finally {
      spy.mockRestore();
    }
    expect(fish.x).toBeCloseTo(50);
    expect(fish.y).toBeGreaterThan(50);
  });

  it("ignores mouse beyond 100px", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    fish.direction = Math.PI / 2;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    try {
      fish.update(0.1, B(600, 600), undefined, 300, 50, true);
    } finally {
      spy.mockRestore();
    }
    expect(fish.x).toBeCloseTo(50);
    expect(fish.y).toBeGreaterThan(50);
  });

  it("food takes priority over play", () => {
    function makeFood(x: number, y: number) {
      return {
        x,
        y,
        nutrition: 5,
        consumed: false,
        eat(amount: number) {
          this.nutrition -= amount;
          if (this.nutrition <= 0) this.consumed = true;
        },
      };
    }
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    fish.direction = Math.PI / 2;
    const food = makeFood(100, 50);
    food.nutrition = 1000;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.9);
    try {
      fish.update(0.1, B(600, 600), [food], 10, 50, true);
    } finally {
      spy.mockRestore();
    }
    expect(fish.x).toBeGreaterThan(50);
  });

  it("FishManager passes play position to fish", () => {
    const fm = new FishManager();
    const fish = fm.addFish(50, 50, "A");
    fish.speed = 50;
    fish.direction = Math.PI / 2;
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    try {
      fm.update(0.1, B(600, 600), undefined, 100, 50, true);
    } finally {
      spy.mockRestore();
    }
    expect(fish.x).toBeGreaterThan(50);
  });
});

describe("FishManager", () => {
  it("creates fish at given position", () => {
    const fm = new FishManager();
    const fish = fm.addFish(50, 50, "Nemo");
    expect(fish.x).toBe(50);
    expect(fish.y).toBe(50);
    expect(fish.name).toBe("Nemo");
  });

  it("tracks multiple fish", () => {
    const fm = new FishManager();
    fm.addFish(10, 10, "A");
    fm.addFish(20, 20, "B");
    fm.addFish(30, 30, "C");
    expect(fm.fish.length).toBe(3);
  });

  it("updates all fish", () => {
    const fm = new FishManager();
    fm.addFish(50, 50, "A");
    fm.addFish(60, 60, "B");
    fm.update(0.016, B(100, 100));
    expect(fm.fish.length).toBe(2);
  });

  it("removes dead fish", () => {
    const fm = new FishManager();
    const fish = fm.addFish(50, 50, "Old");
    for (let i = 0; i < 500; i++) fish.tick(1, B(100, 100));
    fm.update(0.016, B(100, 100));
    expect(fm.fish.length).toBe(0);
  });

  it("fish count getter works", () => {
    const fm = new FishManager();
    expect(fm.count).toBe(0);
    fm.addFish(0, 0, "A");
    expect(fm.count).toBe(1);
  });
});

describe("Fish icon avoidance", () => {
  it("steers away from obstacle when nearby", () => {
    const fish = new Fish(50, 70, "test");
    fish.speed = 50;
    fish.direction = 0;
    const im = new IconManager();
    im.add({ x: 80, y: 50, width: 40, height: 40 });
    fish.update(0.1, B(600, 600), undefined, undefined, undefined, undefined, im);
    expect(fish.direction).not.toBe(0);
  });

  it("does not enter icon obstacle", () => {
    const fish = new Fish(50, 70, "test");
    fish.speed = 50;
    fish.direction = 0;
    const im = new IconManager();
    im.add({ x: 80, y: 50, width: 40, height: 40 });
    for (let i = 0; i < 40; i++) {
      fish.update(0.05, B(600, 600), undefined, undefined, undefined, undefined, im);
    }
    expect(im.isInside(fish.x, fish.y)).toBe(false);
  });

  it("moves normally with empty icon manager", () => {
    const fish = new Fish(50, 50, "test");
    fish.speed = 50;
    fish.direction = 0;
    const im = new IconManager();
    fish.update(0.1, B(600, 600), undefined, undefined, undefined, undefined, im);
    expect(fish.x).toBeGreaterThan(50);
  });

  it("FishManager passes iconManager to fish", () => {
    const fm = new FishManager();
    const fish = fm.addFish(50, 70, "A");
    fish.speed = 50;
    fish.direction = 0;
    const im = new IconManager();
    im.add({ x: 80, y: 50, width: 40, height: 40 });
    for (let i = 0; i < 40; i++) {
      fm.update(0.05, B(600, 600), undefined, undefined, undefined, undefined, im);
    }
    expect(im.isInside(fish.x, fish.y)).toBe(false);
  });
});
