import { AchievementManager } from "../sim/achievements";

export class AchievementsPanel {
  private el: HTMLElement;
  private manager: AchievementManager;
  private open = false;

  constructor(manager: AchievementManager) {
    this.manager = manager;
    this.el = document.createElement("div");
    this.el.id = "achievements-panel";
    this.el.className = "achievements-panel";
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
      `<h3>成就</h3><ul>` +
      this.manager.achievements
        .map((a) => {
          const unlocked = this.manager.isUnlocked(a.id);
          return (
            `<li class="${unlocked ? "unlocked" : "locked"}">` +
            `<strong>${a.name}</strong>` +
            `<span>${a.description}</span> ${unlocked ? "✓" : "🔒"}` +
            (a.rewardName ? `<em>奖励: ${a.rewardName}</em>` : "") +
            `</li>`
          );
        })
        .join("") +
      `</ul>`;
  }
}
