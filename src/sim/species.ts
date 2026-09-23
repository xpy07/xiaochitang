import { CreatureSpecies, Fish } from "./creatures";

export { CreatureSpecies, LifeStage } from "./creatures";
export type { MovementType } from "./creatures";

const COLORS: Record<CreatureSpecies, [number, number, number]> = {
  [CreatureSpecies.Fish]: [0.9, 0.5, 0.3],
  [CreatureSpecies.Frog]: [0.2, 0.65, 0.25],
  [CreatureSpecies.Crab]: [0.85, 0.3, 0.2],
  [CreatureSpecies.Lobster]: [0.65, 0.2, 0.15],
  [CreatureSpecies.Eel]: [0.35, 0.4, 0.45],
};

const SPEEDS: Record<CreatureSpecies, [number, number]> = {
  [CreatureSpecies.Fish]: [20, 50],
  [CreatureSpecies.Frog]: [15, 30],
  [CreatureSpecies.Crab]: [5, 15],
  [CreatureSpecies.Lobster]: [3, 10],
  [CreatureSpecies.Eel]: [15, 30],
};

export class Creature extends Fish {
  constructor(species: CreatureSpecies, x: number, y: number, name: string) {
    super(x, y, name);
    this.species = species;
    this.color = COLORS[species];
    const [lo, hi] = SPEEDS[species];
    this.speed = lo + Math.random() * (hi - lo);
    switch (species) {
      case CreatureSpecies.Frog:
        this.isTadpole = true;
        this.movementType = "swim";
        break;
      case CreatureSpecies.Crab:
      case CreatureSpecies.Lobster:
        this.movementType = "crawl";
        break;
      case CreatureSpecies.Eel:
        this.movementType = "undulate";
        break;
      default:
        this.movementType = "swim";
    }
  }

  grow(dt: number): void {
    super.grow(dt);
    if (this.isTadpole && this.size >= this.adultSize) {
      this.isTadpole = false;
      this.movementType = "crawl";
      this.speed = 6 + Math.random() * 6;
    }
  }
}

export const CreatureFactory = {
  create(species: CreatureSpecies, x: number, y: number, name: string): Creature {
    return new Creature(species, x, y, name);
  },
};
