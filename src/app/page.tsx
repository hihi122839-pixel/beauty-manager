"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { RecordBubble } from "@/components/record-bubble";
import { RecordSheet } from "@/components/record-sheet";
import { formatDisplayDate } from "@/lib/constants";
import {
  getBeautyRecordsSnapshot,
  getServerBeautyRecordsSnapshot,
  sortRecordsByDate,
  subscribeBeautyRecords,
} from "@/lib/beauty-records";

export default function TodayPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const records = useSyncExternalStore(
    subscribeBeautyRecords,
    getBeautyRecordsSnapshot,
    getServerBeautyRecordsSnapshot
  );

  const sortedRecords = useMemo(() => sortRecordsByDate(records), [records]);
  const todayLabel = formatDisplayDate(new Date());

  return (
    <section className="relative min-h-[calc(100dvh-8rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,_rgba(255,248,238,0.95),_transparent_72%)]" />
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#D7B79A]/25 blur-3xl" />
        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-[#F7F2EA] blur-3xl" />
      </div>

      <header className="pt-2 pb-6">
        <p className="text-3xl font-semibold tracking-tight text-[#5A4636]">
          {todayLabel}
        </p>
        <p className="mt-2 text-sm text-[#5A4636]/55">
          记录今天，让美丽被看见。
        </p>
      </header>

      <div className="flex flex-col items-center py-6">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="新增记录"
          className="group relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-gradient-to-br from-[#D7B79A] to-[#B88762] text-4xl font-light text-white shadow-[0_16px_48px_rgba(184,135,98,0.45)] transition hover:scale-[1.03] active:scale-[0.98]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#D7B79A]/30 blur-xl transition group-hover:bg-[#D7B79A]/40"
          />
          <span className="relative leading-none">+</span>
        </button>
        <p className="mt-4 text-xs text-[#5A4636]/45">点击记录今天的医美项目</p>
      </div>

      {sortedRecords.length > 0 ? (
        <div className="space-y-5 pb-4">
          {sortedRecords.map((record) => (
            <RecordBubble key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-[#5A4636]/45">
          还没有记录，点击上方按钮开始
        </p>
      )}

      <RecordSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </section>
  );
}
