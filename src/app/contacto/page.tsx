import type { Metadata } from "next";
import Contacto from "@/paginas/Contacto";
import { UI } from "@/data/idioma";

export const metadata: Metadata = {
  title: UI.es.contacto.titulo,
  description: UI.es.contacto.entrada,
  alternates: {
    canonical: "/contacto",
    languages: { "es-PE": "/contacto", en: "/en/contact" },
  },
};

export default function Page() {
  return <Contacto idioma="es" />;
}
