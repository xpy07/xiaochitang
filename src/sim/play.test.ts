import { describe, it, expect } from "vitest";
import { PlayManager, Ripple } from "./play";

describe("Ripple", () => {
  it("starts with full radius", () => {
    const r = new Ripple(50, 50);
    expect(r.radius).toBeGreaterThan(0);
  });

  it("expands over time", () => {
    const r = new Ripple(50, 50);
    const initialRadius = r.radius;
    r.update(1);
    expect(r.radius).toBeGreaterThan(initialRadius);
  });

  it("fades over time", () => {
    const r = new Ripple(50, 50);
    const initialAlpha = r.alpha;
    r.update(1);
    expect(r.alpha).toBeLessThan(initialAlpha);
  });

  it("dies when alpha reaches 0", () => {
    const r = new Ripple(50, 50);
    for (let i = 0; i < 100; i++) r.update(0.5);
    expect(r.alive).toBe(false);
  });
});

describe("PlayManager", () => {
  it("records mouse position", () => {
    const pm = new PlayManager();
    pm.moveMouse(50, 60);
    expect(pm.mouseX).toBe(50);
    expect(pm.mouseY).toBe(60);
  });

  it("creates ripple on movement", () => {
    const pm = new PlayManager();
    pm.moveMouse(50, 50);
    pm.moveMouse(60, 60);
    expect(pm.ripples.length).toBeGreaterThan(0);
  });

  it("ripples expand and get cleaned up", () => {
    const pm = new PlayManager();
    pm.moveMouse(50, 50);
    for (let i = 0; i < 100; i++) pm.update(0.5);
    expect(pm.ripples.length).toBe(0);
  });

  it("active flag controls ripple creation", () => {
    const pm = new PlayManager();
    pm.active = false;
    pm.moveMouse(50, 50);
    pm.moveMouse(60, 60);
    expect(pm.ripples.length).toBe(0);
  });

  it("mouse speed is tracked", () => {
    const pm = new PlayManager();
    pm.moveMouse(50, 50);
    pm.moveMouse(55, 50);
    expect(pm.mouseSpeed).toBeGreaterThan(0);
  });
});
