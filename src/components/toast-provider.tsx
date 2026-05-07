"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "info" | "success" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ConfirmOptions = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2000;

const toneStyles: Record<ToastTone, string> = {
  info: "bg-[#f7efe4] text-[#5b4b3a]",
  success: "bg-[#efe4d0] text-[#5b4b3a]",
  error: "bg-[#f3dccd] text-[#7a4a3a]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<
    | (ConfirmOptions & {
        resolve: (value: boolean) => void;
      })
    | null
  >(null);
  const idRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, tone = "info") => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  const confirm = useCallback<ToastContextValue["confirm"]>((options) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const handleConfirmClose = useCallback(
    (result: boolean) => {
      if (!confirmState) {
        return;
      }
      confirmState.resolve(result);
      setConfirmState(null);
    },
    [confirmState]
  );

  useEffect(() => {
    if (!confirmState) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleConfirmClose(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [confirmState, handleConfirmClose]);

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, confirm }),
    [showToast, confirm]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto w-full max-w-xs rounded-2xl px-4 py-3 text-center text-sm font-medium shadow-[0_10px_28px_rgba(178,155,123,0.18)] ring-1 ring-white/70 sm:max-w-sm",
              toneStyles[toast.tone],
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        ))}
      </div>

      {confirmState ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#3a2c1f]/30 px-4 pb-8 pt-6 backdrop-blur-sm sm:items-center sm:pb-6"
          role="dialog"
          aria-modal="true"
          onClick={() => handleConfirmClose(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#fbf5ec] p-5 text-[#5b4b3a] shadow-[0_18px_40px_rgba(132,108,82,0.22)] ring-1 ring-white/70"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-base font-medium leading-relaxed">
              {confirmState.message}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="min-h-11 flex-1 rounded-xl bg-white/85 text-sm font-medium text-[#7e6f5d] ring-1 ring-[#eadfce] transition hover:bg-white"
              >
                {confirmState.cancelLabel ?? "取消"}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-[#d8bfb1] to-[#c8a89b] text-sm font-medium text-white shadow-[0_8px_18px_rgba(170,142,108,0.24)] transition hover:brightness-105"
              >
                {confirmState.confirmLabel ?? "确认"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
