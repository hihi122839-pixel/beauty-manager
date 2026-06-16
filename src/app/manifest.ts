import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beautylog",
    short_name: "Beautylog",
    description: "Beautylog · 记录今天的医美项目，让美丽被看见",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F2EA",
    theme_color: "#D7B79A",
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
