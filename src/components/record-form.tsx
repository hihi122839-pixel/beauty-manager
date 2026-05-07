"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";

type FormState = {
  projectName: string;
  date: string;
  area: string;
  rating: string;
  nextReminderDate: string;
  note: string;
  todayFeeling: string;
  satisfaction: number;
  statusTags: string[];
};

const initialState: FormState = {
  projectName: "",
  date: "",
  area: "",
  rating: "3",
  nextReminderDate: "",
  note: "",
  todayFeeling: "",
  satisfaction: 3,
  statusTags: [],
};

const statusOptions = ["泛红", "爆痘", "提亮", "紧致"];

export function RecordForm() {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("new-medical-record", {
      ...formData,
      rating: Number(formData.rating),
      imageFiles: imageFiles.map((file) => file.name),
    });
  };

  const toggleStatusTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      statusTags: prev.statusTags.includes(tag)
        ? prev.statusTags.filter((item) => item !== tag)
        : [...prev.statusTags, tag],
    }));
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []).slice(0, 3);
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles(selectedFiles);
    setImagePreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e8ddce]"
    >
      <InputField
        label="项目名称"
        value={formData.projectName}
        onChange={(value) => setFormData((prev) => ({ ...prev, projectName: value }))}
        placeholder="例如：水光补水"
      />
      <InputField
        label="日期"
        type="date"
        value={formData.date}
        onChange={(value) => setFormData((prev) => ({ ...prev, date: value }))}
      />
      <InputField
        label="部位"
        value={formData.area}
        onChange={(value) => setFormData((prev) => ({ ...prev, area: value }))}
        placeholder="例如：全脸"
      />
      <div className="space-y-1">
        <label className="text-sm text-zinc-600">感受评分（1-5）</label>
        <select
          className="w-full rounded-xl border border-[#e8ddce] bg-[#f8f3ec] px-3 py-2 text-zinc-700 outline-none transition focus:border-[#cdb8a0]"
          value={formData.rating}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, rating: event.target.value }))
          }
        >
          {[1, 2, 3, 4, 5].map((score) => (
            <option key={score} value={score}>
              {score}
            </option>
          ))}
        </select>
      </div>
      <InputField
        label="下次提醒日期"
        type="date"
        value={formData.nextReminderDate}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, nextReminderDate: value }))
        }
      />
      <div className="space-y-1">
        <label className="text-sm text-zinc-600">今日感受</label>
        <textarea
          value={formData.todayFeeling}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, todayFeeling: event.target.value }))
          }
          className="min-h-24 w-full rounded-xl border border-[#e8ddce] bg-[#f8f3ec] px-3 py-2 text-zinc-700 outline-none transition focus:border-[#cdb8a0]"
          placeholder="今天的皮肤状态、恢复感受..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-600">满意度</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, satisfaction: score }))}
              className={[
                "text-lg transition",
                score <= formData.satisfaction ? "text-[#b89d7e]" : "text-[#d7c7b2]",
              ].join(" ")}
              aria-label={`满意度 ${score} 星`}
            >
              ★
            </button>
          ))}
          <span className="ml-1 text-sm text-[#8f7d67]">{formData.satisfaction}/5</span>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-600">状态标签（可多选）</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((tag) => {
            const selected = formData.statusTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleStatusTag(tag)}
                className={[
                  "rounded-full px-3 py-1 text-xs transition",
                  selected
                    ? "bg-[#d8c4aa] text-white"
                    : "bg-[#efe4d6] text-[#7e6f5d] hover:bg-[#e2d4c2]",
                ].join(" ")}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-600">图片上传（1-3 张，本地预览）</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageChange}
          className="w-full rounded-xl border border-[#e8ddce] bg-[#f8f3ec] px-3 py-2 text-sm text-[#7e6f5d] file:mr-3 file:rounded-lg file:border-0 file:bg-[#d8c4aa] file:px-3 file:py-1 file:text-white"
        />
        {imagePreviewUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {imagePreviewUrls.map((url) => (
              <Image
                key={url}
                src={url}
                alt="本地预览"
                width={120}
                height={80}
                unoptimized
                className="h-20 w-full rounded-xl object-cover shadow-[0_6px_14px_rgba(179,156,126,0.16)]"
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-zinc-600">备注</label>
        <textarea
          value={formData.note}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, note: event.target.value }))
          }
          className="min-h-28 w-full rounded-xl border border-[#e8ddce] bg-[#f8f3ec] px-3 py-2 text-zinc-700 outline-none transition focus:border-[#cdb8a0]"
          placeholder="记录恢复情况、注意事项..."
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-[#d8bfb1] to-[#c8a89b] px-4 py-2.5 font-medium text-white transition hover:brightness-105"
      >
        提交记录
      </button>
    </form>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-zinc-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8ddce] bg-[#f8f3ec] px-3 py-2 text-zinc-700 outline-none transition focus:border-[#cdb8a0]"
      />
    </div>
  );
}
