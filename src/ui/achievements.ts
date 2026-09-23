import { Achievement } from "../sim/achievements";

export class AchievementToast {
  private container: HTMLElement;

  constructor() {
    let el = document.getElementById("achievement-toasts");
    if (!el) {
      el = document.createElement("div");
      el.id = "achievement-toasts";
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show(a: Achievement): void {
    const el = document.createElement("div");
    el.className = "achievement-toast";
    el.innerHTML =
      `<div class="achievement-toast-name">成就解锁 · ${a.name}</div>` +
      `<div class="achievement-toast-desc">${a.description}</div>` +
      (a.rewardName ? `<div class="achievement-toast-reward">奖励：${a.rewardName}</div>` : "");
    this.container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    }, 3000);
  }
}
