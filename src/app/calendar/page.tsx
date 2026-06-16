"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { StarRating } from "@/components/star-rating";
import { formatCost, toShortLabel } from "@/lib/constants";
import {
  getBeautyRecordsSnapshot,
  getServerBeautyRecordsSnapshot,
  getUpcomingReminders,
  subscribeBeautyRecords,
  type SavedRecord,
} from "@/lib/beauty-records";

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

export default function CalendarPage() {
  const records = useSyncExternalStore(
    subscribeBeautyRecords,
    getBeautyRecordsSnapshot,
    getServerBeautyRecordsSnapshot
  );

  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const recordsByDate = useMemo(() => {
    const map: Record<string, SavedRecord[]> = {};
    for (const record of records) {
      if (!record.date) {
        continue;
      }
      map[record.date] = map[record.date] ? [...map[record.date], record] : [record];
    }
    return map;
  }, [records]);

  const upcoming = useMemo(() => getUpcomingReminders(records, 30), [records]);

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

  const selectedRecords = recordsByDate[selectedDate] ?? [];

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
    <section className="space-y-5 pb-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#5A4636]">
          {viewYear}年 {monthNames[viewMonth]}
        </h1>
        <div className="flex items-center gap-1.5">
          <NavButton onClick={goPrevMonth} label="上一月" />
          <NavButton onClick={goToday} label="今天" accent />
          <NavButton onClick={goNextMonth} label="下一月" />
        </div>
      </div>

      <div className="rounded-3xl bg-white/75 p-3 shadow-[0_8px_28px_rgba(90,70,54,0.08)] ring-1 ring-[#ece2d5]/80 backdrop-blur-sm">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <p
              key={day}
              className="text-center text-[11px] font-medium text-[#5A4636]/50"
            >
              {day}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="h-[4.5rem]" />;
            }

            const cellRecords = recordsByDate[cell.dateKey] ?? [];
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDate;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => setSelectedDate(cell.dateKey)}
                className={[
                  "flex h-[4.5rem] flex-col items-start rounded-2xl p-1.5 text-left transition",
                  isSelected
                    ? "bg-[#D7B79A]/30 ring-2 ring-[#B88762]"
                    : "bg-[#F7F2EA]/80 hover:bg-[#F7F2EA]",
                  isToday && !isSelected ? "ring-1 ring-[#D7B79A]" : "",
                ].join(" ")}
              >
                <span className="text-xs font-medium text-[#5A4636]">{cell.day}</span>
                <div className="mt-0.5 w-full space-y-0.5 overflow-hidden">
                  {cellRecords.slice(0, 2).map((item) => (
                    <p
                      key={item.id}
                      className="truncate text-[9px] leading-tight text-[#B88762]"
                    >
                      ●{toShortLabel(item.projectName)}
                    </p>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white/75 p-4 shadow-[0_8px_28px_rgba(90,70,54,0.08)] ring-1 ring-[#ece2d5]/80">
        <p className="text-sm font-medium text-[#5A4636]/70">
          {selectedDate.replace(/-/g, ".")} 的项目
        </p>
        {selectedRecords.length === 0 ? (
          <p className="mt-3 text-sm text-[#5A4636]/45">当日暂无记录</p>
        ) : (
          <div className="mt-3 space-y-3">
            {selectedRecords.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-[#F7F2EA] p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[#5A4636]">{item.projectName}</h3>
                  {item.cost ? (
                    <span className="text-xs font-medium text-[#B88762]">
                      {formatCost(item.cost)}
                    </span>
                  ) : null}
                </div>
                {item.satisfaction ? (
                  <div className="mt-2">
                    <StarRating value={item.satisfaction} size="sm" />
                  </div>
                ) : null}
                {item.hospital ? (
                  <p className="mt-2 text-xs text-[#5A4636]/60">{item.hospital}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white/75 p-4 shadow-[0_8px_28px_rgba(90,70,54,0.08)] ring-1 ring-[#ece2d5]/80">
        <h2 className="text-base font-semibold text-[#5A4636]">即将到来</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-[#5A4636]/45">未来一个月暂无提醒</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {upcoming.map((item) => (
              <div
                key={`${item.projectName}-${item.reminderDate}`}
                className="flex items-center justify-between rounded-2xl bg-[#F7F2EA] px-3.5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#5A4636]">
                    {item.projectName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5A4636]/50">
                    {item.reminderDate.replace(/-/g, ".")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#B88762]">
                  还有{item.daysLeft}天
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function NavButton({
  onClick,
  label,
  accent,
}: {
  onClick: () => void;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-8 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
        accent
          ? "bg-[#B88762] text-white shadow-[0_4px_12px_rgba(184,135,98,0.3)]"
          : "bg-white/80 text-[#5A4636] ring-1 ring-[#e8ddd0]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function toDateKey(year: number, month: number, day: number) {
  const monthText = String(month + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}
