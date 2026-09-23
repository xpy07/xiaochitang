import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PondCanvas } from "./canvas";
import { CursorManager, InteractionTool } from "./cursor";
import { WeatherManager } from "./sim/weather";
import { WeatherRenderer } from "./renderer/weather";
import { DecorationType } from "./sim/decor";
import { CreatureSpecies } from "./sim/species";
import { CustomCreatureManager, createCreatureFromConfig } from "./sim/custom";
import { CreatureEditor } from "./ui/editor";
import { SettingsPanel } from "./ui/settings";
import { IconRect } from "./sim/icons";

const pond = new PondCanvas();
const cursor = new CursorManager();
const weatherMgr = new WeatherManager();
const weatherRenderer = new WeatherRenderer();
pond.setWeather(weatherRenderer);

async function refreshWeather(): Promise<void> {
  await weatherMgr.fetchWeather();
  weatherRenderer.setWeather(weatherMgr.condition, weatherMgr.rainIntensity);
}

refreshWeather().catch(console.error);
setInterval(() => {
  refreshWeather().catch(console.error);
}, 10 * 60 * 1000);

async function refreshIcons(): Promise<void> {
  const icons = await invoke<IconRect[]>("get_desktop_icons");
  pond.updateIcons(icons);
}

refreshIcons().catch(console.error);
setInterval(() => {
  refreshIcons().catch(console.error);
}, 2000);

pond.addCreature(CreatureSpecies.Fish, window.innerWidth * 0.3, window.innerHeight * 0.3, "Nemo");
pond.addCreature(CreatureSpecies.Fish, window.innerWidth * 0.5, window.innerHeight * 0.45, "Dory");
pond.addCreature(CreatureSpecies.Fish, window.innerWidth * 0.65, window.innerHeight * 0.55, "Bubbles");
pond.addCreature(CreatureSpecies.Frog, window.innerWidth * 0.4, window.innerHeight * 0.7, "Kermit");
pond.addCreature(CreatureSpecies.Frog, window.innerWidth * 0.55, window.innerHeight * 0.35, "Tad");
pond.addCreature(CreatureSpecies.Crab, window.innerWidth * 0.2, window.innerHeight * 0.8, "Crabby");
pond.addCreature(CreatureSpecies.Crab, window.innerWidth * 0.75, window.innerHeight * 0.75, "Snappy");
pond.addCreature(CreatureSpecies.Lobster, window.innerWidth * 0.35, window.innerHeight * 0.85, "Larry");
pond.addCreature(CreatureSpecies.Lobster, window.innerWidth * 0.6, window.innerHeight * 0.9, "Pinchy");
pond.addCreature(CreatureSpecies.Eel, window.innerWidth * 0.45, window.innerHeight * 0.5, "Slither");
pond.addCreature(CreatureSpecies.Eel, window.innerWidth * 0.7, window.innerHeight * 0.4, "Zap");

function spawnPos(): { x: number; y: number } {
  return {
    x: window.innerWidth * (0.25 + Math.random() * 0.5),
    y: window.innerHeight * (0.25 + Math.random() * 0.5),
  };
}

const customMgr = new CustomCreatureManager();
customMgr.load();
for (const cfg of customMgr.configs) {
  const p = spawnPos();
  pond.addFish(createCreatureFromConfig(cfg, p.x, p.y));
}

const editor = new CreatureEditor({
  onSaveSpawn: (config) => {
    customMgr.save(config);
    const p = spawnPos();
    pond.addFish(createCreatureFromConfig(config, p.x, p.y));
  },
});

const settings = new SettingsPanel({
  onModeChange: (mode) => {
    pond.scene.mode = mode;
  },
  onShapeChange: (shape) => {
    pond.scene.setPondShape(shape);
  },
  onWaterColorChange: (shallow, deep) => {
    pond.water.setColors(shallow, deep);
  },
});

async function toggleInteraction(): Promise<void> {
  const interactive = await invoke<boolean>("toggle_interaction");
  document.body.classList.toggle("interactive", interactive);
  if (!interactive) {
    cursor.setTool(null);
    pond.setPlayActive(false);
  }
}

listen("hotkey-toggle", () => {
  toggleInteraction().catch(console.error);
});

window.addEventListener("mousemove", (e) => {
  cursor.updateMouse(e.clientX, e.clientY);
  if (
    document.body.classList.contains("interactive") &&
    cursor.currentTool === InteractionTool.Play
  ) {
    pond.setPlayActive(true);
    pond.moveMouse(e.clientX, e.clientY);
  }
});

window.addEventListener("click", (e) => {
  if (!document.body.classList.contains("interactive")) return;
  if ((e.target as HTMLElement).closest?.("#editor")) return;
  if ((e.target as HTMLElement).closest?.("#settings")) return;
  if (cursor.currentTool === InteractionTool.Feed) {
    pond.dropFood(e.clientX, e.clientY);
  }
  if (cursor.currentTool === InteractionTool.Place) {
    const types = Object.values(DecorationType);
    const type = types[Math.floor(Math.random() * types.length)];
    pond.placeDecoration(e.clientX, e.clientY, type);
  }
});

window.addEventListener("contextmenu", (e) => {
  if (!document.body.classList.contains("interactive")) return;
  if (cursor.currentTool === InteractionTool.Place) {
    e.preventDefault();
    pond.removeDecorationAt(e.clientX, e.clientY);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "Escape") {
    editor.close();
    settings.close();
    return;
  }
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
  if (!document.body.classList.contains("interactive")) return;
  if (e.key === "s" || e.key === "S") {
    pond.scene.toggleMode();
    settings.syncState(pond.scene.mode, pond.scene.pondShape);
  }
  if (e.key === "e" || e.key === "E") {
    editor.toggle();
  }
  if (e.key === "p" || e.key === "P") {
    settings.toggle();
    settings.syncState(pond.scene.mode, pond.scene.pondShape);
  }
  if (e.key === "Tab") {
    e.preventDefault();
    cursor.cycleTool();
    pond.setPlayActive(cursor.currentTool === InteractionTool.Play);
  }
});

function loop(timeMs: number): void {
  pond.render(timeMs);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
