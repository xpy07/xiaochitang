import { CreatureSpecies } from "../sim/species";
import {
  CustomCreatureConfig,
  PatternType,
  createCreatureFromConfig,
} from "../sim/custom";
import { FishRenderer } from "../renderer/fish";
import { Fish } from "../sim/creatures";

export interface EditorCallbacks {
  onSaveSpawn: (config: CustomCreatureConfig) => void;
}

export class CreatureEditor {
  private panel: HTMLElement;
  private nameInput: HTMLInputElement;
  private speciesSelect: HTMLSelectElement;
  private sizeInput: HTMLInputElement;
  private baseColorInput: HTMLInputElement;
  private patternSelect: HTMLSelectElement;
  private patternColorInput: HTMLInputElement;
  private preview: HTMLCanvasElement;
  private renderer = new FishRenderer();
  private open = false;

  constructor(callbacks: EditorCallbacks) {
    this.panel = document.getElementById("editor") as HTMLElement;
    this.nameInput = document.getElementById("ed-name") as HTMLInputElement;
    this.speciesSelect = document.getElementById("ed-species") as HTMLSelectElement;
    this.sizeInput = document.getElementById("ed-size") as HTMLInputElement;
    this.baseColorInput = document.getElementById("ed-base-color") as HTMLInputElement;
    this.patternSelect = document.getElementById("ed-pattern") as HTMLSelectElement;
    this.patternColorInput = document.getElementById("ed-pattern-color") as HTMLInputElement;
    this.preview = document.getElementById("ed-preview") as HTMLCanvasElement;

    const refresh = () => this.updatePreview();
    for (const el of [
      this.nameInput,
      this.speciesSelect,
      this.sizeInput,
      this.baseColorInput,
      this.patternSelect,
      this.patternColorInput,
    ]) {
      el.addEventListener("input", refresh);
    }

    document.getElementById("ed-save")!.addEventListener("click", () => {
      callbacks.onSaveSpawn(this.readConfig());
      this.close();
    });
    document.getElementById("ed-cancel")!.addEventListener("click", () => this.close());
  }

  toggle(): void {
    this.setOpen(!this.open);
  }

  close(): void {
    this.setOpen(false);
  }

  private setOpen(v: boolean): void {
    this.open = v;
    this.panel.classList.toggle("open", v);
    if (v) this.updatePreview();
  }

  readConfig(): CustomCreatureConfig {
    const c = new CustomCreatureConfig(
      this.nameInput.value.trim() || "Unnamed",
      this.speciesSelect.value as CreatureSpecies,
    );
    c.bodySize = parseFloat(this.sizeInput.value) || 1;
    c.baseColor = this.baseColorInput.value;
    c.patternType = this.patternSelect.value as PatternType;
    c.patternColor = this.patternColorInput.value;
    return c;
  }

  private buildCreature(): Fish {
    return createCreatureFromConfig(this.readConfig(), 0, 0);
  }

  private updatePreview(): void {
    const creature = this.buildCreature();
    creature.x = this.preview.width / 2;
    creature.y = this.preview.height / 2;
    creature.direction = -0.25;
    const ctx = this.preview.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, this.preview.width, this.preview.height);
    this.renderer.render(ctx, creature);
  }
}
