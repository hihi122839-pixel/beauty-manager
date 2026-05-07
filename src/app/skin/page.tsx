"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BackButton } from "@/components/back-button";
import { useToast } from "@/components/toast-provider";

const DIARY_STORAGE_KEY = "skin-diary";
const UPLOAD_NAME_STORAGE_KEY = "skin-upload-file-name";
const HISTORY_STORAGE_KEY = "skin-diary-history";
const ISSUE_RECORDS_STORAGE_KEY = "skin-issue-records";

const mockHistory = [
  { date: "2026-04-14", summary: "左脸泛红、鼻子毛孔" },
  { date: "2026-04-10", summary: "额头痘痘、下巴干燥" },
  { date: "2026-04-05", summary: "右脸暗沉、左脸毛孔" },
];

type AreaName = "额头" | "眼周" | "鼻子" | "左脸" | "右脸" | "嘴周" | "下巴";

const AREA_OPTIONS: AreaName[] = [
  "额头",
  "眼周",
  "鼻子",
  "左脸",
  "右脸",
  "嘴周",
  "下巴",
];

const ISSUE_OPTIONS = [
  "黑眼圈",
  "干纹",
  "毛孔",
  "泛红",
  "爆痘",
  "干燥",
  "暗沉",
  "松弛",
];

const FACE_AREA_POSITIONS: Record<AreaName, { top: string; left: string }> = {
  额头: { top: "18%", left: "50%" },
  眼周: { top: "33%", left: "50%" },
  鼻子: { top: "48%", left: "50%" },
  左脸: { top: "52%", left: "24%" },
  右脸: { top: "52%", left: "76%" },
  嘴周: { top: "70%", left: "50%" },
  下巴: { top: "85%", left: "50%" },
};

type IssueRecord = { area: AreaName; issues: string[] };

