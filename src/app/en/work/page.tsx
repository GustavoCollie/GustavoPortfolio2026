import type { Metadata } from "next";
import Proyectos from "@/paginas/Proyectos";
import { UI } from "@/data/idioma";

export const metadata: Metadata = {
  title: UI.en.trabajo.titulo,
  description: UI.en.trabajo.entrada,
  alternates: {
    canonical: "/en/work",
    languages: { "es-PE": "/proyectos", en: "/en/work" },
  },
};

export default function Page() {
  return <Proyectos idioma="en" />;
}
