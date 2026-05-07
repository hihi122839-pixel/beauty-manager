"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BackButton } from "@/components/back-button";

const DIARY_STORAGE_KEY = "skin-diary";
const UPLOAD_NAME_STORAGE_KEY = "skin-upload-file-name";
const HISTORY_STORAGE_KEY = "skin-diary-history";

const mockHistory = [
  { date: "2026-04-14", summary: "左脸泛红、鼻子毛孔" },
  { date: "2026-04-10", summary: "额头痘痘、下巴干燥" },
  { date: "2026-04-05", summary: "右脸暗沉、左脸毛孔" },
];

const currentIssueRecords = [
  { area: "眼周", issues: ["黑眼圈", "干纹"] },
  { area: "鼻子", issues: ["毛孔"] },
  { area: "嘴周", issues: ["干燥"] },
];

export default function SkinPage() {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [diary, setDiary] = useState({
    feeling: "",
    change: "",
    advice: "",
  });
  const [editingField, setEditingField] = useState<"feeling" | "change" | "advice" | null>(null);
  const [diaryHistory, setDiaryHistory] = useState<
    Array<{
      id: string;
      date: string;
      feeling: string;
      change: string;
      advice: string;
    }>
  >([]);

  const today = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    const savedDiary = localStorage.getItem(DIARY_STORAGE_KEY);
    const savedUploadName = localStorage.getItem(UPLOAD_NAME_STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (savedDiary) {
      try {
        const parsed = JSON.parse(savedDiary) as typeof diary;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDiary({
          feeling: parsed.feeling ?? "",
          change: parsed.change ?? "",
          advice: parsed.advice ?? "",
        });
      } catch {
        localStorage.removeItem(DIARY_STORAGE_KEY);
      }
    }

    if (savedUploadName) {
      setUploadedFileName(savedUploadName);
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as Array<{
          id: string;
          date: string;
          feeling?: string;
          change?: string;
          advice?: string;
          postProcedure?: string;
          doctorAdvice?: string;
        }>;
        if (Array.isArray(parsed)) {
          setDiaryHistory(
            parsed.map((entry) => ({
              id: entry.id,
              date: entry.date,
              feeling: entry.feeling ?? "",
              change: entry.change ?? entry.postProcedure ?? "",
              advice: entry.advice ?? entry.doctorAdvice ?? "",
            }))
          );
        }
      } catch {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(diary));
  }, [diary]);

  useEffect(() => {
    if (uploadedFileName) {
      localStorage.setItem(UPLOAD_NAME_STORAGE_KEY, uploadedFileName);
      return;
    }
    localStorage.removeItem(UPLOAD_NAME_STORAGE_KEY);
  }, [uploadedFileName]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(diaryHistory));
  }, [diaryHistory]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadedFileName(file?.name ?? null);

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    if (file?.type.startsWith("image/")) {
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const getDiarySummary = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "点击记录";
    }
    return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
  };

  const saveDiaryHistory = () => {
    const hasContent = Object.values(diary).some((value) => value.trim());
    if (!hasContent) {
      return;
    }

    const nextEntry = {
      id: `${Date.now()}`,
      date: today,
      feeling: getDiarySummary(diary.feeling),
      change: getDiarySummary(diary.change),
      advice: getDiarySummary(diary.advice),
    };

    setDiaryHistory((prev) => {
      const latest = prev[0];
      if (
        latest &&
        latest.feeling === nextEntry.feeling &&
        latest.change === nextEntry.change &&
        latest.advice === nextEntry.advice
      ) {
        return prev;
      }
      return [nextEntry, ...prev];
    });
  };

  return (
    <section className="space-y-5 sm:space-y-7">
      <BackButton />
      <div className="rounded-3xl bg-gradient-to-br from-[#fdf9f2] via-[#f8f1e7] to-[#efe4d6] p-5 shadow-[0_12px_30px_rgba(178,154,122,0.15)] ring-1 ring-white/70 sm:p-6">
        <p className="text-sm font-medium text-[#9f8d74]">皮肤状态可视化记录</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-800 sm:text-3xl">
          皮肤问题记录
        </h1>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl bg-gradient-to-b from-white/95 to-[#f7efe4] p-5 shadow-[0_12px_28px_rgba(169,143,111,0.14)] ring-1 ring-[#ece2d5] sm:p-8">
          <div className="mx-auto flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] bg-gradient-to-b from-[#fbf5ec] via-[#f8f1e7] to-[#f4eadc] px-4 py-8 shadow-[inset_0_1px_10px_rgba(255,255,255,0.9),0_18px_36px_rgba(177,152,120,0.14)] sm:min-h-[460px] sm:px-6 sm:py-12">
            <div className="flex w-full justify-center py-2 sm:py-3">
              <Image
                src="/face-neutral.png"
                alt="面部示意图"
                width={300}
                height={420}
                className="h-auto w-full max-w-[220px] object-contain [mix-blend-mode:multiply] sm:max-w-[300px]"
                priority
              />
            </div>
            <p className="mt-4 text-center text-xs tracking-[0.02em] text-[#9a8770] sm:mt-5">
              用于辅助记录皮肤问题分布与变化
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white/88 p-4 shadow-[0_10px_24px_rgba(179,156,126,0.08)] ring-1 ring-[#ece2d5] sm:p-5">
          <h2 className="text-lg font-semibold text-[#6f6253]">当前记录</h2>
          <p className="mt-1 text-sm text-[#8f7d67]">日期：{today}</p>
          <div className="mt-4 rounded-2xl bg-[#f8f2e9] p-4">
            <p className="text-sm font-medium text-[#7e6f5d]">问题记录</p>
            <ul className="mt-3 space-y-3 text-sm text-[#6f6253]">
              {currentIssueRecords.map((record) => (
                <li key={record.area} className="rounded-2xl bg-[#fcf8f2] p-3">
                  <p className="text-[13px] font-medium text-[#7e6f5d]">{record.area}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {record.issues.map((issue) => (
                      <span
                        key={issue}
                        className="rounded-full bg-[#e6d8c4] px-2.5 py-1 text-[11px] text-[#6f6253]"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f8f2e9] p-4">
            <p className="text-sm font-medium text-[#7e6f5d]">上传皮肤测试报告</p>
            <p className="mt-1 text-xs text-[#9a8770]">支持图片或 PDF，仅保存在当前页面</p>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d8c8b4] bg-[#fcf8f2] px-4 py-3 text-xs text-[#7e6f5d] transition-colors hover:bg-[#f7efe4]">
              选择文件（图片 / PDF）
              <input
                type="file"
                accept="image/*,.pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {uploadedFileName ? (
              <div className="mt-3 rounded-xl bg-[#fcf8f2] p-3">
                <p className="text-xs text-[#7e6f5d]">已上传：{uploadedFileName}</p>
                {imagePreviewUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-[#eadfce] bg-[#f6eee2] p-2">
                    <Image
                      src={imagePreviewUrl}
                      alt="上传的皮肤测试报告预览"
                      width={320}
                      height={176}
                      unoptimized
                      className="mx-auto h-auto max-h-44 w-auto rounded-md object-contain"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-[#9a8770]">
                    当前文件为 PDF，将展示文件名用于本地记录。
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl bg-[#f8f2e9] p-4">
            <p className="text-sm font-medium text-[#7e6f5d]">皮肤变化日记</p>
            <div className="mt-3 space-y-3">
              <div
                onClick={() => setEditingField("feeling")}
                className="cursor-pointer rounded-2xl bg-[#fcf7ef] p-4 shadow-[0_6px_16px_rgba(178,155,123,0.12)]"
              >
                <p className="text-xs font-medium text-[#8f7d67]">今日皮肤感受</p>
                {editingField === "feeling" ? (
                  <div className="mt-2" onClick={(event) => event.stopPropagation()}>
                    <textarea
                      autoFocus
                      value={diary.feeling}
                      onChange={(event) =>
                        setDiary((prev) => ({ ...prev, feeling: event.target.value }))
                      }
                      onBlur={() => {
                        saveDiaryHistory();
                        setEditingField(null);
                      }}
                      rows={4}
                      className="w-full resize-none rounded-xl bg-[#f6eee2] px-3 py-2 text-sm text-[#6f6253] outline-none"
                      placeholder="例如：今日两颊偏干，T 区轻微出油"
                    />
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl bg-[#f7efe4] px-3 py-2 text-sm text-[#746757]">
                    {getDiarySummary(diary.feeling)}
                  </div>
                )}
              </div>

              <div
                onClick={() => setEditingField("change")}
                className="cursor-pointer rounded-2xl bg-[#fcf7ef] p-4 shadow-[0_6px_16px_rgba(178,155,123,0.12)]"
              >
                <p className="text-xs font-medium text-[#8f7d67]">医美后变化</p>
                {editingField === "change" ? (
                  <div className="mt-2" onClick={(event) => event.stopPropagation()}>
                    <textarea
                      autoFocus
                      value={diary.change}
                      onChange={(event) =>
                        setDiary((prev) => ({ ...prev, change: event.target.value }))
                      }
                      onBlur={() => {
                        saveDiaryHistory();
                        setEditingField(null);
                      }}
                      rows={4}
                      className="w-full resize-none rounded-xl bg-[#f6eee2] px-3 py-2 text-sm text-[#6f6253] outline-none"
                      placeholder="例如：术后第 3 天泛红明显缓解"
                    />
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl bg-[#f7efe4] px-3 py-2 text-sm text-[#746757]">
                    {getDiarySummary(diary.change)}
                  </div>
                )}
              </div>

              <div
                onClick={() => setEditingField("advice")}
                className="cursor-pointer rounded-2xl bg-[#fcf7ef] p-4 shadow-[0_6px_16px_rgba(178,155,123,0.12)]"
              >
                <p className="text-xs font-medium text-[#8f7d67]">医生建议</p>
                {editingField === "advice" ? (
                  <div className="mt-2" onClick={(event) => event.stopPropagation()}>
                    <textarea
                      autoFocus
                      value={diary.advice}
                      onChange={(event) =>
                        setDiary((prev) => ({ ...prev, advice: event.target.value }))
                      }
                      onBlur={() => {
                        saveDiaryHistory();
                        setEditingField(null);
                      }}
                      rows={4}
                      className="w-full resize-none rounded-xl bg-[#f6eee2] px-3 py-2 text-sm text-[#6f6253] outline-none"
                      placeholder="例如：加强保湿，避免高温环境"
                    />
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl bg-[#f7efe4] px-3 py-2 text-sm text-[#746757]">
                    {getDiarySummary(diary.advice)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/88 p-4 shadow-[0_10px_24px_rgba(179,156,126,0.08)] ring-1 ring-[#ece2d5] sm:p-5">
        <h2 className="text-lg font-semibold text-[#6f6253]">历史记录</h2>
        <div className="mt-3 space-y-3">
          {diaryHistory.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl bg-[#f8f2e9] p-4 shadow-[0_8px_18px_rgba(179,156,126,0.12)]"
            >
              <p className="text-xs text-[#9f8d74]">{entry.date}</p>
              <div className="mt-2 space-y-1.5 text-sm text-[#6f6253]">
                <p>
                  <span className="text-[#8f7d67]">今日皮肤感受：</span>
                  {entry.feeling}
                </p>
                <p>
                  <span className="text-[#8f7d67]">医美后变化：</span>
                  {entry.change}
                </p>
                <p>
                  <span className="text-[#8f7d67]">医生建议：</span>
                  {entry.advice}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-3 space-y-2.5">
          {mockHistory.map((entry) => (
            <article key={entry.date} className="rounded-2xl bg-[#f8f2e9] p-3.5">
              <p className="text-xs text-[#9f8d74]">{entry.date}</p>
              <p className="mt-1 text-sm text-[#6f6253]">{entry.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
