import type { Metadata } from "next";
import Proyectos from "@/paginas/Proyectos";
import { UI } from "@/data/idioma";

export const metadata: Metadata = {
  title: UI.es.trabajo.titulo,
  description: UI.es.trabajo.entrada,
  alternates: {
    canonical: "/proyectos",
    languages: { "es-PE": "/proyectos", en: "/en/work" },
  },
};

export default function Page() {
  return <Proyectos idioma="es" />;
}
