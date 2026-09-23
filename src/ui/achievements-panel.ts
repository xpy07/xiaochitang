import { AchievementManager } from "../sim/achievements";

export class AchievementsPanel {
  private el: HTMLElement;
  private manager: AchievementManager;
  private open = false;

  constructor(manager: AchievementManager) {
    this.manager = manager;
    this.el = document.createElement("div");
    this.el.id = "achievements-panel";
    this.el.className = "achievements-panel glass-panel";
    document.body.appendChild(this.el);
  }

  toggle(): void {
    this.setOpen(!this.open);
  }

  close(): void {
    this.setOpen(false);
  }

  private setOpen(v: boolean): void {
    this.open = v;
    this.el.classList.toggle("open", v);
    if (v) this.render();
  }

  private render(): void {
    this.el.innerHTML =
      `<div class="panel-header"><h3>成就</h3></div><div class="ach-body"><ul>` +
      this.manager.achievements
        .map((a) => {
          const unlocked = this.manager.isUnlocked(a.id);
          const icon = unlocked ? "⭐" : "🔒";
          return (
            `<li class="${unlocked ? "unlocked" : "locked"}">` +
            `<div class="ach-icon">${icon}</div>` +
            `<div class="ach-info">` +
            `<strong>${a.name}</strong>` +
            `<span class="ach-desc">${a.description}</span>` +
            (a.rewardName
              ? `<span class="ach-reward">奖励: ${a.rewardName}</span>`
              : "") +
            `</div></li>`
          );
        })
        .join("") +
      `</ul></div>`;
  }
}
