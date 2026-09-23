import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PondCanvas } from "./canvas";
import { CursorManager, InteractionTool } from "./cursor";
import { WeatherManager } from "./sim/weather";
import { WeatherRenderer } from "./renderer/weather";
import { DecorationType } from "./sim/decor";
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

pond.addFish(window.innerWidth * 0.3, window.innerHeight * 0.3, "Nemo");
pond.addFish(window.innerWidth * 0.5, window.innerHeight * 0.45, "Dory");
pond.addFish(window.innerWidth * 0.65, window.innerHeight * 0.55, "Bubbles");
pond.addFish(window.innerWidth * 0.4, window.innerHeight * 0.7, "Splash");

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
  if (!document.body.classList.contains("interactive")) return;
  if (e.key === "s" || e.key === "S") {
    pond.scene.toggleMode();
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
