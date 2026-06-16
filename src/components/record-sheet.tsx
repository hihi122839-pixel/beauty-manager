"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getBeautyRecordsSnapshot,
  writeBeautyRecords,
  type SavedRecord,
} from "@/lib/beauty-records";
import { PROJECT_TAGS, calcReminderDate, toDateKey, type ProjectTag } from "@/lib/constants";
import { FlowerRating } from "@/components/flower-rating";
import { useToast } from "@/components/toast-provider";

type RecordSheetProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  projectName: string;
  projectTag: ProjectTag | "";
  date: string;
  cycleDays: string;
  reminderDate: string;
  cost: string;
  hospital: string;
  doctor: string;
  experience: string;
  effectEvaluation: string;
  satisfaction: number;
};

const initialState = (): FormState => ({
  projectName: "",
  projectTag: "",
  date: toDateKey(new Date()),
  cycleDays: "",
  reminderDate: "",
  cost: "",
  hospital: "",
  doctor: "",
  experience: "",
  effectEvaluation: "",
  satisfaction: 5,
});

export function RecordSheet({ open, onClose }: RecordSheetProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormState>(initialState);

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

  const handleClose = () => {
    setFormData(initialState());
    onClose();
  };

  if (!open) {
    return null;
  }

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

  const handleReminderDateChange = (reminderDate: string) => {
    setFormData((prev) => ({ ...prev, reminderDate }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.projectName.trim();
    if (!name) {
      showToast("请填写项目名称", "error");
      return;
    }

    const cost = formData.cost ? Number(formData.cost) : undefined;
    const cycleDays = formData.cycleDays ? Number(formData.cycleDays) : undefined;

    const record: SavedRecord = {
      id: `${Date.now()}`,
      projectName: name,
      projectTag: formData.projectTag || undefined,
      date: formData.date,
      cycleDays:
        cycleDays !== undefined && !Number.isNaN(cycleDays) && cycleDays > 0
          ? cycleDays
          : undefined,
      reminderDate: formData.reminderDate || undefined,
      nextReminderDate: formData.reminderDate || undefined,
      cost: cost && !Number.isNaN(cost) ? cost : undefined,
      hospital: formData.hospital.trim(),
      doctor: formData.doctor.trim(),
      experience: formData.experience.trim(),
      effectEvaluation: formData.effectEvaluation.trim(),
      satisfaction: formData.satisfaction,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = getBeautyRecordsSnapshot();
      writeBeautyRecords([record, ...existing]);
    } catch (error) {
      console.error("save record failed", error);
      showToast("保存失败，请稍后再试", "error");
      return;
    }

    setFormData(initialState());
    showToast("记录已保存", "success");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3a2c1f]/25 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-[#F7F2EA] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_40px_rgba(90,70,54,0.15)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D7B79A]/60" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#5A4636]">记录今天</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-3 py-1 text-sm text-[#5A4636]/60 transition hover:bg-white/60"
          >
            关闭
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(value) => setFormData((prev) => ({ ...prev, projectName: value }))}
            placeholder="例如：光子嫩肤"
          />
          <Field
            label="项目日期"
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
              onChange={handleReminderDateChange}
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
            onChange={(value) => setFormData((prev) => ({ ...prev, hospital: value }))}
            placeholder="例如：某某医美中心"
          />
          <Field
            label="医生（可选）"
            value={formData.doctor}
            onChange={(value) => setFormData((prev) => ({ ...prev, doctor: value }))}
            placeholder="例如：张医生"
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
              placeholder="今天的体验、恢复感受..."
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
              placeholder="效果如何、是否满意..."
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
            保存记录
          </button>
        </form>
      </div>
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
