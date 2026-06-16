"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "今日", icon: "🏠" },
  { href: "/calendar", label: "日历", icon: "📅" },
  { href: "/profile", label: "我的", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-around gap-1 rounded-[2rem] border border-white/60 bg-white/72 px-2 py-2 shadow-[0_8px_32px_rgba(90,70,54,0.12)] ring-1 ring-[#e8ddd0]/80 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-h-11 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] px-2 py-1.5 text-[11px] font-medium transition",
                isActive
                  ? "bg-[#D7B79A]/35 text-[#B88762]"
                  : "text-[#5A4636]/70 hover:text-[#5A4636]",
              ].join(" ")}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
