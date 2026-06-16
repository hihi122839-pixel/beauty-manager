"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatCost, PROJECT_TAGS, calcReminderDate, type ProjectTag } from "@/lib/constants";
import {
  deleteBeautyRecord,
  getBeautyRecordById,
  getRecordReminderDate,
  updateBeautyRecord,
  type SavedRecord,
} from "@/lib/beauty-records";
import { FlowerRating } from "@/components/flower-rating";
import { useToast } from "@/components/toast-provider";

type RecordDetailSheetProps = {
  record: SavedRecord | null;
  onClose: () => void;
  onRecordUpdated?: (record: SavedRecord) => void;
};

type SheetMode = "view" | "edit";

type EditFormState = {
  projectName: string;
  projectTag: ProjectTag | "";
  date: string;
  cost: string;
  hospital: string;
  doctor: string;
  experience: string;
  effectEvaluation: string;
  satisfaction: number;
  cycleDays: string;
  reminderDate: string;
};

function inferProjectTag(record: SavedRecord): ProjectTag | "" {
  if (record.projectTag && PROJECT_TAGS.includes(record.projectTag as ProjectTag)) {
    return record.projectTag as ProjectTag;
  }
  return PROJECT_TAGS.find((tag) => record.projectName.includes(tag)) ?? "";
}

function recordToForm(record: SavedRecord): EditFormState {
  return {
    projectName: record.projectName,
    projectTag: inferProjectTag(record),
    date: record.date,
    cost: record.cost !== undefined ? String(record.cost) : "",
    hospital: record.hospital ?? "",
    doctor: record.doctor ?? "",
    experience: record.experience ?? "",
    effectEvaluation: record.effectEvaluation ?? "",
    satisfaction: record.satisfaction ?? record.rating ?? 5,
    cycleDays: record.cycleDays !== undefined ? String(record.cycleDays) : "",
    reminderDate: getRecordReminderDate(record) ?? "",
  };
}

export function RecordDetailSheet({
  record,
  onClose,
  onRecordUpdated,
}: RecordDetailSheetProps) {
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

  return (
    <RecordDetailSheetContent
      key={record.id}
      record={record}
      onClose={onClose}
      onRecordUpdated={onRecordUpdated}
    />
  );
}

