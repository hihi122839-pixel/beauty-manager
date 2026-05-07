"use client";

import { useSyncExternalStore } from "react";
import { RecordCard } from "@/components/record-card";
import { mockRecords, type MedicalRecord } from "@/lib/mock-data";

const RECORDS_STORAGE_KEY = "beauty_records";

type SavedRecord = MedicalRecord & {
  imageFileNames?: string[];
  createdAt?: string;
};

const EMPTY_RECORDS: SavedRecord[] = [];

const subscribeRecords = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = (event: StorageEvent) => {
    if (event.key === RECORDS_STORAGE_KEY) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

let cachedRaw: string | null = null;
let cachedRecords: SavedRecord[] = EMPTY_RECORDS;

const getRecordsSnapshot = (): SavedRecord[] => {
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

const getServerRecordsSnapshot = (): SavedRecord[] => EMPTY_RECORDS;

export default function RecordsPage() {
  const savedRecords = useSyncExternalStore(
    subscribeRecords,
    getRecordsSnapshot,
    getServerRecordsSnapshot
  );

  const sortedSaved = [...savedRecords].sort((a, b) => {
    const aTime = a.createdAt ?? a.date ?? "";
    const bTime = b.createdAt ?? b.date ?? "";
    return bTime.localeCompare(aTime);
  });

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-800 sm:text-2xl">记录列表</h1>
        <p className="mt-1 text-sm text-zinc-500">
          顶部展示本地新增的记录，下方为示例数据。
        </p>
      </div>

      {sortedSaved.length > 0 ? (
        <div className="space-y-3">
          {sortedSaved.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 p-4 text-sm text-zinc-500 ring-1 ring-[#ece2d5]">
          暂无本地记录，前往“新增记录”页填写并提交即可在这里看到。
        </div>
      )}

      <div className="space-y-3">
        {mockRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </section>
  );
}
