"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ─────────────────────────────────────────────────────────────
 *  CURSOR: AVIÓN
 *
 *  Sustituye al puntero del sistema por un avión que persigue al ratón
 *  con retardo y encara la dirección en la que te mueves.
 *
 *  Las dos inercias son el efecto entero:
 *  · la POSICIÓN se interpola hacia el ratón (el avión llega tarde),
 *  · el RUMBO se interpola hacia la dirección del movimiento (el avión
 *    vira, no salta).
 *  Si la posición fuera exacta, sería un icono pegado al ratón; si el
 *  rumbo fuera exacto, temblaría en cada micromovimiento.
 *
 *  Sobre elementos que declaran `data-cursor` aparece una pastilla con
 *  el texto ("Ver caso"), que es lo que sustituye al hover clásico.
 *
 *  No se monta con puntero grueso (táctil) ni con `prefers-reduced-motion`:
 *  ahí el cursor del sistema es el correcto y esconderlo sería un fallo
 *  de accesibilidad, no un efecto.
 * ─────────────────────────────────────────────────────────────
 */

/** Cuánto se acerca el avión a su objetivo en cada fotograma. */
const SEGUIMIENTO = 0.18;
/** Lo mismo para el rumbo. Más bajo = vira más despacio. */
const VIRAJE = 0.12;
/** Rumbo en reposo: subiendo a la derecha, como un avión en ascenso. */
const RUMBO_REPOSO = -35;
/** Por debajo de esto no se recalcula el rumbo: sería temblor, no viraje. */
const UMBRAL = 1.5;

type Estado = "libre" | "activo" | "etiqueta";

export default function CursorFluido() {
  const avion = useRef<HTMLDivElement>(null);
  const pastilla = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(false);
  const [estado, setEstado] = useState<Estado>("libre");
  const [etiqueta, setEtiqueta] = useState("");
  const [visible, setVisible] = useState(false);
  const pulsando = useRef(false);

  /* ── ¿Procede montarlo? ────────────────────────────────── */
  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)");
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluar = () => setActivo(fino.matches && !quieto.matches);
    evaluar();

    fino.addEventListener("change", evaluar);
    quieto.addEventListener("change", evaluar);
    return () => {
      fino.removeEventListener("change", evaluar);
      quieto.removeEventListener("change", evaluar);
    };
  }, []);

  /* ── Vuelo ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!activo) return;

    // Se esconde el cursor del sistema sólo mientras el nuestro existe:
    // si el componente se desmonta, la página no se queda sin puntero.
    document.documentElement.classList.add("cursor-fluido");

    let destinoX = window.innerWidth / 2;
    let destinoY = window.innerHeight / 2;
    let x = destinoX;
    let y = destinoY;
    let rumbo = RUMBO_REPOSO;
    let rumboDestino = RUMBO_REPOSO;
    let cuadro = 0;

    const mover = (e: PointerEvent) => {
      const dx = e.clientX - destinoX;
      const dy = e.clientY - destinoY;
      if (Math.hypot(dx, dy) > UMBRAL) {
        rumboDestino = (Math.atan2(dy, dx) * 180) / Math.PI;
      }
      destinoX = e.clientX;
      destinoY = e.clientY;
      setVisible(true);
    };

    const tick = () => {
      x += (destinoX - x) * SEGUIMIENTO;
      y += (destinoY - y) * SEGUIMIENTO;

      // Por el camino corto: sin esto, virar de 179° a -179° da una vuelta
      // completa en lugar de dos grados.
      const delta = ((rumboDestino - rumbo + 540) % 360) - 180;
      rumbo += delta * VIRAJE;

      if (avion.current) {
        avion.current.style.transform =
          `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) ` +
          `rotate(${rumbo}deg) scale(${pulsando.current ? 0.82 : 1})`;
      }
      // La pastilla no gira: un texto inclinado no se lee.
      if (pastilla.current) {
        pastilla.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      cuadro = requestAnimationFrame(tick);
    };
    cuadro = requestAnimationFrame(tick);

    /* Un solo listener en el documento en vez de uno por elemento:
       el contenido cambia con cada navegación y re-enganchar listeners
       en cada render sería a la vez frágil y caro. */
    const sobre = (e: PointerEvent) => {
      const destino = e.target as Element | null;
      const marcado = destino?.closest?.("[data-cursor]");
      if (marcado) {
        setEstado("etiqueta");
        setEtiqueta(marcado.getAttribute("data-cursor") ?? "");
        return;
      }
      setEtiqueta("");
      setEstado(
        destino?.closest?.("a, button, input, textarea, select, [role='button']")
          ? "activo"
          : "libre",
      );
    };

    const fuera = () => setVisible(false);
    const dentro = () => setVisible(true);
    const abajo = () => {
      pulsando.current = true;
    };
    const arriba = () => {
      pulsando.current = false;
    };

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerover", sobre, { passive: true });
    window.addEventListener("pointerdown", abajo);
    window.addEventListener("pointerup", arriba);
    document.addEventListener("pointerleave", fuera);
    document.addEventListener("pointerenter", dentro);

    return () => {
      cancelAnimationFrame(cuadro);
      document.documentElement.classList.remove("cursor-fluido");
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerover", sobre);
      window.removeEventListener("pointerdown", abajo);
      window.removeEventListener("pointerup", arriba);
      document.removeEventListener("pointerleave", fuera);
      document.removeEventListener("pointerenter", dentro);
    };
  }, [activo]);

  if (!activo) return null;

  const tamano = estado === "libre" ? 26 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={avion}
        className="absolute top-0 left-0 will-change-transform"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {/* Relleno de tinta con filete del color del papel, como el cursor
            de la referencia: así se recorta contra cualquier fondo, incluidas
            las maquetas oscuras de los proyectos. */}
        <svg
          width={tamano}
          height={tamano}
          viewBox="0 0 48 48"
          className="block transition-[width,height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <path
            d="M46 24 L30 28 L18 44 L12 44 L18 28 L8 29 L4 34 L1 34 L3 24 L1 14 L4 14 L8 19 L18 20 L12 4 L18 4 L30 20 Z"
            className="fill-ink-100 stroke-ink-950"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Pastilla de etiqueta. Va en su propia capa sin rotación y
          desplazada, para no quedar debajo del avión. */}
      <div
        ref={pastilla}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          opacity: visible && estado === "etiqueta" ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <span className="label-mono absolute top-4 left-5 block whitespace-nowrap bg-ink-100 px-3 py-2 text-ink-950">
          {etiqueta}
        </span>
      </div>
    </div>
  );
}
