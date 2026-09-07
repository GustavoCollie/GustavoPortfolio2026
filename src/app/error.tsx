"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Frontera de error de la aplicación. Sin esto, un fallo en cualquier
 * sección deja al visitante frente a la pantalla en blanco de React.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en la aplicación:", error);
  }, [error]);

  return (
    <section className="shell flex min-h-[80vh] flex-col justify-center py-32">
      <p className="label-mono mb-6 text-ink-100">Algo se rompió</p>
      <h1 className="display text-[clamp(2.5rem,7vw,5rem)] text-ink-100">
        Se cortó la proyección
      </h1>
      <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink-300">
        Hubo un fallo cargando esta sección. Puedes reintentar; si vuelve a
        ocurrir, escríbeme y lo reviso.
      </p>
      {error.digest && (
        <p className="label-mono mt-4 text-[0.625rem]">
          Referencia: {error.digest}
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink-100 px-7 py-3.5 text-[0.875rem] font-medium text-ink-950 transition hover:bg-accent hover:text-accent-contra"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-line-2 px-7 py-3.5 text-[0.875rem] text-ink-200 transition hover:border-line-3 hover:bg-surface-2"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
