import { safeInvoke, safeListen, safeCheckUpdate } from "./tauri-mock";
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
import { AchievementManager, Achievement } from "./sim/achievements";
import { AchievementToast } from "./ui/achievements";
import { AchievementsPanel } from "./ui/achievements-panel";

const pond = new PondCanvas();
const cursor = new CursorManager();
const weatherMgr = new WeatherManager();
const weatherRenderer = new WeatherRenderer();
pond.setWeather(weatherRenderer);

const achievements = new AchievementManager();
achievements.load();
const toast = new AchievementToast();
const achievementsPanel = new AchievementsPanel(achievements);

function showTip(msg: string): void {
  let tip = document.getElementById("status-tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "status-tip";
    tip.style.cssText = [
      "position:fixed;top:20px;left:50%;transform:translateX(-50%)",
      "padding:8px 24px;border-radius:20px",
      "background:rgba(8,18,28,0.85);backdrop-filter:blur(12px)",
      "border:1px solid rgba(140,200,220,0.2)",
      "color:#5cc4d4;font-size:14px;font-weight:600",
      "z-index:300;pointer-events:none;transition:opacity 0.3s",
    ].join(";");
    document.body.appendChild(tip);
  }
  tip.textContent = msg;
  tip.style.opacity = "1";
  setTimeout(() => { tip.style.opacity = "0"; }, 1500);
}

function spawnPos(): { x: number; y: number } {
  const clip = pond.scene.getClipRegion(window.innerWidth, window.innerHeight);
  if (clip) {
    return {
      x: clip.x + clip.width * (0.3 + Math.random() * 0.4),
      y: clip.y + clip.height * (0.3 + Math.random() * 0.4),
    };
  }
  return {
    x: window.innerWidth * (0.25 + Math.random() * 0.5),
    y: window.innerHeight * (0.25 + Math.random() * 0.5),
  };
}

function showUnlock(a: Achievement | null): void {
  if (!a) return;
  toast.show(a);
  if (a.rewardType === "creature") {
    const p = spawnPos();
    if (a.rewardName === "锦鲤") {
      const c = pond.addCreature(CreatureSpecies.Fish, p.x, p.y, "锦鲤");
      c.color = [0.9, 0.75, 0.2];
      c.size *= 1.5;
      c.adultSize *= 1.5;
    } else if (a.rewardName === "金蛙") {
      const c = pond.addCreature(CreatureSpecies.Frog, p.x, p.y, "金蛙");
      c.color = [0.85, 0.7, 0.15];
    }
  } else if (a.rewardType === "decor") {
    const p = spawnPos();
    if (a.rewardName === "金石") {
      pond.placeDecoration(p.x, p.y, DecorationType.Stone, "#e6bf33");
    } else if (a.rewardName === "珊瑚") {
      pond.placeDecoration(p.x, p.y, DecorationType.Rock);
    }
  }
}

pond.setOnEaten(() => showUnlock(achievements.recordFeed()));
pond.setOnMature(() => showUnlock(achievements.recordHealthyAdult()));

let lastDay = new Date().getDate();
function checkDayBoundary(): void {
  const day = new Date().getDate();
  if (day !== lastDay) {
    lastDay = day;
    showUnlock(achievements.recordDay());
  }
}

function updateWeatherUI(): void {
  const icons: Record<string, string> = {
    clear: "☀",
    rain: "🌧",
    snow: "❄",
    fog: "🌫",
  };
  const texts: Record<string, string> = {
    clear: "晴天",
    rain: `雨天 (${Math.round(weatherMgr.rainIntensity * 100)}%)`,
    snow: "雪天",
    fog: "雾天",
  };
  settings.updateWeatherDisplay(
    icons[weatherMgr.condition] ?? "☀",
    texts[weatherMgr.condition] ?? "晴天",
  );
}

