import { formatCost } from "@/lib/constants";
import type { SavedRecord } from "@/lib/beauty-records";
import { StarRating } from "@/components/star-rating";

type RecordBubbleProps = {
  record: SavedRecord;
};

export function RecordBubble({ record }: RecordBubbleProps) {
  const satisfaction = record.satisfaction ?? record.rating;

  return (
    <article className="flex justify-end">
      <div className="max-w-[88%] rounded-[1.35rem] rounded-br-md bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(90,70,54,0.1)] ring-1 ring-[#ece2d5]/80">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[#5A4636]">
            {record.projectName}
          </h3>
          <time className="shrink-0 text-[11px] text-[#5A4636]/50">
            {record.date.replace(/-/g, ".")}
          </time>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {satisfaction ? (
            <StarRating value={satisfaction} size="sm" />
          ) : null}
          {record.cost ? (
            <span className="text-xs font-medium text-[#B88762]">
              {formatCost(record.cost)}
            </span>
          ) : null}
        </div>

        {record.hospital ? (
          <p className="mt-2 text-xs text-[#5A4636]/65">{record.hospital}</p>
        ) : null}

        {record.experience ? (
          <p className="mt-2 text-sm leading-relaxed text-[#5A4636]/80">
            {record.experience}
          </p>
        ) : null}
      </div>
    </article>
  );
}
