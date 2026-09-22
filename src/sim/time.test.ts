import { describe, it, expect } from "vitest";
import { DayCycleManager, TimeOfDay } from "./time";

describe("DayCycleManager", () => {
  it("classifies dawn (5-8am)", () => {
    const dc = new DayCycleManager();
    expect(dc.getTimeOfDay(6)).toBe(TimeOfDay.Dawn);
  });

  it("classifies day (8am-4pm)", () => {
    const dc = new DayCycleManager();
    expect(dc.getTimeOfDay(12)).toBe(TimeOfDay.Day);
  });

  it("classifies dusk (4-8pm)", () => {
    const dc = new DayCycleManager();
    expect(dc.getTimeOfDay(18)).toBe(TimeOfDay.Dusk);
  });

  it("classifies night (8pm-5am)", () => {
    const dc = new DayCycleManager();
    expect(dc.getTimeOfDay(23)).toBe(TimeOfDay.Night);
    expect(dc.getTimeOfDay(2)).toBe(TimeOfDay.Night);
  });

  it("returns warm tint for dawn", () => {
    const dc = new DayCycleManager();
    const tint = dc.getLightingTint(6);
    expect(tint.r).toBeGreaterThan(tint.b);
  });

  it("returns neutral tint for day", () => {
    const dc = new DayCycleManager();
    const tint = dc.getLightingTint(12);
    expect(tint.r).toBeCloseTo(1.0);
    expect(tint.g).toBeCloseTo(1.0);
    expect(tint.b).toBeCloseTo(1.0);
  });

  it("returns cool tint for night", () => {
    const dc = new DayCycleManager();
    const tint = dc.getLightingTint(23);
    expect(tint.b).toBeGreaterThan(tint.r);
    expect(tint.r).toBeLessThan(1.0);
  });

  it("returns warm-orange tint for dusk", () => {
    const dc = new DayCycleManager();
    const tint = dc.getLightingTint(18);
    expect(tint.r).toBeGreaterThan(tint.b);
  });

  it("brightness is lower at night than day", () => {
    const dc = new DayCycleManager();
    const dayBright = dc.getBrightness(12);
    const nightBright = dc.getBrightness(23);
    expect(dayBright).toBeGreaterThan(nightBright);
  });

  it("brightness peaks at noon", () => {
    const dc = new DayCycleManager();
    const noon = dc.getBrightness(12);
    const morning = dc.getBrightness(8);
    const evening = dc.getBrightness(16);
    expect(noon).toBeGreaterThanOrEqual(morning);
    expect(noon).toBeGreaterThanOrEqual(evening);
  });
});
