"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { formatCost } from "@/lib/constants";
import {
  getBeautyRecordsSnapshot,
  getProfileSnapshot,
  getServerBeautyRecordsSnapshot,
  getServerProfileSnapshot,
  getStats,
  subscribeBeautyRecords,
  subscribeProfile,
  writeProfile,
  type UserProfile,
} from "@/lib/beauty-records";
import { useToast } from "@/components/toast-provider";

export default function ProfilePage() {
  const { showToast } = useToast();

  const records = useSyncExternalStore(
    subscribeBeautyRecords,
    getBeautyRecordsSnapshot,
    getServerBeautyRecordsSnapshot
  );

  const profile = useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    getServerProfileSnapshot
  );

  const [draft, setDraft] = useState<UserProfile | null>(null);
  const editing = draft !== null;

  const stats = useMemo(() => getStats(records), [records]);
  const initial = profile.name.charAt(0) || "美";

  const startEditing = () => {
    setDraft({ ...profile });
  };

  const handleSaveProfile = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!draft) {
      return;
    }

    try {
      writeProfile({
        name: draft.name,
        mood: draft.mood,
        avatar: draft.avatar,
      });
      setDraft(null);
      showToast("资料已保存", "success");
    } catch (error) {
      console.error("save profile failed", error);
      showToast("保存失败，请稍后再试", "error");
    }
  };

  return (
    <section className="space-y-6 pb-4">
      <header className="flex flex-col items-center pt-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D7B79A] to-[#B88762] text-2xl font-semibold text-white shadow-[0_12px_32px_rgba(184,135,98,0.35)]">
          {initial}
        </div>

        {editing && draft ? (
          <form
            onSubmit={handleSaveProfile}
            className="mt-4 w-full max-w-xs space-y-3"
          >
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) =>
                  prev ? { ...prev, name: event.target.value } : prev
                )
              }
              className="w-full rounded-2xl bg-white/80 px-4 py-2.5 text-center text-sm text-[#5A4636] ring-1 ring-[#e8ddd0] outline-none"
              placeholder="账户名"
            />
            <input
              value={draft.mood}
              onChange={(event) =>
                setDraft((prev) =>
                  prev ? { ...prev, mood: event.target.value } : prev
                )
              }
              className="w-full rounded-2xl bg-white/80 px-4 py-2.5 text-center text-sm text-[#5A4636] ring-1 ring-[#e8ddd0] outline-none"
              placeholder="心情签名"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#B88762] py-2.5 text-sm font-medium text-white"
            >
              保存
            </button>
          </form>
        ) : (
          <>
            <h1 className="mt-4 text-xl font-semibold text-[#5A4636]">{profile.name}</h1>
            <p className="mt-1.5 text-sm text-[#5A4636]/55">{profile.mood}</p>
            <button
              type="button"
              onClick={startEditing}
              className="mt-3 text-xs text-[#B88762]"
            >
              编辑资料
            </button>
          </>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="总项目数" value={String(stats.totalCount)} />
        <StatCard label="本月项目" value={String(stats.monthCount)} />
        <StatCard label="累计消费" value={formatCost(stats.totalCost) || "¥0"} />
        <StatCard label="最常做" value={stats.topProject} small />
        <StatCard label="最常去" value={stats.topHospital} small className="col-span-2" />
      </div>

      <div className="rounded-3xl bg-white/75 p-4 shadow-[0_8px_28px_rgba(90,70,54,0.08)] ring-1 ring-[#ece2d5]/80">
        <h2 className="text-base font-semibold text-[#5A4636]">项目排行榜</h2>
        {stats.rankings.length === 0 ? (
          <p className="mt-3 text-sm text-[#5A4636]/45">还没有记录</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {stats.rankings.slice(0, 5).map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between rounded-2xl bg-[#F7F2EA] px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D7B79A]/40 text-xs font-semibold text-[#B88762]">
                    {item.rank}
                  </span>
                  <span className="text-sm font-medium text-[#5A4636]">{item.name}</span>
                </div>
                <span className="text-sm text-[#B88762]">{item.count}次</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  small,
  className,
}: {
  label: string;
  value: string;
  small?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl bg-white/75 p-4 shadow-[0_4px_16px_rgba(90,70,54,0.06)] ring-1 ring-[#ece2d5]/80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-xs text-[#5A4636]/50">{label}</p>
      <p
        className={[
          "mt-1.5 font-semibold text-[#B88762]",
          small ? "text-sm leading-snug" : "text-2xl",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
