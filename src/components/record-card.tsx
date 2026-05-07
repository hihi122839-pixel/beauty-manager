import type { MedicalRecord } from "@/lib/mock-data";
import Image from "next/image";

type RecordCardProps = {
  record: MedicalRecord;
  onDelete?: (id: string) => void;
};

export function RecordCard({ record, onDelete }: RecordCardProps) {
  const stars = "★".repeat(record.rating) + "☆".repeat(5 - record.rating);
  const status = record.rating >= 4 ? "状态佳" : "观察中";
  const diaryStars = "★".repeat(record.satisfaction ?? 0) + "☆".repeat(5 - (record.satisfaction ?? 0));

  return (
    <article className="w-full rounded-3xl bg-white/92 p-4 shadow-[0_14px_36px_rgba(179,156,126,0.14)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-800">
          {record.projectName}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-full bg-[#f7f1e8] px-3 py-1 text-[11px] font-medium text-[#a5947e]">
            {record.date}
          </span>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(record.id)}
              className="min-h-9 rounded-full bg-[#f7efe4] px-3 py-1.5 text-xs font-medium text-[#9a7562] ring-1 ring-[#eadfce] transition hover:bg-[#efe2d2] sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-[11px]"
            >
              删除
            </button>
          ) : null}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#efe6d8] px-2.5 py-1 text-[11px] font-medium text-[#8e7a63]">
          部位 {record.area}
        </span>
        <span className="rounded-full bg-[#f4ece1] px-2.5 py-1 text-[11px] font-medium text-[#9f8a70]">
          {status}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-zinc-600">
        <div className="col-span-2">
          <dt className="mb-1 text-zinc-400">感受评分</dt>
          <dd className="text-sm tracking-[0.14em] text-[#b8a188]">{stars}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">下次提醒</dt>
          <dd>{record.nextReminderDate}</dd>
        </div>
      </dl>
      {record.todayFeeling ? (
        <div className="mt-4 rounded-2xl bg-[#f8f2e9] p-3">
          <p className="text-xs font-medium text-[#9f8a70]">今日感受</p>
          <p className="mt-1 text-sm text-[#6f6253]">{record.todayFeeling}</p>
          {record.satisfaction ? (
            <p className="mt-1 text-xs tracking-[0.12em] text-[#b8a188]">
              满意度 {diaryStars}
            </p>
          ) : null}
        </div>
      ) : null}
      {record.statusTags && record.statusTags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {record.statusTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#efe4d6] px-2.5 py-1 text-[11px] font-medium text-[#7e6f5d]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {record.imageUrls && record.imageUrls.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {record.imageUrls.slice(0, 3).map((url) => (
            <Image
              key={url}
              src={url}
              alt={`${record.projectName} 记录图`}
              width={120}
              height={80}
              unoptimized
              className="h-20 w-full rounded-2xl object-cover shadow-[0_6px_14px_rgba(179,156,126,0.14)]"
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
