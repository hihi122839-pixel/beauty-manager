import { RecordForm } from "@/components/record-form";

export default function AddPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-800">新增记录</h1>
        <p className="mt-1 text-sm text-zinc-500">
          填写本次医美项目信息，提交后会先输出到控制台。
        </p>
      </div>
      <RecordForm />
    </section>
  );
}
