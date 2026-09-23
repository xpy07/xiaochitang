import { describe, it, expect, beforeEach } from "vitest";
import {
  CustomCreatureConfig,
  CustomCreatureManager,
  PatternType,
  createCreatureFromConfig,
  hexToRgb,
} from "./custom";
import { CreatureSpecies } from "./species";

beforeEach(() => {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  } as any;
});

describe("CustomCreatureConfig", () => {
  it("creates with name and species", () => {
    const c = new CustomCreatureConfig("Goldie", CreatureSpecies.Fish);
    expect(c.name).toBe("Goldie");
    expect(c.species).toBe(CreatureSpecies.Fish);
  });

  it("defaults to solid pattern", () => {
    const c = new CustomCreatureConfig("Test", CreatureSpecies.Fish);
    expect(c.patternType).toBe(PatternType.Solid);
  });

  it("has default size", () => {
    const c = new CustomCreatureConfig("Test", CreatureSpecies.Fish);
    expect(c.bodySize).toBeGreaterThan(0);
  });

  it("has default colors", () => {
    const c = new CustomCreatureConfig("Test", CreatureSpecies.Fish);
    expect(c.baseColor).toBeTruthy();
    expect(c.patternColor).toBeTruthy();
  });
});

describe("CustomCreatureManager", () => {
  it("saves custom config", () => {
    const cm = new CustomCreatureManager();
    const config = new CustomCreatureConfig("Goldie", CreatureSpecies.Fish);
    cm.save(config);
    expect(cm.configs.length).toBe(1);
  });

  it("retrieves config by name", () => {
    const cm = new CustomCreatureManager();
    cm.save(new CustomCreatureConfig("Goldie", CreatureSpecies.Fish));
    expect(cm.getByName("Goldie")).not.toBeNull();
    expect(cm.getByName("Missing")).toBeNull();
  });

  it("removes config", () => {
    const cm = new CustomCreatureManager();
    cm.save(new CustomCreatureConfig("Goldie", CreatureSpecies.Fish));
    cm.remove("Goldie");
    expect(cm.configs.length).toBe(0);
  });

  it("persists to localStorage", () => {
    const cm = new CustomCreatureManager();
    cm.save(new CustomCreatureConfig("Goldie", CreatureSpecies.Fish));

    const cm2 = new CustomCreatureManager();
    cm2.load();
    expect(cm2.configs.length).toBe(1);
    expect(cm2.configs[0].name).toBe("Goldie");
  });

  it("round-trips all fields through JSON", () => {
    const c = new CustomCreatureConfig("Round", CreatureSpecies.Eel);
    c.bodySize = 1.8;
    c.baseColor = "#123456";
    c.patternType = PatternType.Stripes;
    c.patternColor = "#ABCDEF";
    const cm = new CustomCreatureManager();
    cm.save(c);
    const cm2 = new CustomCreatureManager();
    cm2.load();
    const loaded = cm2.getByName("Round")!;
    expect(loaded.species).toBe(CreatureSpecies.Eel);
    expect(loaded.bodySize).toBe(1.8);
    expect(loaded.baseColor).toBe("#123456");
    expect(loaded.patternType).toBe(PatternType.Stripes);
    expect(loaded.patternColor).toBe("#ABCDEF");
  });
});

describe("hexToRgb", () => {
  it("parses full hex colors", () => {
    expect(hexToRgb("#FF0000")).toEqual([1, 0, 0]);
    expect(hexToRgb("#00FF00")).toEqual([0, 1, 0]);
    expect(hexToRgb("#0000FF")).toEqual([0, 0, 1]);
    expect(hexToRgb("#FFFFFF")).toEqual([1, 1, 1]);
  });

  it("parses shorthand hex colors", () => {
    expect(hexToRgb("#F00")).toEqual([1, 0, 0]);
    expect(hexToRgb("#fff")).toEqual([1, 1, 1]);
  });
});

describe("createCreatureFromConfig", () => {
  it("applies name and species", () => {
    const c = new CustomCreatureConfig("Goldie", CreatureSpecies.Frog);
    const creature = createCreatureFromConfig(c, 10, 20);
    expect(creature.name).toBe("Goldie");
    expect(creature.species).toBe(CreatureSpecies.Frog);
    expect(creature.x).toBe(10);
    expect(creature.y).toBe(20);
  });

  it("applies base color as rgb triple", () => {
    const c = new CustomCreatureConfig("Red", CreatureSpecies.Fish);
    c.baseColor = "#FF0000";
    const creature = createCreatureFromConfig(c, 0, 0);
    expect(creature.color[0]).toBeCloseTo(1);
    expect(creature.color[1]).toBeCloseTo(0);
    expect(creature.color[2]).toBeCloseTo(0);
  });

  it("scales size by bodySize", () => {
    const c = new CustomCreatureConfig("Big", CreatureSpecies.Fish);
    c.bodySize = 2.0;
    const creature = createCreatureFromConfig(c, 0, 0);
    expect(creature.size).toBeGreaterThanOrEqual(creature.size);
    expect(creature.adultSize).toBeGreaterThan(15);
    const c2 = new CustomCreatureConfig("Small", CreatureSpecies.Fish);
    c2.bodySize = 0.5;
    const small = createCreatureFromConfig(c2, 0, 0);
    expect(small.adultSize).toBeLessThan(creature.adultSize);
  });

  it("applies pattern type and color", () => {
    const c = new CustomCreatureConfig("Spotty", CreatureSpecies.Fish);
    c.patternType = PatternType.Spots;
    c.patternColor = "#00FF00";
    const creature = createCreatureFromConfig(c, 0, 0);
    expect(creature.patternType).toBe(PatternType.Spots);
    expect(creature.patternColor[1]).toBeCloseTo(1);
  });
});
