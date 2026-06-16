export const COLORS = {
  primary: "#D7B79A",
  accent: "#B88762",
  text: "#5A4636",
  bg: "#F7F2EA",
} as const;

export const PROJECT_TAGS = [
  "光子嫩肤",
  "水光针",
  "瘦脸针",
  "热玛吉",
  "超声炮",
  "皮秒",
  "玻尿酸",
  "其它",
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];

export const SHORT_LABEL_MAP: Record<string, string> = {
  光子嫩肤: "光子",
  水光针: "水光",
  水光补水: "水光",
  瘦脸针: "瘦脸",
  肉毒除皱: "肉毒",
  热玛吉: "热玛",
  超声炮: "超声",
  皮秒: "皮秒",
  玻尿酸: "玻尿",
};

export function toShortLabel(name: string) {
  return SHORT_LABEL_MAP[name] ?? name.slice(0, 2);
}

export function formatDisplayDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function toDateKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function formatCost(cost?: number) {
  if (cost === undefined || cost === null || Number.isNaN(cost)) {
    return "";
  }
  return `¥${cost.toLocaleString("zh-CN")}`;
}
