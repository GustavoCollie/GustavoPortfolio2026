import type { Metadata } from "next";
import SobreMi from "@/paginas/SobreMi";
import { UI } from "@/data/idioma";
import { manifiesto } from "@/data/content";

export const metadata: Metadata = {
  title: UI.es.perfil.titulo,
  description: manifiesto.texto,
  alternates: {
    canonical: "/sobre-mi",
    languages: { "es-PE": "/sobre-mi", en: "/en/about" },
  },
};

export default function Page() {
  return <SobreMi idioma="es" />;
}
