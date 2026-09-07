"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { entrarEscena, salirEscena } from "@/lib/tema";

/**
 * Escena de color invertido.
 *
 * Mientras el bloque ocupa la franja central del encuadre, la página
 * entera pinta el tema contrario al elegido: el sitio pasa de oscuro a
 * claro (o al revés) y vuelve al salir. No es un fondo distinto puesto
 * en esta sección — es todo: fondo, texto, bordes, tarjetas, la barra
 * de progreso y el propio menú.
 *
 * Se apoya en la escala semántica `ink` del sistema de diseño, así que
 * no hay una segunda paleta que mantener: la clara ya existía para el
 * conmutador de tema y aquí se reutiliza tal cual.
 *
 * La franja se define con `rootMargin` negativo arriba y abajo: la
 * inversión se dispara cuando el bloque llega al centro de la pantalla,
 * no cuando asoma por el borde. Si saltara al asomar, bastaría rozar el
 * final de la sección anterior para que la página parpadeara.
 */
export default function Escena({
  children,
  margen = "-42%",
  className,
}: {
  children: ReactNode;
  /** Cuánto se recorta el encuadre por arriba y por abajo. */
  margen?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Quien pide menos movimiento no quiere que la página cambie de
    // color sola mientras lee.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let dentro = false;

    const io = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting === dentro) return;
        dentro = entrada.isIntersecting;
        if (dentro) entrarEscena();
        else salirEscena();
      },
      { rootMargin: `${margen} 0px ${margen} 0px` },
    );

    io.observe(el);

    return () => {
      io.disconnect();
      // Al desmontar (cambio de ruta) la escena deja de existir, pero el
      // contador seguiría creyendo que está en pantalla.
      if (dentro) salirEscena();
    };
  }, [margen]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
