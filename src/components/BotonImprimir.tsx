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

  /* Tamaño y forma del botón primario del sitio —el de «Enviar mensaje»—
     y no uno más pequeño. Es la única acción por la que se entra a esta
     página: pedía el mismo peso que la acción principal de contacto, no
     el de un enlace secundario. La flecha baja en el hover, que es lo que
     hace un archivo al descargarse. */
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-cursor={etiqueta}
      className="group inline-flex shrink-0 items-center gap-3 bg-accent px-7 py-3.5 text-[0.875rem] font-medium text-accent-contra transition hover:opacity-85"
    >
      {etiqueta}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="transition-transform duration-500 group-hover:translate-y-0.5"
      >
        <path
          d="M7 1.5v8M3.5 6l3.5 3.5L10.5 6M2 12h10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
