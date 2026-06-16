"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, UserRound } from "lucide-react";

const navItems = [
  { href: "/", label: "记录", icon: Home },
  { href: "/calendar", label: "日程", icon: CalendarDays },
  { href: "/profile", label: "我的", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed left-1/2 z-40 w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2"
      style={{ bottom: "calc(16px + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex items-center justify-around gap-0.5 rounded-[1.5rem] border border-white/55 bg-white/78 px-1.5 py-1 shadow-[0_6px_24px_rgba(90,70,54,0.1)] ring-1 ring-[#e8ddd0]/70 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-h-10 min-w-[4.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-[1rem] px-2 py-1 text-[10px] font-medium transition",
                isActive
                  ? "bg-[#D7B79A]/30 text-[#B88762]"
                  : "text-[#9E9388]",
              ].join(" ")}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
