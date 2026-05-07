"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex min-h-10 w-fit items-center rounded-full bg-white/75 px-3.5 py-2 text-sm font-medium text-[#7e6f5d] shadow-[0_6px_16px_rgba(178,155,123,0.12)] ring-1 ring-[#eadfce] transition hover:bg-white sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs"
    >
      ‹ 返回
    </button>
  );
}
