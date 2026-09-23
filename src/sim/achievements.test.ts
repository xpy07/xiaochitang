import { describe, it, expect, beforeEach } from "vitest";
import { AchievementManager, Achievement } from "./achievements";

describe("AchievementManager", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    } as any;
  });

  it("starts with no unlocked achievements", () => {
    const am = new AchievementManager();
    expect(am.unlocked.size).toBe(0);
  });

  it("has predefined achievements", () => {
    const am = new AchievementManager();
    expect(am.achievements.length).toBeGreaterThan(0);
  });

  it("tracks feeding metric", () => {
    const am = new AchievementManager();
    am.recordFeed();
    expect(am.metrics.totalFeeds).toBe(1);
  });

  it("tracks days kept", () => {
    const am = new AchievementManager();
    am.recordDay();
    expect(am.metrics.daysKept).toBe(1);
  });

  it("tracks healthy adults", () => {
    const am = new AchievementManager();
    am.recordHealthyAdult();
    expect(am.metrics.healthyAdults).toBe(1);
  });

  it("unlocks achievement when threshold met", () => {
    const am = new AchievementManager();
    for (let i = 0; i < 100; i++) am.recordFeed();
    expect(am.isUnlocked("feed_100")).toBe(true);
  });

  it("does not unlock before threshold", () => {
    const am = new AchievementManager();
    for (let i = 0; i < 50; i++) am.recordFeed();
    expect(am.isUnlocked("feed_100")).toBe(false);
  });

  it("persists unlocks to localStorage", () => {
    const am = new AchievementManager();
    for (let i = 0; i < 100; i++) am.recordFeed();
    const am2 = new AchievementManager();
    am2.load();
    expect(am2.isUnlocked("feed_100")).toBe(true);
  });

  it("returns newly unlocked achievement", () => {
    const am = new AchievementManager();
    for (let i = 0; i < 99; i++) am.recordFeed();
    const unlocked = am.recordFeed();
    expect(unlocked).not.toBeNull();
    expect(unlocked!.id).toBe("feed_100");
  });

  it("returns 锦鲤 for feed_100", () => {
    const am = new AchievementManager();
    expect(am.getReward("feed_100")).toBe("锦鲤");
  });

  it("returns 金石 for feed_500", () => {
    const am = new AchievementManager();
    expect(am.getReward("feed_500")).toBe("金石");
  });

  it("returns 金蛙 for days_30", () => {
    const am = new AchievementManager();
    expect(am.getReward("days_30")).toBe("金蛙");
  });

  it("returns 珊瑚 for adult_15", () => {
    const am = new AchievementManager();
    expect(am.getReward("adult_15")).toBe("珊瑚");
  });
});
