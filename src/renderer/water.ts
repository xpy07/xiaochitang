import { RenderEngine, RenderUniforms } from "./engine";
import { ColorTint } from "../sim/time";

const WATER_DEFAULTS: RenderUniforms = {
  time: 0,
  shallowColor: [0.1, 0.45, 0.55],   // teal
  deepColor: [0.02, 0.1, 0.25],       // deep blue
  waveStrength: 1.0,
  tint: { r: 1, g: 1, b: 1 },
  brightness: 1.0,
};

export class WaterRenderer {
  private engine: RenderEngine;
  private uniforms: RenderUniforms = { ...WATER_DEFAULTS };

  constructor(engine: RenderEngine) {
    this.engine = engine;
  }

  update(timeMs: number): void {
    this.uniforms.time = timeMs * 0.001; // seconds
  }

  setColors(shallow: [number, number, number], deep: [number, number, number]): void {
    this.uniforms.shallowColor = shallow;
    this.uniforms.deepColor = deep;
  }

  setLighting(tint: ColorTint, brightness: number): void {
    this.uniforms.tint = tint;
    this.uniforms.brightness = brightness;
  }

  render(width: number, height: number): void {
    this.engine.render(this.uniforms, width, height);
  }
}
