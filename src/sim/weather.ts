export enum WeatherCondition {
  Clear = "clear",
  Rain = "rain",
  Snow = "snow",
  Fog = "fog",
}

export class WeatherManager {
  condition: WeatherCondition = WeatherCondition.Clear;
  rainIntensity: number = 0;
  private lat: number = 39.9;
  private lon: number = 116.4;

  parseWMO(code: number): WeatherCondition {
    if (code === 45 || code === 48) return WeatherCondition.Fog;
    if (code >= 51 && code <= 67) return WeatherCondition.Rain;
    if (code >= 71 && code <= 77) return WeatherCondition.Snow;
    if (code >= 80 && code <= 82) return WeatherCondition.Rain;
    if (code >= 95) return WeatherCondition.Rain;
    return WeatherCondition.Clear;
  }

  getIntensityForWMO(code: number): number {
    if (code === 45 || code === 48) return 0.7;
    if (code >= 51 && code <= 55) return 0.3;
    if (code >= 56 && code <= 57) return 0.4;
    if (code >= 61 && code <= 63) return 0.5;
    if (code >= 65 && code <= 67) return 0.8;
    if (code >= 71 && code <= 77) return 0.5;
    if (code >= 80 && code <= 82) return 1.0;
    if (code >= 95) return 0.7;
    return 0;
  }

  async fetchWeather(): Promise<void> {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current_weather=true`
      );
      const data = await res.json();
      const code = data.current_weather?.weathercode ?? 0;
      this.condition = this.parseWMO(code);
      this.rainIntensity = this.getIntensityForWMO(code);
    } catch {
      // Network error — keep current weather
    }
  }

  setLocation(lat: number, lon: number): void {
    this.lat = lat;
    this.lon = lon;
  }
}
