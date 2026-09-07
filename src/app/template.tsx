"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Transición entre secciones: fundido con desenfoque y un ligero
 * empuje de cámara. Se ejecuta en cada cambio de ruta.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 1.015 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
