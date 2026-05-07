"use client";

import { useMemo, useState } from "react";
import { BackButton } from "@/components/back-button";

type CalendarRecord = {
  projectName: string;
  status: "恢复期" | "稳定期";
  hasReminder: boolean;
  nextReminderDate: string;
};

const monthNames = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

const mockRecordsByDate: Record<string, CalendarRecord[]> = {
  "2026-04-02": [
    {
      projectName: "水光针",
      status: "恢复期",
      hasReminder: true,
      nextReminderDate: "2026-04-20",
    },
  ],
  "2026-04-09": [
    {
      projectName: "肉毒除皱",
      status: "稳定期",
      hasReminder: true,
      nextReminderDate: "2026-05-09",
    },
  ],
  "2026-04-17": [
    {
      projectName: "光子嫩肤",
      status: "恢复期",
      hasReminder: false,
      nextReminderDate: "2026-05-17",
    },
  ],
  "2026-04-22": [
    {
      projectName: "皮肤管理",
      status: "稳定期",
      hasReminder: true,
      nextReminderDate: "2026-04-28",
    },
  ],
  "2026-04-26": [
    {
      projectName: "水光针",
      status: "恢复期",
      hasReminder: true,
      nextReminderDate: "2026-05-26",
    },
    {
      projectName: "光子嫩肤",
      status: "稳定期",
      hasReminder: false,
      nextReminderDate: "2026-06-05",
    },
    {
      projectName: "热玛吉",
      status: "恢复期",
      hasReminder: true,
      nextReminderDate: "2026-06-26",
    },
    {
      projectName: "皮肤测试",
      status: "稳定期",
      hasReminder: false,
      nextReminderDate: "2026-05-12",
    },
  ],
};

