import Link from "next/link";
import { RecordCard } from "@/components/record-card";
import { mockRecords } from "@/lib/mock-data";

export default function Home() {
  const latestRecord = mockRecords[0];
  const daysSinceLastProject = getDaysSince(latestRecord.date);
  const currentStage = daysSinceLastProject <= 7 ? "恢复期" : "稳定期";
  const upcomingCareItems = getUpcomingCareItems(mockRecords);

  return (
    <section className="space-y-9">
      <div className="rounded-3xl bg-gradient-to-br from-[#fdf9f2] via-[#f8f1e7] to-[#efe4d6] p-7 shadow-[0_16px_40px_rgba(178,154,122,0.18)] ring-1 ring-white/70 sm:p-8">
        <p className="text-sm font-medium text-[#9f8d74]">当前护理周期</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-800">
          医美管理助手
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75 backdrop-blur-sm">
            <p className="text-xs text-zinc-500/90">距离上次项目</p>
            <p className="mt-1 text-4xl font-semibold leading-none tracking-tight text-zinc-800">
              {daysSinceLastProject}
              <span className="ml-1 text-lg font-medium text-zinc-500">天</span>
            </p>
          </div>
          <div className="rounded-2xl bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75 backdrop-blur-sm">
            <p className="text-xs text-zinc-500/90">当前阶段</p>
            <p className="mt-1 text-xl font-semibold text-[#8b765e]">{currentStage}</p>
          </div>
          <div className="rounded-2xl bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/75 backdrop-blur-sm">
            <p className="text-xs text-zinc-500/90">下次建议时间</p>
            <p className="mt-1 text-xl font-semibold text-zinc-800">
              {latestRecord.nextReminderDate}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-[#f8f2e9] p-5 shadow-[0_8px_20px_rgba(179,156,126,0.08)] ring-1 ring-[#ece2d5]">
        <h2 className="text-lg font-semibold text-[#6f6253]">即将护理</h2>
        {upcomingCareItems.length === 0 ? (
          <p className="mt-3 text-sm text-[#8f7d67]">近期没有需要护理的项目</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {upcomingCareItems.map((item) => (
              <article
                key={`${item.id}-${item.nextReminderDate}`}
                className="rounded-2xl bg-[#fdf9f2] p-3.5 shadow-[0_4px_14px_rgba(179,156,126,0.08)] ring-1 ring-[#ece2d5]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#6f6253]">
                      <span className="mr-1.5 text-[#a58f74]">🔔</span>
                      {item.projectName}
                    </p>
                    <p className="mt-1 text-xs text-[#8f7d67]">{item.nextReminderDate}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#efe4d6] px-2.5 py-1 text-xs font-medium text-[#7e6f5d]">
                    还有 {item.daysLeft} 天
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">最近项目</p>
        <RecordCard record={latestRecord} />
      </div>

      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
        <Link
          href="/add"
          className="rounded-2xl bg-gradient-to-r from-[#d8bfb1] via-[#cfb2a4] to-[#c8a89b] px-4 py-4.5 text-center text-base font-semibold text-white shadow-[0_14px_30px_rgba(179,149,130,0.34)] transition hover:brightness-105"
        >
          新增记录
        </Link>
        <Link
          href="/records"
          className="rounded-2xl bg-white/72 px-4 py-4.5 text-center text-base font-medium text-[#8f7d67] ring-1 ring-[#d9ccba] transition hover:bg-white hover:text-[#6f6253]"
        >
          查看记录
        </Link>
      </div>
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

function getUpcomingCareItems(records: typeof mockRecords) {
  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;

  return records
    .map((record) => {
      const reminder = new Date(`${record.nextReminderDate}T00:00:00`);
      const diffDays = Math.ceil((reminder.getTime() - now.getTime()) / dayMs);
      return {
        ...record,
        daysLeft: diffDays,
      };
    })
    .filter((record) => record.daysLeft >= 0 && record.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);
}
