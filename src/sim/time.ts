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
        return 0.6;
      case TimeOfDay.Day:
        return 1.0;
      case TimeOfDay.Dusk:
        return 0.5;
      case TimeOfDay.Night:
        return 0.3;
    }
  }
}
