"use client";

import { useSyncExternalStore } from "react";
import { BackButton } from "@/components/back-button";
import { RecordCard } from "@/components/record-card";
import { mockRecords } from "@/lib/mock-data";
import {
  getBeautyRecordsSnapshot,
  getServerBeautyRecordsSnapshot,
  subscribeBeautyRecords,
  writeBeautyRecords,
} from "@/lib/beauty-records";

export default function RecordsPage() {
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

  const handleDelete = (id: string) => {
    if (!window.confirm("确定删除这条记录吗？")) {
      return;
    }

    writeBeautyRecords(savedRecords.filter((record) => record.id !== id));
  };

  return (
    <section className="space-y-4">
      <div>
        <BackButton />
        <h1 className="mt-3 text-xl font-semibold text-zinc-800 sm:text-2xl">记录列表</h1>
        <p className="mt-1 text-sm text-zinc-500">
          顶部展示本地新增的记录，下方为示例数据。
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
          暂无本地记录，前往“新增记录”页填写并提交即可在这里看到。
        </div>
      )}

      <div className="space-y-3">
        {mockRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </section>
  );
}
