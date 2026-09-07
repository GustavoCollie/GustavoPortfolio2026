import type { Metadata } from "next";
import SobreMi from "@/paginas/SobreMi";
import { UI } from "@/data/idioma";
import { manifiesto } from "@/data/content.en";

export const metadata: Metadata = {
  title: UI.en.perfil.titulo,
  description: manifiesto.texto,
  alternates: {
    canonical: "/en/about",
    languages: { "es-PE": "/sobre-mi", en: "/en/about" },
  },
};

export default function Page() {
  return <SobreMi idioma="en" />;
}
