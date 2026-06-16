import type { SavedRecord } from "@/lib/beauty-records";
import { FlowerRating } from "@/components/flower-rating";

type RecordBubbleProps = {
  record: SavedRecord;
  onClick: () => void;
};

export function RecordBubble({ record, onClick }: RecordBubbleProps) {
  const satisfaction = record.satisfaction ?? record.rating;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[24px] border border-[rgba(215,183,154,0.28)] bg-[#fffdfa] px-3.5 py-3 text-left shadow-[0_6px_14px_rgba(90,70,54,0.06)] transition active:scale-[0.99] active:bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="truncate text-[14px] font-semibold text-[#5A4636]">
            {record.projectName}
          </span>
          {satisfaction ? <FlowerRating value={satisfaction} size="sm" /> : null}
        </div>
        <time className="shrink-0 text-[10px] text-[#5A4636]/35">
          {record.date.replace(/-/g, ".")}
        </time>
      </div>
    </button>
  );
}
