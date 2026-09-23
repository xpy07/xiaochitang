import { describe, it, expect } from "vitest";
import { IconManager, IconRect } from "./icons";

describe("IconManager", () => {
  it("starts empty", () => {
    const im = new IconManager();
    expect(im.icons.length).toBe(0);
  });

  it("adds icon obstacle", () => {
    const im = new IconManager();
    im.add({ x: 50, y: 50, width: 40, height: 40 });
    expect(im.icons.length).toBe(1);
  });

  it("checks if point is inside obstacle", () => {
    const im = new IconManager();
    im.add({ x: 50, y: 50, width: 40, height: 40 });
    expect(im.isInside(60, 60)).toBe(true);
    expect(im.isInside(200, 200)).toBe(false);
  });

  it("returns avoidance vector for point near obstacle", () => {
    const im = new IconManager();
    im.add({ x: 50, y: 50, width: 40, height: 40 });
    const vec = im.getAvoidance(70, 50);
    expect(vec).not.toBeNull();
    expect(vec!.x).toBeGreaterThan(0); // push right away from obstacle
  });

  it("returns null avoidance when far from obstacles", () => {
    const im = new IconManager();
    im.add({ x: 50, y: 50, width: 40, height: 40 });
    const vec = im.getAvoidance(500, 500);
    expect(vec).toBeNull();
  });

  it("clears all icons", () => {
    const im = new IconManager();
    im.add({ x: 0, y: 0, width: 40, height: 40 });
    im.add({ x: 100, y: 100, width: 40, height: 40 });
    im.clear();
    expect(im.icons.length).toBe(0);
  });

  it("replaces all icons on update", () => {
    const im = new IconManager();
    im.add({ x: 0, y: 0, width: 40, height: 40 });
    im.update([{ x: 200, y: 200, width: 40, height: 40 }]);
    expect(im.icons.length).toBe(1);
    expect(im.icons[0].x).toBe(200);
  });
});
