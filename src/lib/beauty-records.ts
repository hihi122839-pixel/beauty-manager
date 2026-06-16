import { toDateKey } from "@/lib/constants";

export const RECORDS_STORAGE_KEY = "beauty_records";
export const RECORDS_UPDATED_EVENT = "beauty-records-updated";
export const PROFILE_STORAGE_KEY = "beautylog_profile";
export const PROFILE_UPDATED_EVENT = "beautylog-profile-updated";

export type UserProfile = {
  displayName: string;
  moodSignature: string;
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: "美丽记录者",
  moodSignature: "坚持记录，慢慢变美。",
};

export type SavedRecord = {
  id: string;
  projectName: string;
  projectTag?: string;
  date: string;
  cost?: number;
  hospital?: string;
  doctor?: string;
  experience?: string;
  effectEvaluation?: string;
  satisfaction?: number;
  nextReminderDate?: string;
  area?: string;
  rating?: number;
  note?: string;
  todayFeeling?: string;
  statusTags?: string[];
  imageFileNames?: string[];
  imageUrls?: string[];
  createdAt?: string;
};

const EMPTY_RECORDS: SavedRecord[] = [];

let cachedRaw: string | null = null;
let cachedRecords: SavedRecord[] = EMPTY_RECORDS;

export function migrateRecord(record: SavedRecord): SavedRecord {
  return {
    ...record,
    experience: record.experience ?? record.todayFeeling ?? "",
    effectEvaluation: record.effectEvaluation ?? record.note ?? "",
    satisfaction: record.satisfaction ?? record.rating ?? undefined,
    cost: record.cost ?? undefined,
    hospital: record.hospital ?? "",
    doctor: record.doctor ?? "",
    projectTag: record.projectTag ?? inferProjectTag(record.projectName),
  };
}

function inferProjectTag(projectName: string) {
  const tags = [
    "光子嫩肤",
    "水光针",
    "瘦脸针",
    "热玛吉",
    "超声炮",
    "皮秒",
    "玻尿酸",
  ];
  return tags.find((tag) => projectName.includes(tag)) ?? undefined;
}

export function migrateRecords(records: SavedRecord[]) {
  return records.map(migrateRecord);
}

export const subscribeBeautyRecords = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key === RECORDS_STORAGE_KEY) {
      onStoreChange();
    }
  };
  const localHandler = () => onStoreChange();

  window.addEventListener("storage", storageHandler);
  window.addEventListener(RECORDS_UPDATED_EVENT, localHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(RECORDS_UPDATED_EVENT, localHandler);
  };
};

export const getBeautyRecordsSnapshot = (): SavedRecord[] => {
  if (typeof window === "undefined") {
    return EMPTY_RECORDS;
  }

  try {
    const raw = window.localStorage.getItem(RECORDS_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedRecords;
    }

    cachedRaw = raw;
    if (!raw) {
      cachedRecords = EMPTY_RECORDS;
      return cachedRecords;
    }

    const parsed = JSON.parse(raw) as SavedRecord[];
    cachedRecords = Array.isArray(parsed) ? migrateRecords(parsed) : EMPTY_RECORDS;
    return cachedRecords;
  } catch (error) {
    console.error("read beauty_records failed", error);
    cachedRecords = EMPTY_RECORDS;
    return cachedRecords;
  }
};

export const getServerBeautyRecordsSnapshot = (): SavedRecord[] => EMPTY_RECORDS;

export const writeBeautyRecords = (records: SavedRecord[]) => {
  const migrated = migrateRecords(records);
  window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(migrated));
  cachedRaw = null;
  cachedRecords = migrated;
  window.dispatchEvent(new Event(RECORDS_UPDATED_EVENT));
};

export function sortRecordsByDate(records: SavedRecord[]) {
  return records
    .filter((record) => record.projectName && record.date)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
}

export function getDaysSince(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  const diff = now.getTime() - target.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor(diff / dayMs));
}

export function getDaysUntil(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil(diff / dayMs));
}

export function getUpcomingReminders(records: SavedRecord[], withinDays = 30) {
  const today = toDateKey(new Date());
  const end = new Date();
  end.setDate(end.getDate() + withinDays);
  const endKey = toDateKey(end);

  return records
    .filter(
      (record) =>
        record.nextReminderDate &&
        record.nextReminderDate >= today &&
        record.nextReminderDate <= endKey
    )
    .map((record) => ({
      projectName: record.projectName,
      reminderDate: record.nextReminderDate!,
      daysLeft: getDaysUntil(record.nextReminderDate!),
    }))
    .sort((a, b) => a.reminderDate.localeCompare(b.reminderDate));
}

export function getProfileSnapshot(): UserProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName: parsed.displayName ?? DEFAULT_PROFILE.displayName,
      moodSignature: parsed.moodSignature ?? DEFAULT_PROFILE.moodSignature,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function writeProfile(profile: UserProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export const subscribeProfile = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key === PROFILE_STORAGE_KEY) {
      onStoreChange();
    }
  };
  const localHandler = () => onStoreChange();

  window.addEventListener("storage", storageHandler);
  window.addEventListener(PROFILE_UPDATED_EVENT, localHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(PROFILE_UPDATED_EVENT, localHandler);
  };
};

export const getServerProfileSnapshot = (): UserProfile => DEFAULT_PROFILE;

export function getStats(records: SavedRecord[]) {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const projectCounts = new Map<string, number>();
  const hospitalCounts = new Map<string, number>();
  let totalCost = 0;
  let monthCount = 0;

  for (const record of records) {
    if (record.projectName) {
      projectCounts.set(
        record.projectName,
        (projectCounts.get(record.projectName) ?? 0) + 1
      );
    }
    if (record.hospital?.trim()) {
      hospitalCounts.set(
        record.hospital,
        (hospitalCounts.get(record.hospital) ?? 0) + 1
      );
    }
    if (record.cost) {
      totalCost += record.cost;
    }
    if (record.date.startsWith(monthPrefix)) {
      monthCount += 1;
    }
  }

  const topProject = [...projectCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topHospital = [...hospitalCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const rankings = [...projectCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({ rank: index + 1, name, count }));

  return {
    totalCount: records.length,
    monthCount,
    totalCost,
    topProject: topProject?.[0] ?? "暂无",
    topHospital: topHospital?.[0] ?? "暂无",
    rankings,
  };
}
