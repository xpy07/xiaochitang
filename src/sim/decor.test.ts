import { describe, it, expect } from "vitest";
import { Decoration, DecorationManager, DecorationType } from "./decor";

describe("Decoration", () => {
  it("creates with position and type", () => {
    const d = new Decoration(50, 60, DecorationType.Rock);
    expect(d.x).toBe(50);
    expect(d.y).toBe(60);
    expect(d.type).toBe(DecorationType.Rock);
  });

  it("has size based on type", () => {
    const rock = new Decoration(0, 0, DecorationType.Rock);
    const lotus = new Decoration(0, 0, DecorationType.Lotus);
    expect(rock.width).toBeGreaterThan(0);
    expect(lotus.width).toBeGreaterThan(0);
    expect(rock.height).toBeGreaterThan(0);
  });

  it("bridge is wider than tall", () => {
    const bridge = new Decoration(0, 0, DecorationType.Bridge);
    expect(bridge.width).toBeGreaterThan(bridge.height);
  });

  it("lotus floats and has radius", () => {
    const lotus = new Decoration(0, 0, DecorationType.Lotus);
    expect(lotus.radius).toBeGreaterThan(0);
  });
});

describe("DecorationManager", () => {
  it("adds decoration", () => {
    const dm = new DecorationManager();
    dm.place(50, 60, DecorationType.Rock);
    expect(dm.decorations.length).toBe(1);
  });

  it("tracks multiple decorations", () => {
    const dm = new DecorationManager();
    dm.place(10, 10, DecorationType.Rock);
    dm.place(50, 50, DecorationType.Bridge);
    dm.place(90, 90, DecorationType.Lotus);
    expect(dm.decorations.length).toBe(3);
  });

  it("removes decoration by id", () => {
    const dm = new DecorationManager();
    const d = dm.place(50, 50, DecorationType.Rock);
    dm.remove(d.id);
    expect(dm.decorations.length).toBe(0);
  });

  it("finds decoration at position", () => {
    const dm = new DecorationManager();
    dm.place(50, 50, DecorationType.Rock);
    expect(dm.getAt(55, 55)).not.toBeNull();
    expect(dm.getAt(200, 200)).toBeNull();
  });

  it("count getter works", () => {
    const dm = new DecorationManager();
    expect(dm.count).toBe(0);
    dm.place(50, 50, DecorationType.Rock);
    expect(dm.count).toBe(1);
  });
});
