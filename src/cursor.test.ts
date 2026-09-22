import { describe, it, expect } from "vitest";
import { CursorManager, InteractionTool } from "./cursor";

describe("CursorManager", () => {
  it("starts with no tool selected", () => {
    const cm = new CursorManager();
    expect(cm.currentTool).toBeNull();
  });

  it("sets active tool", () => {
    const cm = new CursorManager();
    cm.setTool(InteractionTool.Feed);
    expect(cm.currentTool).toBe(InteractionTool.Feed);
  });

  it("cycles through tools in order", () => {
    const cm = new CursorManager();
    cm.setTool(InteractionTool.Feed);
    cm.cycleTool();
    expect(cm.currentTool).toBe(InteractionTool.Play);
    cm.cycleTool();
    expect(cm.currentTool).toBe(InteractionTool.Place);
    cm.cycleTool();
    expect(cm.currentTool).toBe(InteractionTool.Feed);
  });

  it("cycle from null starts at Feed", () => {
    const cm = new CursorManager();
    cm.cycleTool();
    expect(cm.currentTool).toBe(InteractionTool.Feed);
  });

  it("returns cursor icon name for each tool", () => {
    const cm = new CursorManager();
    cm.setTool(InteractionTool.Feed);
    expect(cm.getCursorIcon()).toBe("feed");
    cm.setTool(InteractionTool.Play);
    expect(cm.getCursorIcon()).toBe("play");
    cm.setTool(InteractionTool.Place);
    expect(cm.getCursorIcon()).toBe("place");
  });

  it("returns null icon when no tool", () => {
    const cm = new CursorManager();
    expect(cm.getCursorIcon()).toBeNull();
  });

  it("tracks mouse position", () => {
    const cm = new CursorManager();
    cm.updateMouse(100, 200);
    expect(cm.mousePos.x).toBe(100);
    expect(cm.mousePos.y).toBe(200);
  });

  it("setTool null clears tool", () => {
    const cm = new CursorManager();
    cm.setTool(InteractionTool.Feed);
    cm.setTool(null as any);
    expect(cm.currentTool).toBeNull();
  });
});
