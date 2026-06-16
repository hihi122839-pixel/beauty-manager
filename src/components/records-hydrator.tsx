"use client";

import { useEffect } from "react";
import { mockRecords } from "@/lib/mock-data";
import {
  RECORDS_STORAGE_KEY,
  migrateRecords,
  writeBeautyRecords,
  type SavedRecord,
} from "@/lib/beauty-records";

const SEED_FLAG_KEY = "beauty_records_seeded";
const MIGRATION_FLAG_KEY = "beauty_records_migrated_v2";

const buildSeedRecords = (): SavedRecord[] =>
  mockRecords.map((record) => ({
    ...record,
    createdAt: `${record.date}T09:00:00.000Z`,
  }));

export function RecordsHydrator() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasSeeded = window.localStorage.getItem(SEED_FLAG_KEY) === "1";
    const existingRaw = window.localStorage.getItem(RECORDS_STORAGE_KEY);
    const hasMigrated = window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1";

    if (!hasSeeded && existingRaw === null) {
      writeBeautyRecords(buildSeedRecords());
      window.localStorage.setItem(SEED_FLAG_KEY, "1");
      window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
      return;
    }

    if (!hasMigrated && existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw) as SavedRecord[];
        if (Array.isArray(parsed)) {
          writeBeautyRecords(migrateRecords(parsed));
        }
      } catch (error) {
        console.error("migrate beauty_records failed", error);
      }
      window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    }

    window.localStorage.setItem(SEED_FLAG_KEY, "1");
  }, []);

  return null;
}