async function refreshWeather(): Promise<void> {
  await weatherMgr.fetchWeather();
  weatherRenderer.setWeather(weatherMgr.condition, weatherMgr.rainIntensity);
  updateWeatherUI();
}

refreshWeather().catch(console.error);
setInterval(() => { refreshWeather().catch(console.error); }, 10 * 60 * 1000);

async function refreshIcons(): Promise<void> {
  const icons = (await safeInvoke("get_desktop_icons")) as IconRect[];
  pond.updateIcons(icons);
}

refreshIcons().catch(console.error);
setInterval(() => { refreshIcons().catch(console.error); }, 2000);

// Spawn demo creatures
(function spawnDemo() {
  const names: [CreatureSpecies, string][] = [
    [CreatureSpecies.Fish, "Nemo"],
    [CreatureSpecies.Fish, "Dory"],
    [CreatureSpecies.Fish, "Bubbles"],
    [CreatureSpecies.Frog, "Kermit"],
    [CreatureSpecies.Frog, "Tad"],
    [CreatureSpecies.Crab, "Crabby"],
    [CreatureSpecies.Crab, "Snappy"],
    [CreatureSpecies.Lobster, "Larry"],
    [CreatureSpecies.Lobster, "Pinchy"],
    [CreatureSpecies.Eel, "Slither"],
    [CreatureSpecies.Eel, "Zap"],
  ];
  for (const [sp, name] of names) {
    const p = spawnPos();
    pond.addCreature(sp, p.x, p.y, name);
  }
})();

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
  onModeChange: (mode) => { pond.scene.mode = mode; },
  onShapeChange: (shape) => { pond.scene.setPondShape(shape); },
  onWaterColorChange: (shallow, deep) => { pond.water.setColors(shallow, deep); },
  onWeatherLocationChange: (lat, lon) => {
    weatherMgr.setLocation(lat, lon);
    refreshWeather().then(() => updateWeatherUI());
  },
});

// Food type selection
let currentFoodType = "pellet";
document.querySelectorAll<HTMLButtonElement>(".food-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".food-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFoodType = btn.dataset.food || "pellet";
  });
});

// Weather city search
const wlocSearch = document.getElementById("wloc-search") as HTMLInputElement | null;
if (wlocSearch) {
  wlocSearch.addEventListener("input", async () => {
    const q = wlocSearch.value.trim();
    const results = document.getElementById("wloc-results");
    if (!results) return;
    if (q.length < 2) { results.innerHTML = ""; return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=zh`);
      const data = await res.json();
      results.innerHTML = (data.results || []).map((r: any) =>
        `<button class="btn btn-sm" style="width:100%;margin:2px 0;text-align:left;" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}">${r.name}, ${r.country || ""}</button>`
      ).join("");
      results.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const lat = parseFloat(btn.dataset.lat || "0");
          const lon = parseFloat(btn.dataset.lon || "0");
          weatherMgr.setLocation(lat, lon);
          refreshWeather().then(() => updateWeatherUI());
          showTip("位置: " + btn.dataset.name);
          results.innerHTML = "";
          wlocSearch.value = "";
        });
      });
    } catch { results.innerHTML = ""; }
  });
}

async function toggleInteraction(): Promise<void> {
  const interactive = (await safeInvoke("toggle_interaction")) as boolean;
  document.body.classList.toggle("interactive", interactive);
  const btn = document.getElementById("btn-interact");
  if (btn) btn.classList.toggle("active", interactive);
  const cur = document.getElementById("custom-cursor");
  if (cur && !interactive) cur.classList.remove("visible");
  if (!interactive) {
    cursor.setTool(null);
    pond.setPlayActive(false);
  }
}

