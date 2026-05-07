export type MedicalRecord = {
  id: string;
  projectName: string;
  date: string;
  area: string;
  rating: number;
  nextReminderDate: string;
  note?: string;
  todayFeeling?: string;
  satisfaction?: number;
  statusTags?: string[];
  imageUrls?: string[];
};

export const mockRecords: MedicalRecord[] = [
  {
    id: "1",
    projectName: "光子嫩肤",
    date: "2026-03-21",
    area: "全脸",
    rating: 4,
    nextReminderDate: "2026-05-10",
    note: "恢复期短，肤色提亮明显。",
    todayFeeling: "肤色更匀净，第二天轻微发热，保湿后状态稳定。",
    satisfaction: 4,
    statusTags: ["提亮", "轻微泛红"],
    imageUrls: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80",
    ],
  },
  {
    id: "2",
    projectName: "水光补水",
    date: "2026-04-02",
    area: "脸颊",
    rating: 5,
    nextReminderDate: "2026-05-02",
    note: "第二天状态很好，上妆更服帖。",
    todayFeeling: "皮肤喝饱水，摸起来更细腻，妆面服帖度提升。",
    satisfaction: 5,
    statusTags: ["提亮", "紧致"],
    imageUrls: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    ],
  },
  {
    id: "3",
    projectName: "肉毒除皱",
    date: "2026-04-09",
    area: "眉间",
    rating: 4,
    nextReminderDate: "2026-07-09",
    note: "紧绷感可接受，效果自然。",
    todayFeeling: "表情纹路柔和，整体状态自然，暂无不适。",
    satisfaction: 4,
    statusTags: ["稳定", "紧致"],
    imageUrls: [
      "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=300&q=80",
    ],
  },
];
