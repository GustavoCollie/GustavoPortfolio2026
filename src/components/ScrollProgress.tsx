"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barra de progreso: el "timeline" de la película, arriba de todo. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      // Un filete de tinta, no un degradado de cuatro colores: es un
      // indicador de posición, no un elemento decorativo.
      className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-ink-100"
    />
  );
}
