"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/calendar", label: "日历" },
  { href: "/skin", label: "皮肤" },
  { href: "/records", label: "记录" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex items-center justify-center gap-1 rounded-full bg-white/70 p-1 shadow-[0_10px_24px_rgba(178,159,128,0.15)] ring-1 ring-white/85 backdrop-blur sm:gap-2 sm:p-1.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-5 sm:py-2",
              isActive
                ? "bg-gradient-to-r from-[#e8dcc9] to-[#f3eadf] text-[#6f6253] shadow-[0_8px_18px_rgba(170,150,118,0.26)]"
                : "text-[#9f907b] hover:bg-white/85 hover:text-[#7d6f5d]",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
