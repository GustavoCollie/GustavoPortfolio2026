"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Scroll suave con inercia (Lenis). Es la base de la sensación
 * "cinematográfica": el scroll deja de ser discreto y pasa a ser
 * un travelling de cámara continuo.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        duration: 1.25,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
