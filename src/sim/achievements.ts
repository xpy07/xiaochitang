export interface Achievement {
  id: string;
  name: string;
  description: string;
  threshold: number;
  metric: string;
  rewardType?: string;
  rewardName?: string;
}

export interface Metrics {
  totalFeeds: number;
  daysKept: number;
  healthyAdults: number;
}

export class AchievementManager {
  achievements: Achievement[] = [
    { id: "feed_10", name: "初次投喂", description: "投喂 10 次", threshold: 10, metric: "totalFeeds" },
    { id: "feed_100", name: "鱼塘常客", description: "投喂 100 次", threshold: 100, metric: "totalFeeds", rewardType: "creature", rewardName: "锦鲤" },
    { id: "feed_500", name: "喂养达人", description: "投喂 500 次", threshold: 500, metric: "totalFeeds", rewardType: "decor", rewardName: "金石" },
    { id: "days_7", name: "守护一周", description: "养满 7 天", threshold: 7, metric: "daysKept" },
    { id: "days_30", name: "守塘人", description: "养满 30 天", threshold: 30, metric: "daysKept", rewardType: "creature", rewardName: "金蛙" },
    { id: "adult_5", name: "满堂彩", description: "5 只健康成年", threshold: 5, metric: "healthyAdults" },
    { id: "adult_15", name: "鱼丁兴旺", description: "15 只健康成年", threshold: 15, metric: "healthyAdults", rewardType: "decor", rewardName: "珊瑚" },
  ];

  unlocked: Set<string> = new Set();
  metrics: Metrics = { totalFeeds: 0, daysKept: 0, healthyAdults: 0 };

  recordFeed(): Achievement | null {
    this.metrics.totalFeeds++;
    return this.checkMetric("totalFeeds");
  }

  recordDay(): Achievement | null {
    this.metrics.daysKept++;
    return this.checkMetric("daysKept");
  }

  recordHealthyAdult(): Achievement | null {
    this.metrics.healthyAdults++;
    return this.checkMetric("healthyAdults");
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  getReward(id: string): string | null {
    const a = this.achievements.find((a) => a.id === id);
    return a?.rewardName ?? null;
  }

  load(): void {
    try {
      const data = localStorage.getItem("fishpond_achievements");
      if (data) {
        const parsed = JSON.parse(data);
        this.unlocked = new Set(parsed.unlocked);
        this.metrics = parsed.metrics ?? this.metrics;
      }
    } catch {}
  }

  private persist(): void {
    localStorage.setItem("fishpond_achievements", JSON.stringify({
      unlocked: [...this.unlocked],
      metrics: this.metrics,
    }));
  }

  private checkMetric(metric: string): Achievement | null {
    const value = (this.metrics as any)[metric];
    for (const a of this.achievements) {
      if (a.metric === metric && !this.unlocked.has(a.id) && value >= a.threshold) {
        this.unlocked.add(a.id);
        this.persist();
        return a;
      }
    }
    return null;
  }
}
