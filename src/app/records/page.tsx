"use client";

import { useSyncExternalStore } from "react";
import { BackButton } from "@/components/back-button";
import { RecordCard } from "@/components/record-card";
import {
  getBeautyRecordsSnapshot,
  getServerBeautyRecordsSnapshot,
  subscribeBeautyRecords,
  writeBeautyRecords,
} from "@/lib/beauty-records";
import { useToast } from "@/components/toast-provider";

export default function RecordsPage() {
  const { confirm, showToast } = useToast();
  const savedRecords = useSyncExternalStore(
    subscribeBeautyRecords,
    getBeautyRecordsSnapshot,
    getServerBeautyRecordsSnapshot
  );

  const sortedSaved = [...savedRecords].sort((a, b) => {
    const aTime = a.createdAt ?? a.date ?? "";
    const bTime = b.createdAt ?? b.date ?? "";
    return bTime.localeCompare(aTime);
  });

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      message: "确定删除这条记录吗？",
      confirmLabel: "删除",
    });

    if (!ok) {
      return;
    }

    writeBeautyRecords(savedRecords.filter((record) => record.id !== id));
    showToast("已删除该记录", "success");
  };

  return (
    <section className="space-y-4">
      <BackButton />
      <div>
        <h1 className="text-xl font-semibold text-zinc-800 sm:text-2xl">记录列表</h1>
        <p className="mt-1 text-sm text-zinc-500">
          所有记录均存储在你本地，可随时删除。
        </p>
      </div>

      {sortedSaved.length > 0 ? (
        <div className="space-y-3">
          {sortedSaved.map((record) => (
            <RecordCard key={record.id} record={record} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 p-4 text-sm text-zinc-500 ring-1 ring-[#ece2d5]">
          暂无记录，前往“新增记录”页填写并提交即可在这里看到。
        </div>
      )}
    </section>
  );
}
