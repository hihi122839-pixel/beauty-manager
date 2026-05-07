import type { MedicalRecord } from "@/lib/mock-data";

export const RECORDS_STORAGE_KEY = "beauty_records";
export const RECORDS_UPDATED_EVENT = "beauty-records-updated";

export type SavedRecord = MedicalRecord & {
  imageFileNames?: string[];
  createdAt?: string;
};

const EMPTY_RECORDS: SavedRecord[] = [];

let cachedRaw: string | null = null;
let cachedRecords: SavedRecord[] = EMPTY_RECORDS;

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
    cachedRecords = Array.isArray(parsed) ? parsed : EMPTY_RECORDS;
    return cachedRecords;
  } catch (error) {
    console.error("read beauty_records failed", error);
    cachedRecords = EMPTY_RECORDS;
    return cachedRecords;
  }
};

export const getServerBeautyRecordsSnapshot = (): SavedRecord[] => EMPTY_RECORDS;

export const writeBeautyRecords = (records: SavedRecord[]) => {
  window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  cachedRaw = null;
  window.dispatchEvent(new Event(RECORDS_UPDATED_EVENT));
};
