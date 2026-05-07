import { RecordForm } from "@/components/record-form";
import { BackButton } from "@/components/back-button";

export default function AddPage() {
  return (
    <section className="space-y-4">
      <div>
        <BackButton />
        <h1 className="mt-3 text-xl font-semibold text-zinc-800 sm:text-2xl">新增记录</h1>
        <p className="mt-1 text-sm text-zinc-500">
          填写本次医美项目信息，提交后将保存到本地。
        </p>
      </div>
      <RecordForm />
    </section>
  );
}
