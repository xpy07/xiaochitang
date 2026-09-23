import { describe, it, expect, vi, beforeEach } from "vitest";
import { WeatherManager, WeatherCondition } from "./weather";

describe("WeatherManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to clear weather", () => {
    const wm = new WeatherManager();
    expect(wm.condition).toBe(WeatherCondition.Clear);
  });

  it("parses Open-Meteo weather codes correctly", () => {
    const wm = new WeatherManager();
    expect(wm.parseWMO(0)).toBe(WeatherCondition.Clear);
    expect(wm.parseWMO(1)).toBe(WeatherCondition.Clear);
    expect(wm.parseWMO(2)).toBe(WeatherCondition.Clear);
    expect(wm.parseWMO(45)).toBe(WeatherCondition.Fog);
    expect(wm.parseWMO(51)).toBe(WeatherCondition.Rain);
    expect(wm.parseWMO(61)).toBe(WeatherCondition.Rain);
    expect(wm.parseWMO(71)).toBe(WeatherCondition.Snow);
    expect(wm.parseWMO(80)).toBe(WeatherCondition.Rain);
    expect(wm.parseWMO(95)).toBe(WeatherCondition.Rain);
  });

  it("has rain intensity", () => {
    const wm = new WeatherManager();
    wm.condition = WeatherCondition.Rain;
    wm.rainIntensity = 0.5;
    expect(wm.rainIntensity).toBe(0.5);
  });

  it("default rain intensity is 0", () => {
    const wm = new WeatherManager();
    expect(wm.rainIntensity).toBe(0);
  });

  it("parses rain intensity from WMO code", () => {
    const wm = new WeatherManager();
    // Light rain (51-55)
    expect(wm.getIntensityForWMO(51)).toBeLessThan(wm.getIntensityForWMO(65));
    // Heavy rain (65+)
    expect(wm.getIntensityForWMO(82)).toBe(1.0);
  });
});