function RecordDetailSheetContent({
  record,
  onClose,
  onRecordUpdated,
}: {
  record: SavedRecord;
  onClose: () => void;
  onRecordUpdated?: (record: SavedRecord) => void;
}) {
  const { showToast, confirm } = useToast();
  const [mode, setMode] = useState<SheetMode>("view");
  const [formData, setFormData] = useState<EditFormState>(() => recordToForm(record));
  const [viewRecord, setViewRecord] = useState(record);

  const satisfaction = viewRecord.satisfaction ?? viewRecord.rating;

  const handleTagSelect = (tag: ProjectTag) => {
    setFormData((prev) => ({
      ...prev,
      projectTag: tag,
      projectName: tag === "其它" ? prev.projectName : tag,
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => {
      const next = { ...prev, date };
      const days = Number(prev.cycleDays);
      if (days > 0) {
        next.reminderDate = calcReminderDate(date, days);
      }
      return next;
    });
  };

  const handleCycleDaysChange = (cycleDays: string) => {
    setFormData((prev) => {
      const next = { ...prev, cycleDays };
      const days = Number(cycleDays);
      if (days > 0 && prev.date) {
        next.reminderDate = calcReminderDate(prev.date, days);
      } else if (!cycleDays) {
        next.reminderDate = "";
      }
      return next;
    });
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.projectName.trim();
    if (!name) {
      showToast("请填写项目名称", "error");
      return;
    }

    const cost = formData.cost ? Number(formData.cost) : undefined;
    const cycleDays = formData.cycleDays ? Number(formData.cycleDays) : undefined;
    const reminderDate = formData.reminderDate.trim() || undefined;

    try {
      updateBeautyRecord(record.id, {
        projectName: name,
        projectTag: formData.projectTag || undefined,
        date: formData.date,
        cost: cost !== undefined && !Number.isNaN(cost) ? cost : undefined,
        hospital: formData.hospital.trim(),
        doctor: formData.doctor.trim(),
        experience: formData.experience.trim(),
        effectEvaluation: formData.effectEvaluation.trim(),
        satisfaction: formData.satisfaction,
        cycleDays:
          cycleDays !== undefined && !Number.isNaN(cycleDays) && cycleDays > 0
            ? cycleDays
            : undefined,
        reminderDate,
        nextReminderDate: reminderDate,
      });
    } catch (error) {
      console.error("update record failed", error);
      showToast("保存失败，请稍后再试", "error");
      return;
    }

    const updated = getBeautyRecordById(record.id);
    if (updated) {
      setViewRecord(updated);
      setFormData(recordToForm(updated));
      onRecordUpdated?.(updated);
    }
    setMode("view");
    showToast("记录已更新", "success");
  };

  const handleDelete = async () => {
    const ok = await confirm({
      message: "确定删除这条记录吗？",
      confirmLabel: "删除",
    });
    if (!ok) {
      return;
    }

    try {
      deleteBeautyRecord(record.id);
    } catch (error) {
      console.error("delete record failed", error);
      showToast("删除失败，请稍后再试", "error");
      return;
    }

    showToast("记录已删除", "success");
    onClose();
  };

  const handleCancelEdit = () => {
    setFormData(recordToForm(viewRecord));
    setMode("view");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(90,70,54,0.18)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "edit" ? "编辑记录" : "记录详情"}
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 w-[calc(100vw-32px)] max-w-[430px] max-h-[58vh] -translate-x-1/2 overflow-y-auto rounded-[32px] bg-[#F7F2EA] px-5 pb-6 pt-4 shadow-[0_14px_40px_rgba(90,70,54,0.16)]"
        style={{ bottom: "calc(92px + env(safe-area-inset-bottom))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D7B79A]/60" />

        {mode === "view" ? (
          <>
            <div className="mb-5 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[#5A4636]">
                  {viewRecord.projectName}
                </h2>
                <p className="mt-1 text-xs text-[#5A4636]/45">
                  {viewRecord.date.replace(/-/g, ".")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className="rounded-full px-2.5 py-1 text-xs text-[#B88762] transition hover:bg-white/60"
                >
                  修改
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full px-2.5 py-1 text-xs text-[#9a6f5f] transition hover:bg-[#f3e8e2]"
                >
                  删除
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-2.5 py-1 text-xs text-[#5A4636]/60 transition hover:bg-white/60"
                >
                  关闭
                </button>
              </div>
            </div>

            {satisfaction ? (
              <div className="mb-4 flex items-center gap-2">
                <FlowerRating value={satisfaction} />
                <span className="text-xs text-[#B88762]">{satisfaction}/5</span>
              </div>
            ) : null}

            <div className="space-y-3">
              <DetailRow
                label="费用"
                value={viewRecord.cost ? formatCost(viewRecord.cost) : ""}
              />
              <DetailRow label="医院" value={viewRecord.hospital} />
              <DetailRow label="医生" value={viewRecord.doctor} />
              <DetailRow
                label="复做周期"
                value={viewRecord.cycleDays ? `${viewRecord.cycleDays} 天` : ""}
              />
              <DetailRow
                label="下次提醒"
                value={getRecordReminderDate(viewRecord)?.replace(/-/g, ".")}
              />
              <DetailRow label="体验感受" value={viewRecord.experience} multiline />
              <DetailRow label="效果评价" value={viewRecord.effectEvaluation} multiline />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#5A4636]">修改记录</h2>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full px-3 py-1 text-sm text-[#5A4636]/60 transition hover:bg-white/60"
              >
                取消
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-2">
                <label className="text-sm text-[#5A4636]/80">项目标签</label>
                <div className="flex flex-wrap gap-1.5">
                  {PROJECT_TAGS.map((tag) => {
                    const selected = formData.projectTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagSelect(tag)}
                        className={[
                          "min-h-9 rounded-full px-3 py-1.5 text-xs transition",
                          selected
                            ? "bg-[#B88762] text-white shadow-[0_4px_12px_rgba(184,135,98,0.3)]"
                            : "bg-white/80 text-[#5A4636] ring-1 ring-[#e8ddd0]",
                        ].join(" ")}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field
                label="项目名称"
                value={formData.projectName}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, projectName: value }))
                }
              />
              <Field
                label="日期"
                type="date"
                value={formData.date}
                onChange={handleDateChange}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="复做周期（天）"
                  type="number"
                  value={formData.cycleDays}
                  onChange={handleCycleDaysChange}
                  placeholder="例如 35"
                />
                <Field
                  label="下次提醒日期"
                  type="date"
                  value={formData.reminderDate}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, reminderDate: value }))
                  }
                />
              </div>
              <Field
                label="费用"
                type="number"
                value={formData.cost}
                onChange={(value) => setFormData((prev) => ({ ...prev, cost: value }))}
                placeholder="例如：2800"
              />
              <Field
                label="医院"
                value={formData.hospital}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, hospital: value }))
                }
              />
              <Field
                label="医生（可选）"
                value={formData.doctor}
                onChange={(value) => setFormData((prev) => ({ ...prev, doctor: value }))}
              />

              <div className="space-y-1.5">
                <label className="text-sm text-[#5A4636]/80">体验感受</label>
                <textarea
                  value={formData.experience}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, experience: event.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm text-[#5A4636] outline-none ring-1 ring-[#e8ddd0] focus:ring-[#D7B79A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-[#5A4636]/80">效果评价</label>
                <textarea
                  value={formData.effectEvaluation}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      effectEvaluation: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm text-[#5A4636] outline-none ring-1 ring-[#e8ddd0] focus:ring-[#D7B79A]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#5A4636]/80">满意度</label>
                <div className="flex items-center gap-2">
                  <FlowerRating
                    value={formData.satisfaction}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, satisfaction: value }))
                    }
                  />
                  <span className="text-sm text-[#B88762]">{formData.satisfaction}/5</span>
                </div>
              </div>

              <button
                type="submit"
                className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#D7B79A] to-[#B88762] text-base font-medium text-white shadow-[0_8px_24px_rgba(184,135,98,0.35)] transition hover:brightness-105"
              >
                保存修改
              </button>
            </form>
          </>
        )}
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

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "date";
};

function Field({ label, value, onChange, placeholder, type = "text" }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-[#5A4636]/80">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-2xl border-0 bg-white/80 px-4 py-2.5 text-sm text-[#5A4636] outline-none ring-1 ring-[#e8ddd0] focus:ring-[#D7B79A]"
      />
    </div>
  );
}
