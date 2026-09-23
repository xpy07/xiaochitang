import { CreatureSpecies, Creature, CreatureFactory } from "./species";

export enum PatternType {
  Solid = "solid",
  Spots = "spots",
  Stripes = "stripes",
  Gradient = "gradient",
}

export class CustomCreatureConfig {
  name: string;
  species: CreatureSpecies;
  bodySize: number = 1.0;
  baseColor: string = "#FF8C00";
  patternType: PatternType = PatternType.Solid;
  patternColor: string = "#FFFFFF";

  constructor(name: string, species: CreatureSpecies) {
    this.name = name;
    this.species = species;
  }

  toJSON(): object {
    return {
      name: this.name, species: this.species, bodySize: this.bodySize,
      baseColor: this.baseColor, patternType: this.patternType, patternColor: this.patternColor,
    };
  }

  static fromJSON(data: any): CustomCreatureConfig {
    const c = new CustomCreatureConfig(data.name, data.species);
    c.bodySize = data.bodySize ?? 1.0;
    c.baseColor = data.baseColor ?? "#FF8C00";
    c.patternType = data.patternType ?? PatternType.Solid;
    c.patternColor = data.patternColor ?? "#FFFFFF";
    return c;
  }
}

export class CustomCreatureManager {
  configs: CustomCreatureConfig[] = [];

  save(config: CustomCreatureConfig): void {
    this.configs.push(config);
    this.persist();
  }

  remove(name: string): void {
    this.configs = this.configs.filter((c) => c.name !== name);
    this.persist();
  }

  getByName(name: string): CustomCreatureConfig | null {
    return this.configs.find((c) => c.name === name) ?? null;
  }

  load(): void {
    try {
      const data = localStorage.getItem("fishpond_custom_creatures");
      if (data) {
        this.configs = JSON.parse(data).map(CustomCreatureConfig.fromJSON);
      }
    } catch {
      this.configs = [];
    }
  }

  private persist(): void {
    localStorage.setItem("fishpond_custom_creatures", JSON.stringify(this.configs.map((c) => c.toJSON())));
  }
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function createCreatureFromConfig(
  config: CustomCreatureConfig,
  x: number,
  y: number,
): Creature {
  const c = CreatureFactory.create(config.species, x, y, config.name);
  c.color = hexToRgb(config.baseColor);
  c.size *= config.bodySize;
  c.adultSize *= config.bodySize;
  c.patternType = config.patternType;
  c.patternColor = hexToRgb(config.patternColor);
  return c;
}
