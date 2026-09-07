import type { MetadataRoute } from "next";
import { perfil } from "@/data/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${perfil.nombreCorto} — ${perfil.rol}`,
    short_name: perfil.nombreCorto,
    description: perfil.subtitular,
    start_url: "/",
    display: "standalone",
    background_color: "#06070a",
    theme_color: "#06070a",
    lang: "es-PE",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
