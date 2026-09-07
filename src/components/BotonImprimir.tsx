"use client";

import { useEffect } from "react";

/**
 * Abre el diálogo de impresión del navegador, donde «Guardar como PDF»
 * produce el archivo.
 *
 * Con `?imprimir=1` en la URL se dispara solo: así el enlace «Ver CV»
 * del sitio lleva directamente al diálogo y no obliga a un segundo clic.
 * Se lee de `location` y no con `useSearchParams` para no forzar a que
 * toda la página se renderice bajo demanda por un parámetro que sólo
 * afecta a este botón.
 */
export default function BotonImprimir({ etiqueta }: { etiqueta: string }) {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("imprimir")) return;
    // Un fotograma de margen: sin él, Chrome abre el diálogo antes de
    // aplicar la hoja de impresión y la vista previa sale con el diseño
    // de pantalla.
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-accent px-5 py-2.5 text-[0.8125rem] font-medium text-accent-contra transition hover:opacity-85"
    >
      {etiqueta}
    </button>
  );
}
