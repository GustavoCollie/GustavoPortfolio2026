import type { Metadata } from "next";
import Cv from "@/paginas/Cv";
import { perfil } from "@/data/content";
import { UI } from "@/data/idioma";

export const metadata: Metadata = {
  // `absolute` evita la plantilla `%s · Gustavo Márquez` del layout: sin
  // esto el nombre salía dos veces, y como el navegador usa el título de
  // la pestaña para nombrar el PDF, el archivo se llamaba
  // «Currículum · Gustavo Márquez · Gustavo Márquez.pdf».
  title: { absolute: `${UI.es.perfil.cv.titulo} · ${perfil.nombreCorto}` },
  description: perfil.subtitular,
  alternates: { canonical: "/cv", languages: { "es-PE": "/cv", en: "/en/cv" } },
  // No se indexa: la versión que Google debe mostrar es el sitio, no su
  // documento imprimible, que además duplicaría todo el texto.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <Cv idioma="es" />;
}