export default function SkinPage() {
  const { showToast } = useToast();
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
  const [issueRecords, setIssueRecords] = useState<IssueRecord[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaName | null>(null);
  const [pickedIssues, setPickedIssues] = useState<string[]>([]);

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
    const savedIssues = localStorage.getItem(ISSUE_RECORDS_STORAGE_KEY);

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

    if (savedIssues) {
      try {
        const parsed = JSON.parse(savedIssues) as IssueRecord[];
        if (Array.isArray(parsed)) {
          setIssueRecords(
            parsed.filter(
              (entry) =>
                entry &&
                typeof entry.area === "string" &&
                AREA_OPTIONS.includes(entry.area as AreaName) &&
                Array.isArray(entry.issues)
            )
          );
        }
      } catch {
        localStorage.removeItem(ISSUE_RECORDS_STORAGE_KEY);
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

  useEffect(() => {
    localStorage.setItem(ISSUE_RECORDS_STORAGE_KEY, JSON.stringify(issueRecords));
  }, [issueRecords]);

  const togglePickedIssue = (issue: string) => {
    setPickedIssues((prev) =>
      prev.includes(issue) ? prev.filter((item) => item !== issue) : [...prev, issue]
    );
  };

  const handleAddIssueRecord = () => {
    if (!selectedArea) {
      showToast("请先选择部位", "error");
      return;
    }
    if (pickedIssues.length === 0) {
      showToast("请至少选择一个问题", "error");
      return;
    }

    const area = selectedArea;
    const issuesToAdd = pickedIssues;

    setIssueRecords((prev) => {
      const existing = prev.find((record) => record.area === area);
      if (existing) {
        return prev.map((record) =>
          record.area === area
            ? {
                ...record,
                issues: Array.from(new Set([...record.issues, ...issuesToAdd])),
              }
            : record
        );
      }
      return [...prev, { area, issues: issuesToAdd }];
    });

    setSelectedArea(null);
    setPickedIssues([]);
    showToast("已记录到当前问题", "success");
  };

  const handleRemoveIssue = (area: AreaName, issue: string) => {
    setIssueRecords((prev) =>
      prev.flatMap((record) => {
        if (record.area !== area) {
          return [record];
        }
        const nextIssues = record.issues.filter((item) => item !== issue);
        return nextIssues.length > 0 ? [{ ...record, issues: nextIssues }] : [];
      })
    );
  };

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
          <div className="mx-auto flex min-h-[380px] flex-col items-center justify-center rounded-[2rem] bg-gradient-to-b from-[#fbf5ec] via-[#f8f1e7] to-[#f4eadc] px-4 py-10 shadow-[inset_0_1px_10px_rgba(255,255,255,0.9),0_18px_36px_rgba(177,152,120,0.14)] sm:min-h-[520px] sm:px-6 sm:py-14">
            <div className="relative w-full max-w-[280px] sm:max-w-[400px]">
              <Image
                src="/face-neutral.png"
                alt="面部示意图"
                width={420}
                height={588}
                className="h-auto w-full object-contain [mix-blend-mode:multiply]"
                priority
              />
              {issueRecords.map((record) => {
                const position = FACE_AREA_POSITIONS[record.area];
                if (!position) {
                  return null;
                }
                return (
                  <span
                    key={record.area}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#e6d4bf]/85 px-2 py-0.5 text-[10px] font-medium text-[#6f5742] shadow-[0_4px_10px_rgba(170,142,108,0.18)] ring-1 ring-white/70 backdrop-blur-[1px] sm:text-[11px]"
                    style={{ top: position.top, left: position.left }}
                  >
                    {record.area} · {record.issues.length}
                  </span>
                );
              })}
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
            <p className="text-sm font-medium text-[#7e6f5d]">添加部位记录</p>

            <p className="mt-3 text-xs text-[#9a8770]">部位</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {AREA_OPTIONS.map((area) => {
                const isSelected = selectedArea === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setSelectedArea(isSelected ? null : area)}
                    className={[
                      "min-h-9 rounded-full px-3 py-1.5 text-xs transition",
                      isSelected
                        ? "bg-[#d8c4aa] text-white shadow-[0_6px_14px_rgba(170,142,108,0.24)]"
                        : "bg-[#fcf8f2] text-[#7e6f5d] ring-1 ring-[#eadfce] hover:bg-[#f7efe4]",
                    ].join(" ")}
                  >
                    {area}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-[#9a8770]">问题标签（可多选）</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ISSUE_OPTIONS.map((issue) => {
                const isSelected = pickedIssues.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => togglePickedIssue(issue)}
                    className={[
                      "min-h-9 rounded-full px-3 py-1.5 text-xs transition",
                      isSelected
                        ? "bg-[#e6d4bf] text-[#6f5742] ring-1 ring-[#d8c4aa]"
                        : "bg-[#fcf8f2] text-[#7e6f5d] ring-1 ring-[#eadfce] hover:bg-[#f7efe4]",
                    ].join(" ")}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddIssueRecord}
              className="mt-4 min-h-10 w-full rounded-xl bg-gradient-to-r from-[#d8bfb1] to-[#c8a89b] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_18px_rgba(170,138,108,0.24)] transition hover:brightness-105"
            >
              添加到当前记录
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f8f2e9] p-4">
            <p className="text-sm font-medium text-[#7e6f5d]">问题记录</p>
            {issueRecords.length === 0 ? (
              <p className="mt-3 text-xs text-[#9a8770]">
                暂无记录，从上方添加部位与问题，对应人脸区域将出现标识。
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm text-[#6f6253]">
                {issueRecords.map((record) => (
                  <li key={record.area} className="rounded-2xl bg-[#fcf8f2] p-3">
                    <p className="text-[13px] font-medium text-[#7e6f5d]">
                      {record.area}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {record.issues.map((issue) => (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => handleRemoveIssue(record.area, issue)}
                          className="group inline-flex items-center gap-1 rounded-full bg-[#e6d8c4] px-2.5 py-1 text-[11px] text-[#6f6253] transition hover:bg-[#dac8b0]"
                          aria-label={`移除 ${record.area} 的 ${issue}`}
                        >
                          {issue}
                          <span className="text-[#9a8770] transition group-hover:text-[#6f5742]">
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
