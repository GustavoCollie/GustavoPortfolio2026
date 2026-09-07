"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * ─────────────────────────────────────────────────────────────
 *  DESPLAZAMIENTO POR BORDE
 *
 *  Con el puntero cerca del borde inferior la página baja sola, y
 *  cerca del superior sube. La velocidad crece desde cero en el límite
 *  de la zona hasta el máximo en el borde exacto, así que no hay salto
 *  al entrar: se acelera.
 *
 *  Tres cosas que parecen detalles y son las que hacen que no moleste:
 *
 *  · Sobre un enlace o un botón NO se desplaza. Sin esto, apuntar al
 *    pie de página —que está justo en la zona inferior— arrastraría el
 *    objetivo antes de poder pulsarlo.
 *  · Tras usar la rueda se queda quieto medio segundo, para no pelearse
 *    con el desplazamiento que la persona acaba de pedir.
 *  · Si el puntero sale de la ventana se detiene.
 *
 *  Sólo con puntero fino: en táctil no hay «posición del cursor» y en
 *  `prefers-reduced-motion` una página que se mueve sola es justo lo
 *  que se está pidiendo evitar.
 * ─────────────────────────────────────────────────────────────
 */

/** Fracción de la altura, arriba y abajo, que activa el desplazamiento. */
const ZONA = 0.13;
/**
 * Píxeles por SEGUNDO en el borde exacto.
 *
 * Por segundo y no por fotograma: en un monitor de 144 Hz un valor por
 * fotograma desplaza al doble de velocidad que en uno de 60 Hz, y el
 * ajuste deja de significar nada.
 */
const VELOCIDAD = 420;
/** Tregua tras usar la rueda. */
const TREGUA = 600;

export default function DesplazamientoBorde() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let y = -1; // -1 = el puntero no está en la ventana
    let sobreInteractivo = false;
    let ultimaRueda = 0;
    let cuadro = 0;
    let anterior = performance.now();

    const mover = (e: PointerEvent) => {
      y = e.clientY;
    };

    const sobre = (e: PointerEvent) => {
      const destino = e.target as Element | null;
      sobreInteractivo = Boolean(
        destino?.closest?.(
          "a, button, input, textarea, select, label, [role='button']",
        ),
      );
    };

    const salir = () => {
      y = -1;
    };

    const rueda = () => {
      ultimaRueda = performance.now();
    };

    const tick = () => {
      cuadro = requestAnimationFrame(tick);

      // El reloj se actualiza SIEMPRE, antes de cualquier salida
      // anticipada: si sólo avanzara cuando hay desplazamiento, al volver
      // a la zona el primer fotograma acumularía todo el tiempo parado.
      // Aun así se acota, por si la pestaña estuvo en segundo plano.
      const ahora = performance.now();
      const dt = Math.min((ahora - anterior) / 1000, 0.05);
      anterior = ahora;

      if (y < 0 || sobreInteractivo) return;
      if (ahora - ultimaRueda < TREGUA) return;

      const alto = window.innerHeight;
      const zona = alto * ZONA;
      let factor = 0;
      if (y > alto - zona) factor = (y - (alto - zona)) / zona;
      else if (y < zona) factor = -(zona - y) / zona;
      if (factor === 0) return;

      const v = factor * VELOCIDAD * dt;

      // `immediate` porque la posición se recalcula en cada fotograma: si
      // se animara, cada objetivo cancelaría al anterior y el movimiento
      // saldría a tirones. Con Lenis detenido (el telón de carga) esta
      // llamada no hace nada, que es justo lo que interesa.
      lenis.scrollTo(lenis.actualScroll + v, { immediate: true });
    };
    cuadro = requestAnimationFrame(tick);

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerover", sobre, { passive: true });
    window.addEventListener("wheel", rueda, { passive: true });
    document.addEventListener("pointerleave", salir);

    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerover", sobre);
      window.removeEventListener("wheel", rueda);
      document.removeEventListener("pointerleave", salir);
    };
  }, [lenis]);

  return null;
}
