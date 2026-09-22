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

  it("pond mode returns a bounded clip region", () => {
    const sm = new SceneManager();
    const clip = sm.getClipRegion(1920, 1080);
    expect(clip).not.toBeNull();
    expect(clip!.width).toBeLessThanOrEqual(1920);
    expect(clip!.height).toBeLessThanOrEqual(1080);
  });

  it("circle shape returns circular clip (width === height)", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Circle);
    const clip = sm.getClipRegion(1000, 1000);
    expect(clip!.shape).toBe(PondShape.Circle);
    expect(clip!.width).toBeCloseTo(clip!.height);
  });

  it("irregular shape returns clip region with larger footprint", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Irregular);
    const clip = sm.getClipRegion(1000, 1000);
    expect(clip!.shape).toBe(PondShape.Irregular);
    expect(clip).not.toBeNull();
    expect(clip!.width).toBeGreaterThan(0);
    expect(clip!.height).toBeGreaterThan(0);
  });

  it("oval shape returns wider-than-tall clip on wide screens", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.Oval);
    const clip = sm.getClipRegion(2000, 1000);
    expect(clip!.shape).toBe(PondShape.Oval);
    expect(clip!.width).toBeGreaterThan(clip!.height);
  });

  it("roundedRect returns rectangular clip", () => {
    const sm = new SceneManager();
    sm.setPondShape(PondShape.RoundedRect);
    const clip = sm.getClipRegion(1000, 1000);
    expect(clip!.shape).toBe(PondShape.RoundedRect);
    expect(clip!.width).toBeCloseTo(700);
    expect(clip!.height).toBeCloseTo(600);
  });
});
