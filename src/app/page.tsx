"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { RecordBubble } from "@/components/record-bubble";
import { RecordDetailSheet } from "@/components/record-detail-sheet";
import { RecordSheet } from "@/components/record-sheet";
import { formatDisplayDate } from "@/lib/constants";
import {
  getBeautyRecordsSnapshot,
  getServerBeautyRecordsSnapshot,
  sortRecordsByDate,
  subscribeBeautyRecords,
  type SavedRecord,
} from "@/lib/beauty-records";

export default function TodayPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SavedRecord | null>(null);

  const records = useSyncExternalStore(
    subscribeBeautyRecords,
    getBeautyRecordsSnapshot,
    getServerBeautyRecordsSnapshot
  );

  const sortedRecords = useMemo(() => sortRecordsByDate(records), [records]);
  const todayLabel = formatDisplayDate(new Date());

  return (
    <>
      <section className="relative w-full overflow-x-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(255,252,247,0.9),_transparent_72%)]"
        />

        <header className="pt-12">
          <p className="text-[2.5rem] font-semibold leading-none tracking-tight text-[#5A4636]">
            {todayLabel}
          </p>
          <p className="mt-2 text-[13px] font-normal leading-relaxed text-[#5A4636]/42">
            记录今天，让美丽被看见。
          </p>
        </header>

        <div className="mt-14 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label="新增记录"
            className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D7B79A] to-[#B88762] text-[1.75rem] font-light text-white shadow-[0_10px_28px_rgba(184,135,98,0.28)] transition active:scale-[0.98]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-[-4px] rounded-full bg-[#D7B79A]/16 blur-md"
            />
            <span className="relative leading-none">+</span>
          </button>
          <p className="mt-3 text-center text-[11px] font-normal text-[#5A4636]/38">
            点击记录今天的医美项目
          </p>
        </div>

        <div className="mt-10 w-full">
          {sortedRecords.length > 0 ? (
            <>
              <p className="mb-3 text-xs font-medium text-[#5A4636]/48">
                最近记录
              </p>
              <ul className="flex w-full flex-col gap-4">
                {sortedRecords.map((record) => (
                  <li key={record.id} className="w-full">
                    <RecordBubble
                      record={record}
                      onClick={() => setDetailRecord(record)}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[13px] font-normal text-[#5A4636]/38">
              还没有记录，点击上方按钮开始
            </p>
          )}
        </div>
      </section>

      <RecordSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <RecordDetailSheet
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </>
  );
}