// Toolbar
document.getElementById("btn-settings")?.addEventListener("click", () => {
  settings.toggle();
  settings.syncState(pond.scene.mode, pond.scene.pondShape);
  document.getElementById("btn-settings")?.classList.toggle("active");
});
document.getElementById("btn-editor")?.addEventListener("click", () => {
  editor.toggle();
  document.getElementById("btn-editor")?.classList.toggle("active");
});
document.getElementById("btn-achievements")?.addEventListener("click", () => {
  achievementsPanel.toggle();
  document.getElementById("btn-achievements")?.classList.toggle("active");
});
document.getElementById("btn-interact")?.addEventListener("click", () => {
  toggleInteraction().then(() => {
    const on = document.body.classList.contains("interactive");
    showTip(on ? "交互模式已开启" : "交互模式已关闭");
  });
});
document.getElementById("btn-scene")?.addEventListener("click", () => {
  pond.scene.toggleMode();
  settings.syncState(pond.scene.mode, pond.scene.pondShape);
  showTip(pond.scene.mode === "pond" ? "池塘模式" : "沉浸模式");
});
document.getElementById("btn-tool")?.addEventListener("click", () => {
  cursor.cycleTool();
  pond.setPlayActive(cursor.currentTool === InteractionTool.Play);
  const labels: Record<string, string> = { feed: "投喂", play: "嬉戏", place: "放置" };
  const btn = document.getElementById("btn-tool");
  if (btn) {
    btn.textContent = cursor.currentTool ? labels[cursor.currentTool] : "🔧";
    btn.classList.toggle("active", !!cursor.currentTool);
  }
  showTip(cursor.currentTool ? `工具: ${labels[cursor.currentTool!]}` : "工具已关闭");
});

safeListen("hotkey-toggle", () => { toggleInteraction().catch(console.error); });
safeListen("open-settings", () => {
  settings.toggle();
  settings.syncState(pond.scene.mode, pond.scene.pondShape);
});
safeListen("open-achievements", () => { achievementsPanel.toggle(); });
safeListen("check-updates", () => { checkForUpdates(); });

// Mouse: custom cursor + play
window.addEventListener("mousemove", (e) => {
  cursor.updateMouse(e.clientX, e.clientY);
  const cur = document.getElementById("custom-cursor");
  if (cur && document.body.classList.contains("interactive")) {
    cur.classList.add("visible");
    cur.style.left = e.clientX + "px";
    cur.style.top = e.clientY + "px";
    cur.className = "visible" + (cursor.currentTool ? " " + cursor.currentTool : "");
  }
  if (document.body.classList.contains("interactive") && cursor.currentTool === InteractionTool.Play) {
    pond.setPlayActive(true);
    pond.moveMouse(e.clientX, e.clientY);
  }
});

// Click: feed / place
window.addEventListener("click", (e) => {
  if (!document.body.classList.contains("interactive")) return;
  const target = e.target as HTMLElement;
  if (target.closest?.("#editor, #settings, #achievements-panel, #toolbar")) return;
  if (cursor.currentTool === InteractionTool.Feed) {
    pond.dropFood(e.clientX, e.clientY, currentFoodType);
  }
  if (cursor.currentTool === InteractionTool.Place) {
    const types = Object.values(DecorationType);
    const type = types[Math.floor(Math.random() * types.length)];
    pond.placeDecoration(e.clientX, e.clientY, type);
  }
  if (!cursor.currentTool) {
    showTip("先点 🔧 选择工具");
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
    achievementsPanel.close();
    return;
  }
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
  if (!document.body.classList.contains("interactive")) return;
  if (e.key === "s" || e.key === "S") {
    pond.scene.toggleMode();
    settings.syncState(pond.scene.mode, pond.scene.pondShape);
  }
  if (e.key === "e" || e.key === "E") editor.toggle();
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
  checkDayBoundary();
  pond.render(timeMs);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

async function checkForUpdates(): Promise<void> {
  try {
    const update = (await safeCheckUpdate()) as { version: string } | null;
    console.log(update ? `Update: ${update.version}` : "Up to date");
  } catch { /* skip */ }
}
setTimeout(checkForUpdates, 5000);
