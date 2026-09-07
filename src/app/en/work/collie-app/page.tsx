import type { Metadata } from "next";
import Caso from "@/paginas/Caso";
import { casoCollieApp } from "@/data/content.en";

export const metadata: Metadata = {
  title: casoCollieApp.titulo,
  description: casoCollieApp.subtitulo,
  alternates: {
    canonical: "/en/work/collie-app",
    languages: { "es-PE": "/proyectos/collie-app", en: "/en/work/collie-app" },
  },
};

export default function Page() {
  return <Caso idioma="en" />;
}
