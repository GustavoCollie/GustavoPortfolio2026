import type { Metadata } from "next";
import Contacto from "@/paginas/Contacto";
import { UI } from "@/data/idioma";

export const metadata: Metadata = {
  title: UI.en.contacto.titulo,
  description: UI.en.contacto.entrada,
  alternates: {
    canonical: "/en/contact",
    languages: { "es-PE": "/contacto", en: "/en/contact" },
  },
};

export default function Page() {
  return <Contacto idioma="en" />;
}
