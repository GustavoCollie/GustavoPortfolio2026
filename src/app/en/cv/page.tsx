import type { Metadata } from "next";
import Cv from "@/paginas/Cv";
import { perfil } from "@/data/content.en";
import { UI } from "@/data/idioma";

export const metadata: Metadata = {
  title: { absolute: `${UI.en.perfil.cv.titulo} · ${perfil.nombreCorto}` },
  description: perfil.subtitular,
  alternates: { canonical: "/en/cv", languages: { "es-PE": "/cv", en: "/en/cv" } },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <Cv idioma="en" />;
}
