import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beautylog",
    short_name: "Beautylog",
    description: "Beautylog · 记录护理项目、皮肤变化与提醒时间",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F2E9",
    theme_color: "#D7C3A8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
