import { describe, it, expect } from "vitest";
import { Fish, FishManager, LifeStage } from "./creatures";

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
    for (let i = 0; i < 500; i++) fish.tick(1, 100, 100);
    expect(fish.alive).toBe(false);
  });

  it("moves within bounds", () => {
    const fish = new Fish(50, 50, "test");
    for (let i = 0; i < 100; i++) fish.update(0.016, 100, 100);
    expect(fish.x).toBeGreaterThanOrEqual(0);
    expect(fish.x).toBeLessThanOrEqual(100);
    expect(fish.y).toBeGreaterThanOrEqual(0);
    expect(fish.y).toBeLessThanOrEqual(100);
  });

  it("changes direction randomly", () => {
    const fish = new Fish(50, 50, "test");
    for (let i = 0; i < 50; i++) fish.update(0.016, 100, 100);
    expect(fish.alive).toBe(true);
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
    fm.update(0.016, 100, 100);
    expect(fm.fish.length).toBe(2);
  });

  it("removes dead fish", () => {
    const fm = new FishManager();
    const fish = fm.addFish(50, 50, "Old");
    for (let i = 0; i < 500; i++) fish.tick(1, 100, 100);
    fm.update(0.016, 100, 100);
    expect(fm.fish.length).toBe(0);
  });

  it("fish count getter works", () => {
    const fm = new FishManager();
    expect(fm.count).toBe(0);
    fm.addFish(0, 0, "A");
    expect(fm.count).toBe(1);
  });
});
