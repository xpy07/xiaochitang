export enum InteractionTool {
  Feed = "feed",
  Play = "play",
  Place = "place",
}

const TOOL_ORDER: InteractionTool[] = [
  InteractionTool.Feed,
  InteractionTool.Play,
  InteractionTool.Place,
];

export class CursorManager {
  currentTool: InteractionTool | null = null;
  mousePos = { x: 0, y: 0 };

  setTool(tool: InteractionTool | null): void {
    this.currentTool = tool;
  }

  cycleTool(): void {
    if (!this.currentTool) {
      this.currentTool = TOOL_ORDER[0];
      return;
    }
    const idx = TOOL_ORDER.indexOf(this.currentTool);
    this.currentTool = TOOL_ORDER[(idx + 1) % TOOL_ORDER.length];
  }

  getCursorIcon(): string | null {
    return this.currentTool;
  }

  updateMouse(x: number, y: number): void {
    this.mousePos.x = x;
    this.mousePos.y = y;
  }
}
