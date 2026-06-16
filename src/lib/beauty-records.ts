import { toDateKey } from "@/lib/constants";

export const RECORDS_STORAGE_KEY = "beauty_records";
export const RECORDS_UPDATED_EVENT = "beauty-records-updated";
export const PROFILE_STORAGE_KEY = "beauty_profile";
const LEGACY_PROFILE_STORAGE_KEY = "beautylog_profile";
export const PROFILE_UPDATED_EVENT = "beautylog-profile-updated";

export type UserProfile = {
  name: string;
  mood: string;
  avatar: string;
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Beautylog 用户",
  mood: "坚持记录，慢慢变美。",
  avatar: "",
};

let cachedProfile: UserProfile = DEFAULT_PROFILE;
let cachedProfileRaw = "";

function normalizeProfile(parsed: unknown): UserProfile {
  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_PROFILE;
  }

  const data = parsed as Record<string, unknown>;
  const name = String(data.name ?? data.displayName ?? DEFAULT_PROFILE.name).trim();
  const mood = String(data.mood ?? data.moodSignature ?? DEFAULT_PROFILE.mood).trim();
  const avatar = String(data.avatar ?? "").trim();

  const profile = {
    name: name || DEFAULT_PROFILE.name,
    mood: mood || DEFAULT_PROFILE.mood,
    avatar,
  };

  if (
    profile.name === DEFAULT_PROFILE.name &&
    profile.mood === DEFAULT_PROFILE.mood &&
    profile.avatar === DEFAULT_PROFILE.avatar
  ) {
    return DEFAULT_PROFILE;
  }

  return profile;
}

function readProfileRaw(): string {
  try {
    let raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      return raw;
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY);
    if (!legacyRaw) {
      return "";
    }

    const normalized = normalizeProfile(JSON.parse(legacyRaw));
    raw = JSON.stringify(normalized);
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, raw);
    } catch {
      // ignore migration write errors
    }
    return raw;
  } catch {
    return "";
  }
}

function updateProfileCache(profile: UserProfile, raw: string): UserProfile {
  if (raw === cachedProfileRaw) {
    return cachedProfile;
  }

  cachedProfileRaw = raw;

  if (!raw) {
    cachedProfile = DEFAULT_PROFILE;
    return cachedProfile;
  }

  if (profile === DEFAULT_PROFILE) {
    cachedProfile = DEFAULT_PROFILE;
    return cachedProfile;
  }

  cachedProfile = {
    name: profile.name,
    mood: profile.mood,
    avatar: profile.avatar,
  };
  return cachedProfile;
}

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
  cycleDays?: number;
  reminderDate?: string;
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

export function generateRecordId() {
  return `${Date.now()}${Math.random().toString(36).slice(2)}`;
}

export function migrateRecord(record: SavedRecord): SavedRecord {
  return {
    ...record,
    id: record.id?.trim() ? record.id : generateRecordId(),
    experience: record.experience ?? record.todayFeeling ?? "",
    effectEvaluation: record.effectEvaluation ?? record.note ?? "",
    satisfaction: record.satisfaction ?? record.rating ?? undefined,
    cost: record.cost ?? undefined,
    hospital: record.hospital ?? "",
    doctor: record.doctor ?? "",
    projectTag: record.projectTag ?? inferProjectTag(record.projectName),
    reminderDate: record.reminderDate ?? record.nextReminderDate ?? undefined,
    nextReminderDate: record.reminderDate ?? record.nextReminderDate ?? undefined,
    cycleDays: record.cycleDays ?? undefined,
  };
}

export function getRecordReminderDate(record: SavedRecord) {
  return record.reminderDate ?? record.nextReminderDate;
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

export function updateBeautyRecord(id: string, updates: Partial<SavedRecord>) {
  const records = getBeautyRecordsSnapshot();
  const next = records.map((record) =>
    record.id === id ? migrateRecord({ ...record, ...updates, id }) : record
  );
  writeBeautyRecords(next);
}

export function deleteBeautyRecord(id: string) {
  const records = getBeautyRecordsSnapshot();
  writeBeautyRecords(records.filter((record) => record.id !== id));
}

export function getBeautyRecordById(id: string) {
  return getBeautyRecordsSnapshot().find((record) => record.id === id) ?? null;
}

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
    .map((record) => {
      const reminderDate = getRecordReminderDate(record);
      if (!reminderDate || reminderDate < today || reminderDate > endKey) {
        return null;
      }
      return {
        id: record.id,
        projectName: record.projectName,
        reminderDate,
        daysLeft: getDaysUntil(reminderDate),
        cycleDays: record.cycleDays,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.reminderDate.localeCompare(b.reminderDate));
}

export function getProfileSnapshot(): UserProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  const raw = readProfileRaw();
  if (raw === cachedProfileRaw) {
    return cachedProfile;
  }

  try {
    const profile = raw ? normalizeProfile(JSON.parse(raw)) : DEFAULT_PROFILE;
    return updateProfileCache(profile, raw);
  } catch {
    return updateProfileCache(DEFAULT_PROFILE, raw);
  }
}

export function writeProfile(profile: Partial<UserProfile>) {
  const safe: UserProfile = {
    name: profile.name?.trim() || DEFAULT_PROFILE.name,
    mood: profile.mood?.trim() || DEFAULT_PROFILE.mood,
    avatar: profile.avatar?.trim() ?? "",
  };

  const normalized = normalizeProfile(safe);
  const raw = JSON.stringify(safe);

  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, raw);
    updateProfileCache(normalized, raw);
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  } catch (error) {
    console.error("write profile failed", error);
    throw error;
  }
}

export const subscribeProfile = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key === PROFILE_STORAGE_KEY || event.key === LEGACY_PROFILE_STORAGE_KEY) {
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
