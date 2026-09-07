"use client";

import { fijarBase, opuesto, temaBase } from "@/lib/tema";

/**
 * Conmutador de tema.
 *
 * No guarda estado en React a propósito: el tema vive en los atributos del
 * <html>, que el script de `layout.tsx` ya fijó antes del primer pintado.
 * Los dos iconos están siempre montados y es CSS quien decide cuál se ve
 * (ver globals.css). Así no hay desajuste de hidratación ni un fotograma
 * con el icono equivocado.
 *
 * Lee y escribe la PREFERENCIA (`data-tema-base`), no lo que se está
 * pintando (`data-theme`). Dentro de una <Escena> invertida los dos valores
 * difieren, y partir del pintado guardaría la preferencia al revés.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const cambiar = () => fijarBase(opuesto(temaBase()));

  return (
    <button
      type="button"
      onClick={cambiar}
      title="Cambiar entre tema claro y oscuro"
      aria-label="Cambiar entre tema claro y oscuro"
      // Sin borde ni fondo: vive dentro de una barra en `mix-blend-difference`,
      // donde cualquier relleno propio se invertiría contra el contenido.
      className={`relative grid h-6 w-6 shrink-0 place-items-center opacity-65 transition-opacity hover:opacity-100 ${
        className ?? ""
      }`}
    >
      {/* Luna — visible en tema oscuro */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className="tema-icono tema-luna absolute h-[18px] w-[18px]"
      >
        <path
          d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>

      {/* Sol — visible en tema claro */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className="tema-icono tema-sol absolute h-[18px] w-[18px]"
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
