export enum TimeOfDay {
  Dawn = "dawn",
  Day = "day",
  Dusk = "dusk",
  Night = "night",
}

export interface ColorTint {
  r: number;
  g: number;
  b: number;
}

export class DayCycleManager {
  getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 8) return TimeOfDay.Dawn;
    if (hour >= 8 && hour < 16) return TimeOfDay.Day;
    if (hour >= 16 && hour < 20) return TimeOfDay.Dusk;
    return TimeOfDay.Night;
  }

  getLightingTint(hour: number): ColorTint {
    switch (this.getTimeOfDay(hour)) {
      case TimeOfDay.Dawn:
        return { r: 1.0, g: 0.85, b: 0.7 };
      case TimeOfDay.Day:
        return { r: 1.0, g: 1.0, b: 1.0 };
      case TimeOfDay.Dusk:
        return { r: 1.0, g: 0.7, b: 0.5 };
      case TimeOfDay.Night:
        return { r: 0.4, g: 0.5, b: 0.7 };
    }
  }

  getBrightness(hour: number): number {
    switch (this.getTimeOfDay(hour)) {
      case TimeOfDay.Dawn:
        return 0.4 + (hour - 5) / 3 * 0.2; // 0.4→0.6 across dawn
      case TimeOfDay.Day:
        // peak at noon
        return 0.8 + 0.2 * Math.cos((hour - 12) / 8 * Math.PI);
      case TimeOfDay.Dusk:
        return 0.5 - (hour - 16) / 4 * 0.2; // 0.5→0.3 across dusk
      case TimeOfDay.Night:
        return 0.3;
    }
  }
}
