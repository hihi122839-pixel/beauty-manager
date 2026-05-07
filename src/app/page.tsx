"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { RecordCard } from "@/components/record-card";
import {
  getBeautyRecordsSnapshot,
  getServerBeautyRecordsSnapshot,
  subscribeBeautyRecords,
  type SavedRecord,
} from "@/lib/beauty-records";

export default function Home() {
  const records = useSyncExternalStore(
    subscribeBeautyRecords,
    getBeautyRecordsSnapshot,
    getServerBeautyRecordsSnapshot
  );

  const sortedRecords = useMemo(() => sortRecordsByDate(records), [records]);
  const latestRecord = sortedRecords[0] ?? null;
  const latestDate = latestRecord?.date ?? "";
  const latestSameDayRecords = latestDate
    ? sortedRecords.filter((record) => record.date === latestDate)
    : [];
  const latestCareName = latestRecord
    ? latestSameDayRecords.length > 1
      ? `${latestRecord.projectName}等 ${latestSameDayRecords.length} 项`
      : latestRecord.projectName
    : "";
  const daysSinceLatestCare = latestDate ? getDaysSince(latestDate) : null;
  const nextReminderDate = getNextReminderDate(sortedRecords);
  const projectRhythms = getProjectRhythms(sortedRecords);
  const visibleProjectRhythms = projectRhythms.slice(0, 4);

  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-12 -bottom-16 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(255,242,222,0.85),_transparent_70%)]" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#f7e3c8]/55 blur-3xl" />
        <div className="absolute -right-16 top-44 h-80 w-80 rounded-full bg-[#efdcc1]/55 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#fff2dc]/60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(rgba(140,110,80,0.45) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
      </div>

      <div className="space-y-7 sm:space-y-10">
      <div className="rounded-3xl bg-gradient-to-br from-[#fdf9f2] via-[#f8f1e7] to-[#efe4d6] p-5 shadow-[0_16px_40px_rgba(178,154,122,0.18)] ring-1 ring-white/70 sm:p-8">
        <p className="text-sm font-medium text-[#9f8d74]">当前护理周期</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-800 sm:text-3xl">
          护理总览
        </h1>
        {latestRecord ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-2xl bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75 backdrop-blur-sm">
              <p className="text-xs text-zinc-500/90">最近一次护理</p>
              <p className="mt-1 text-xl font-semibold text-[#8b765e]">
                {latestCareName}
              </p>
              <p className="mt-1 text-xs text-[#9f8d74]">{latestDate}</p>
            </div>
            <div className="rounded-2xl bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75 backdrop-blur-sm">
              <p className="text-xs text-zinc-500/90">距离最近护理</p>
              <p className="mt-1 text-4xl font-semibold leading-none tracking-tight text-zinc-800">
                {daysSinceLatestCare}
                <span className="ml-1 text-lg font-medium text-zinc-500">天</span>
              </p>
            </div>
            <div className="rounded-2xl bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75 backdrop-blur-sm">
              <p className="text-xs text-zinc-500/90">下一次提醒</p>
              <p className="mt-1 text-xl font-semibold text-zinc-800">
                {nextReminderDate ?? "暂无"}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-white/52 p-4 text-sm text-[#7e6f5d] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75">
            还没有护理记录，先添加一次吧
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-[#f8f2e9] p-4 shadow-[0_8px_20px_rgba(179,156,126,0.08)] ring-1 ring-[#ece2d5] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#6f6253]">项目节奏</h2>
          {projectRhythms.length > 4 ? (
            <Link href="/records" className="text-xs font-medium text-[#9a8770]">
              查看更多记录
            </Link>
          ) : null}
        </div>
        {visibleProjectRhythms.length === 0 ? (
          <p className="mt-3 text-sm text-[#8f7d67]">还没有护理记录，先添加一次吧</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {visibleProjectRhythms.map((item) => (
              <article
                key={item.projectName}
                className="rounded-2xl bg-[#fdf9f2] p-3.5 shadow-[0_4px_14px_rgba(179,156,126,0.08)] ring-1 ring-[#ece2d5]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#6f6253]">
                      {item.projectName}
                    </p>
                    <p className="mt-1 text-xs text-[#8f7d67]">{item.latestDate}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#efe4d6] px-2.5 py-1 text-xs font-medium text-[#7e6f5d]">
                    距上次 {item.daysSince} 天
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {latestRecord ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-500">最近项目</p>
          <RecordCard record={latestRecord} />
        </div>
      ) : null}

      <div className="pt-1">
        <Link
          href="/records"
          className="block min-h-12 w-full rounded-2xl bg-white/72 px-4 py-4 text-center text-base font-medium text-[#8f7d67] ring-1 ring-[#d9ccba] transition hover:bg-white hover:text-[#6f6253]"
        >
          查看记录
        </Link>
      </div>
      </div>

      <Link
        href="/add"
        aria-label="新增记录"
        className="fixed right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#d8bfb1] to-[#c8a89b] text-2xl font-semibold leading-none text-white shadow-[0_14px_28px_rgba(170,138,108,0.36)] transition hover:brightness-105 sm:right-10 sm:h-12 sm:w-12 sm:text-xl sm:opacity-90 sm:hover:opacity-100"
        style={{ bottom: "min(88px, 33vh)" }}
      >
        +
      </Link>
    </section>
  );
}

function getDaysSince(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  const diff = now.getTime() - target.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor(diff / dayMs));
}

function sortRecordsByDate(records: SavedRecord[]) {
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

function getNextReminderDate(records: SavedRecord[]) {
  const today = toDateKey(new Date());
  return records
    .map((record) => record.nextReminderDate)
    .filter((date): date is string => Boolean(date && date >= today))
    .sort((a, b) => a.localeCompare(b))[0];
}

function getProjectRhythms(records: SavedRecord[]) {
  const latestByProject = new Map<string, SavedRecord>();

  for (const record of records) {
    if (!record.projectName || !record.date || latestByProject.has(record.projectName)) {
      continue;
    }
    latestByProject.set(record.projectName, record);
  }

  return Array.from(latestByProject.values())
    .map((record) => ({
      projectName: record.projectName,
      latestDate: record.date,
      daysSince: getDaysSince(record.date),
    }))
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate));
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
