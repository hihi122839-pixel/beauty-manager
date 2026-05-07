"use client";

import { useEffect } from "react";
import { mockRecords } from "@/lib/mock-data";
import {
  RECORDS_STORAGE_KEY,
  writeBeautyRecords,
  type SavedRecord,
} from "@/lib/beauty-records";

const SEED_FLAG_KEY = "beauty_records_seeded";

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

    if (hasSeeded || existingRaw !== null) {
      window.localStorage.setItem(SEED_FLAG_KEY, "1");
      return;
    }

    writeBeautyRecords(buildSeedRecords());
    window.localStorage.setItem(SEED_FLAG_KEY, "1");
  }, []);

  return null;
}
