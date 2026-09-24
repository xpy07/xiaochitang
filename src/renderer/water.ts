import { RenderEngine, RenderUniforms } from "./engine";
import { ColorTint } from "../sim/time";
import { SceneManager, PondShape } from "../scene";

const WATER_DEFAULTS: RenderUniforms = {
  time: 0,
  shallowColor: [0.1, 0.45, 0.55],
  deepColor: [0.02, 0.1, 0.25],
  waveStrength: 1.0,
  tint: { r: 1, g: 1, b: 1 },
  brightness: 1.0,
  clipCenter: [0.5, 0.5],
  clipSize: [0.4, 0.4],
  clipShape: 0,
  aspect: 1.0,
};

export class WaterRenderer {
  private engine: RenderEngine;
  private uniforms: RenderUniforms = { ...WATER_DEFAULTS };

  constructor(engine: RenderEngine) {
    this.engine = engine;
  }

  update(timeMs: number): void {
    this.uniforms.time = timeMs * 0.001;
  }

  setColors(shallow: [number, number, number], deep: [number, number, number]): void {
    this.uniforms.shallowColor = shallow;
    this.uniforms.deepColor = deep;
  }

  setLighting(tint: ColorTint, brightness: number): void {
    this.uniforms.tint = tint;
    this.uniforms.brightness = brightness;
  }

  setScene(scene: SceneManager, screenW: number, screenH: number): void {
    const clip = scene.getClipRegion(screenW, screenH);
    this.uniforms.aspect = screenW / screenH;

    if (!clip) {
      this.uniforms.clipShape = 0;
      return;
    }

    const cx = (clip.x + clip.width / 2) / screenW;
    const cy = 1.0 - (clip.y + clip.height / 2) / screenH;
    this.uniforms.clipCenter = [cx, cy];
    this.uniforms.clipSize = [clip.width / 2 / screenW, clip.height / 2 / screenH];

    switch (clip.shape) {
      case PondShape.Circle:
      case PondShape.Oval:
        this.uniforms.clipShape = 1;
        break;
      case PondShape.RoundedRect:
        this.uniforms.clipShape = 2;
        break;
      case PondShape.Irregular:
        this.uniforms.clipShape = 3;
        break;
    }
  }

  render(width: number, height: number): void {
    this.engine.render(this.uniforms, width, height);
  }
}