export default function CalendarPage() {
  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ day: number; dateKey: string } | null> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, dateKey: toDateKey(viewYear, viewMonth, day) });
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [viewMonth, viewYear]);

  const reminderProjectsByDate = useMemo(() => {
    const reminderMap: Record<string, string[]> = {};

    for (const records of Object.values(mockRecordsByDate)) {
      for (const record of records) {
        if (!record.hasReminder) {
          continue;
        }

        const dateKey = record.nextReminderDate;
        reminderMap[dateKey] = reminderMap[dateKey]
          ? [...reminderMap[dateKey], record.projectName]
          : [record.projectName];
      }
    }

    return reminderMap;
  }, []);

  const selectedRecords = mockRecordsByDate[selectedDate] ?? [];
  const reminderProjectsToday = reminderProjectsByDate[selectedDate] ?? [];

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth(viewMonth - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth(viewMonth + 1);
  };

  const goToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(
      toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  return (
    <section className="space-y-5 sm:space-y-7">
      <BackButton />
      <div className="rounded-3xl bg-gradient-to-br from-[#fdf9f2] via-[#f8f1e7] to-[#efe4d6] p-5 shadow-[0_14px_34px_rgba(178,154,122,0.16)] ring-1 ring-white/70 sm:p-6">
        <p className="text-sm font-medium text-[#9f8d74]">护理日历</p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-800 sm:text-3xl">
            {viewYear}年 {monthNames[viewMonth]}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="min-h-9 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-[#7e6f5d] ring-1 ring-[#e6d8c4] transition hover:bg-white"
            >
              上一月
            </button>
            <button
              type="button"
              onClick={goToday}
              className="min-h-9 rounded-full bg-[#d8c4aa] px-3 py-1.5 text-xs font-medium text-white shadow-[0_6px_14px_rgba(170,142,108,0.24)] transition hover:brightness-105"
            >
              回到今天
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              className="min-h-9 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-[#7e6f5d] ring-1 ring-[#e6d8c4] transition hover:bg-white"
            >
              下一月
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/88 p-3 shadow-[0_12px_30px_rgba(179,156,126,0.12)] ring-1 ring-[#ece2d5] sm:p-5">
        <div className="mb-2 grid grid-cols-7 gap-1.5 sm:mb-3 sm:gap-2">
          {weekDays.map((day) => (
            <p
              key={day}
              className="text-center text-xs font-medium tracking-wide text-[#a6947f]"
            >
              {day}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((cell, index) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-14 rounded-xl sm:h-24 sm:rounded-2xl"
                />
              );
            }

            const records = mockRecordsByDate[cell.dateKey] ?? [];
            const hasRecord = records.length > 0;
            const reminderProjects = reminderProjectsByDate[cell.dateKey] ?? [];
            const isReminderDay = reminderProjects.length > 0;
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDate;
            const visibleTags = records
              .slice(0, 3)
              .map((item) => toShortLabel(item.projectName));
            const extraCount = records.length - visibleTags.length;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => setSelectedDate(cell.dateKey)}
                className={[
                  "relative flex h-14 flex-col items-start rounded-xl p-1.5 text-sm transition sm:h-24 sm:rounded-2xl sm:p-2",
                  isSelected
                    ? "bg-[#f2e9dc] text-[#6f6253] ring-2 ring-[#d8c4aa]"
                    : "bg-[#f8f2e9] text-[#7e6f5d] hover:bg-[#efe4d6]",
                  isToday && !isSelected ? "ring-2 ring-[#d9c8b4]" : "",
                  isReminderDay && !isSelected ? "ring-2 ring-[#b99d7e]" : "",
                ].join(" ")}
              >
                <span className="mb-0.5 text-xs font-medium sm:mb-1">
                  {cell.day}
                </span>
                {hasRecord ? (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#b79c7f] sm:right-2 sm:top-2" />
                ) : null}
                {isReminderDay ? (
                  <span
                    className="absolute right-1 bottom-1 text-[10px] leading-none sm:right-2 sm:bottom-1.5 sm:text-[11px]"
                    aria-label="提醒日"
                  >
                    🔔
                  </span>
                ) : null}
                <div className="hidden w-full flex-wrap gap-1 sm:flex">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                        isSelected
                          ? "bg-[#e5d6c2] text-[#6f6253]"
                          : "bg-[#e2d1bc] text-[#6f6253]",
                      ].join(" ")}
                    >
                      {tag}
                    </span>
                  ))}
                  {extraCount > 0 ? (
                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                        isSelected
                          ? "bg-[#e5d6c2] text-[#6f6253]"
                          : "bg-[#e2d1bc] text-[#6f6253]",
                      ].join(" ")}
                    >
                      +{extraCount}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white/88 p-4 shadow-[0_12px_30px_rgba(179,156,126,0.1)] ring-1 ring-[#ece2d5] sm:p-5">
        <p className="text-sm font-medium text-[#9f8d74]">当日记录 · {selectedDate}</p>
        {reminderProjectsToday.length > 0 ? (
          <p className="mt-2 text-xs text-[#8f7d67]">
            🔔 今日复做提醒：{reminderProjectsToday.map(toShortLabel).join("、")}
          </p>
        ) : null}
        {selectedRecords.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">当日暂无护理记录。</p>
        ) : (
          <div className="mt-3 space-y-3">
            {selectedRecords.map((item, idx) => (
              <article
                key={`${item.projectName}-${idx}`}
                className="rounded-2xl bg-[#f8f2e9] p-4"
              >
                <h3 className="text-lg font-semibold text-zinc-800">
                  {item.projectName}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#efe4d6] px-2.5 py-1 text-[#7e6f5d]">
                    状态：{item.status}
                  </span>
                  <span className="rounded-full bg-[#efe4d6] px-2.5 py-1 text-[#7e6f5d]">
                    提醒：{item.hasReminder ? "有提醒" : "无提醒"}
                  </span>
                  <span className="rounded-full bg-[#efe4d6] px-2.5 py-1 text-[#7e6f5d]">
                    下次：{item.nextReminderDate}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function toDateKey(year: number, month: number, day: number) {
  const monthText = String(month + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

function toShortLabel(projectName: string) {
  const shortNameMap: Record<string, string> = {
    水光针: "水光",
    光子嫩肤: "光子",
    热玛吉: "热玛",
    皮肤测试: "测试",
  };

  return shortNameMap[projectName] ?? projectName.slice(0, 2);
}
