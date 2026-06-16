import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { ToastProvider } from "@/components/toast-provider";
import { RecordsHydrator } from "@/components/records-hydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beautylog",
  description: "Beautylog · 记录今天的医美项目，让美丽被看见",
  applicationName: "Beautylog",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D7B79A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F7F2EA] text-[#5A4636]">
        <ToastProvider>
          <RecordsHydrator />
          <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pt-2 pb-28">
            <main className="flex-1">{children}</main>
          </div>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
