"use client";

import { useEffect } from "react";
import { formatCost } from "@/lib/constants";
import type { SavedRecord } from "@/lib/beauty-records";
import { FlowerRating } from "@/components/flower-rating";

type RecordDetailSheetProps = {
  record: SavedRecord | null;
  onClose: () => void;
};

export function RecordDetailSheet({ record, onClose }: RecordDetailSheetProps) {
  const open = record !== null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!record) {
    return null;
  }

  const satisfaction = record.satisfaction ?? record.rating;

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(90,70,54,0.18)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="记录详情"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 w-[calc(100vw-32px)] max-w-[430px] max-h-[58vh] -translate-x-1/2 overflow-y-auto rounded-[32px] bg-[#F7F2EA] px-5 pb-6 pt-4 shadow-[0_14px_40px_rgba(90,70,54,0.16)]"
        style={{ bottom: "calc(92px + env(safe-area-inset-bottom))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D7B79A]/60" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#5A4636]">{record.projectName}</h2>
            <p className="mt-1 text-xs text-[#5A4636]/45">
              {record.date.replace(/-/g, ".")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-3 py-1 text-sm text-[#5A4636]/60 transition hover:bg-white/60"
          >
            关闭
          </button>
        </div>

        {satisfaction ? (
          <div className="mb-4 flex items-center gap-2">
            <FlowerRating value={satisfaction} />
            <span className="text-xs text-[#B88762]">{satisfaction}/5</span>
          </div>
        ) : null}

        <div className="space-y-3">
          <DetailRow label="费用" value={record.cost ? formatCost(record.cost) : ""} />
          <DetailRow label="医院" value={record.hospital} />
          <DetailRow label="医生" value={record.doctor} />
          <DetailRow label="体验感受" value={record.experience} multiline />
          <DetailRow label="效果评价" value={record.effectEvaluation} multiline />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white/75 px-4 py-3 ring-1 ring-[#ece2d5]/70">
      <p className="text-[11px] text-[#5A4636]/45">{label}</p>
      <p
        className={[
          "mt-1 text-sm text-[#5A4636]",
          multiline ? "leading-relaxed" : "",
        ].join(" ")}
      >
        {trimmed}
      </p>
    </div>
  );
}
