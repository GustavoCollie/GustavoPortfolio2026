import type { Metadata } from "next";
import Home from "@/paginas/Home";
import { perfil } from "@/data/content.en";

export const metadata: Metadata = {
  title: `${perfil.nombreCorto} — ${perfil.rol}`,
  description: perfil.subtitular,
  alternates: { canonical: "/en", languages: { "es-PE": "/", en: "/en" } },
};

export default function Page() {
  return <Home idioma="en" />;
}
