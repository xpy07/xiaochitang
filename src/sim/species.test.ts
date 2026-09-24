import { describe, it, expect } from "vitest";
import { Creature, CreatureSpecies, CreatureFactory, LifeStage } from "./species";

describe("Creature", () => {
  it("fish swims freely", () => {
    const c = CreatureFactory.create(CreatureSpecies.Fish, 50, 50, "Nemo");
    expect(c.species).toBe(CreatureSpecies.Fish);
    expect(c.movementType).toBe("swim");
  });

  it("frog starts as tadpole", () => {
    const c = CreatureFactory.create(CreatureSpecies.Frog, 50, 50, "Kermit");
    expect(c.species).toBe(CreatureSpecies.Frog);
    expect(c.isTadpole).toBe(true);
  });

  it("tadpole becomes frog after growth", () => {
    const c = CreatureFactory.create(CreatureSpecies.Frog, 50, 50, "Kermit");
    for (let i = 0; i < 200; i++) c.tick(1, { minX: 0, minY: 0, maxX: 200, maxY: 200 });
    expect(c.isTadpole).toBe(false);
  });

  it("immortal by default", () => {
    const c = CreatureFactory.create(CreatureSpecies.Fish, 50, 50, "test");
    expect(c.immortal).toBe(true);
  });

  it("crab crawls sideways", () => {
    const c = CreatureFactory.create(CreatureSpecies.Crab, 50, 50, "Crabby");
    expect(c.movementType).toBe("crawl");
  });

  it("lobster walks slowly", () => {
    const c = CreatureFactory.create(CreatureSpecies.Lobster, 50, 50, "Larry");
    expect(c.speed).toBeLessThan(30); // lobsters are slow
  });

  it("eel undulates (wavy movement)", () => {
    const c = CreatureFactory.create(CreatureSpecies.Eel, 50, 50, "Slither");
    expect(c.movementType).toBe("undulate");
  });

  it("each species has distinct default color", () => {
    const fish = CreatureFactory.create(CreatureSpecies.Fish, 0, 0, "a");
    const frog = CreatureFactory.create(CreatureSpecies.Frog, 0, 0, "b");
    const crab = CreatureFactory.create(CreatureSpecies.Crab, 0, 0, "c");
    expect(fish.color).not.toEqual(frog.color);
    expect(crab.color).not.toEqual(frog.color);
  });

  it("factory creates all species", () => {
    const species = [
      CreatureSpecies.Fish, CreatureSpecies.Frog,
      CreatureSpecies.Crab, CreatureSpecies.Lobster,
      CreatureSpecies.Eel,
    ];
    for (const s of species) {
      const c = CreatureFactory.create(s, 50, 50, "test");
      expect(c.species).toBe(s);
      expect(c.name).toBe("test");
    }
  });
});
