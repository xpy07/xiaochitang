import { describe, it, expect } from "vitest";
import { Food, FoodManager } from "./feeding";

describe("Food", () => {
  it("starts with full nutrition", () => {
    const food = new Food(50, 50);
    expect(food.nutrition).toBeGreaterThan(0);
  });

  it("sinks over time", () => {
    const food = new Food(50, 50);
    const initialY = food.y;
    food.update(1);
    expect(food.y).toBeGreaterThan(initialY);
  });

  it("loses nutrition when eaten", () => {
    const food = new Food(50, 50);
    const initialNutrition = food.nutrition;
    food.eat(1);
    expect(food.nutrition).toBeLessThan(initialNutrition);
  });

  it("consumed when nutrition reaches 0", () => {
    const food = new Food(50, 50);
    food.eat(food.nutrition);
    expect(food.consumed).toBe(true);
  });
});

describe("FoodManager", () => {
  it("adds food at position", () => {
    const fm = new FoodManager();
    fm.drop(50, 50);
    expect(fm.foods.length).toBe(1);
    expect(fm.foods[0].x).toBe(50);
    expect(fm.foods[0].y).toBe(50);
  });

  it("removes consumed food", () => {
    const fm = new FoodManager();
    fm.drop(50, 50);
    fm.foods[0].eat(fm.foods[0].nutrition);
    fm.update(1, 1080);
    expect(fm.foods.length).toBe(0);
  });

  it("removes food that sinks below bounds", () => {
    const fm = new FoodManager();
    fm.drop(50, 0);
    for (let i = 0; i < 1000; i++) fm.update(1, 100);
    expect(fm.foods.length).toBe(0);
  });

  it("count getter works", () => {
    const fm = new FoodManager();
    expect(fm.count).toBe(0);
    fm.drop(50, 50);
    expect(fm.count).toBe(1);
  });
});
