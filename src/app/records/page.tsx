import { RecordCard } from "@/components/record-card";
import { mockRecords } from "@/lib/mock-data";

export default function RecordsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-800">记录列表</h1>
        <p className="mt-1 text-sm text-zinc-500">
          这里展示当前的 mock 数据，后续可接入数据库。
        </p>
      </div>
      <div className="space-y-3">
        {mockRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </section>
  );
}
