import { describe, it, expect } from "vitest";
import { SceneManager, SceneMode, PondShape } from "./scene";

describe("SceneManager", () => {
  it("defaults to Pond mode with Circle shape", () => {
    const sm = new SceneManager();
    expect(sm.mode).toBe(SceneMode.Pond);
    expect(sm.pondShape).toBe(PondShape.Circle);
  });

  it("toggles between Pond and Immersive", () => {
    const sm = new SceneManager();
    sm.toggleMode();
    expect(sm.mode).toBe(SceneMode.Immersive);
    sm.toggleMode();
    expect(sm.mode).toBe(SceneMode.Pond);
  });

  it("changes pond shape", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Oval);
    expect(sm.pondShape).toBe(PondShape.Oval);
  });

  it("immersive mode returns full-screen clip (null)", () => {
    const sm = new SceneManager();
    sm.toggleMode();
    const clip = sm.getClipRegion(1920, 1080);
    expect(clip).toBeNull();
  });

  it("pond mode returns a bounded clip region within screen", () => {
    const sm = new SceneManager();
    const W = 1920, H = 1080;
    const clip = sm.getClipRegion(W, H);
    expect(clip).not.toBeNull();
    expect(clip!.x).toBeGreaterThanOrEqual(0);
    expect(clip!.y).toBeGreaterThanOrEqual(0);
    expect(clip!.x + clip!.width).toBeLessThanOrEqual(W);
    expect(clip!.y + clip!.height).toBeLessThanOrEqual(H);
  });

  it("circle shape returns circular clip (width === height)", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Circle);
    const clip = sm.getClipRegion(1000, 1000);
    expect(clip!.shape).toBe(PondShape.Circle);
    expect(clip!.width).toBeCloseTo(clip!.height);
  });

  it("irregular shape returns wider-than-tall clip", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Irregular);
    const clip = sm.getClipRegion(1000, 1000);
    expect(clip!.shape).toBe(PondShape.Irregular);
    expect(clip!.width).toBeGreaterThan(clip!.height);
  });

  it("circle on non-square screen uses min dimension", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Circle);
    const clip = sm.getClipRegion(2000, 1000);
    expect(clip!.width).toBeCloseTo(800); // 0.4 * min(2000,1000) * 2
    expect(clip!.width).toBeCloseTo(clip!.height);
  });

  it("oval on tall screen is taller than wide", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Oval);
    const clip = sm.getClipRegion(1000, 2000);
    expect(clip!.height).toBeGreaterThan(clip!.width);
  });

  it("oval shape returns wider-than-tall clip on wide screens", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Oval);
    const clip = sm.getClipRegion(2000, 1000);
    expect(clip!.shape).toBe(PondShape.Oval);
    expect(clip!.width).toBeGreaterThan(clip!.height);
  });

  it("roundedRect returns proportional rectangular clip", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.RoundedRect);
    const clip = sm.getClipRegion(1000, 1000);
    expect(clip!.shape).toBe(PondShape.RoundedRect);
    expect(clip!.width / 1000).toBeCloseTo(0.7);
    expect(clip!.height / 1000).toBeCloseTo(0.6);
  });
});
