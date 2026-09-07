"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Proyecto } from "@/data/content";
import { PROPORCIONES } from "@/lib/capturas";

/**
 * ─────────────────────────────────────────────────────────────
 *  MAQUETA DEL PROYECTO
 *
 *  Dos modos, y el que manda es el primero que tenga material:
 *
 *  1. CAPTURAS REALES. Si hay imágenes subidas para el proyecto, se
 *     componen en el marco: la de escritorio abajo, ocupando casi todo,
 *     y la de móvil encima por un costado. Es la composición estándar de
 *     un caso de producto y dice de un vistazo que la cosa existe en dos
 *     plataformas.
 *
 *  2. SILUETA ABSTRACTA. Sin capturas, se dibuja una interfaz de mentira
 *     con filetes y bloques. No es un adorno: un hueco vacío donde
 *     debería ir la prueba del trabajo se lee como que no hay trabajo.
 *
 *  Sobre los TAMAÑOS: las capturas llegan con proporciones cualesquiera
 *  —una pantalla completa, un recorte, un móvil alto—, así que cada
 *  hueco tiene su propia relación de aspecto fija y la imagen se recorta
 *  con `object-cover` anclada arriba. Anclar arriba y no al centro es
 *  deliberado: en una captura de web lo que identifica la pantalla está
 *  en la cabecera, y centrar la recortaría justo por ahí.
 *
 *  Las maquetas son deliberadamente OSCURAS en los dos temas. Una
 *  captura se lee como captura porque tiene su propio fondo; sobre el
 *  papel claro del sitio, un marco claro se confundiría con la página.
 * ─────────────────────────────────────────────────────────────
 */

const EASE = [0.16, 1, 0.3, 1] as const;

export type CapturasProyecto = { web?: string; movil?: string };

export default function ProjectVisual({
  proyecto,
  capturas,
  className,
}: {
  proyecto: Proyecto;
  capturas?: CapturasProyecto;
  className?: string;
}) {
  const movil = proyecto.plataformas.some((p) => ["Android", "iOS"].includes(p));
  const hayCapturas = Boolean(capturas?.web || capturas?.movil);

  return (
    <motion.div
      className={`relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0a] ${className ?? ""}`}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.25, ease: EASE }}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        {/* Retícula de encuadre */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.035) 1px, transparent 1px)",
            backgroundSize: "calc(100% / 8) 100%",
          }}
        />

        {hayCapturas ? (
          <Composicion capturas={capturas!} nombre={proyecto.nombre} />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-8 md:p-12">
            {movil ? <Telefono /> : <Navegador />}
          </div>
        )}
      </motion.div>

      {/* Fuera del bloque que escala: un filete que crece un 12% deja de
          ser un filete. */}
      <div className="absolute inset-0 ring-1 ring-white/10 ring-inset" />
    </motion.div>
  );
}

/* ── Composición con capturas reales ───────────────────────── */

function Composicion({
  capturas,
  nombre,
}: {
  capturas: CapturasProyecto;
  nombre: string;
}) {
  return (
    <div className="absolute inset-0">
      {/* ── Escritorio: la base ──────────────────────────────
          Anclada abajo a la derecha y sangrando por el borde: una
          captura centrada con aire alrededor parece una diapositiva;
          saliéndose del marco parece una pantalla de verdad que sigue
          más allá. */}
      {capturas.web && (
        <div className="absolute right-[3%] bottom-0 w-[80%] overflow-hidden rounded-t-md border border-white/12 border-b-0 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
          {/* Barra de navegador: la señal más rápida de «esto es web». */}
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#12120f] px-3 py-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/25" />
            ))}
            <div className="ml-3 h-1.5 flex-1 rounded-full bg-white/[0.07]" />
          </div>
          <div
            style={{ aspectRatio: PROPORCIONES.web }}
            className="relative w-full"
          >
            <Image
              src={capturas.web}
              alt={`${nombre} en escritorio`}
              fill
              sizes="(max-width: 768px) 80vw, 60vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      )}

      {/* ── Móvil: encima y a un costado ─────────────────────
          9/19.5 es la proporción de un teléfono actual. La captura se
          recorta a esa forma venga como venga. */}
      {capturas.movil && (
        <div className="absolute bottom-[6%] left-[5%] z-10 w-[17%] min-w-[68px] overflow-hidden rounded-[0.9rem] border border-white/15 bg-[#0f0f0e] p-[3px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9)]">
          <div
            style={{ aspectRatio: PROPORCIONES.movil }}
            className="relative w-full overflow-hidden rounded-[0.7rem]"
          >
            <Image
              src={capturas.movil}
              alt={`${nombre} en móvil`}
              fill
              sizes="(max-width: 768px) 20vw, 14vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Siluetas abstractas (respaldo sin capturas) ───────────── */

function Barras({ alturas }: { alturas: number[] }) {
  return (
    <div className="flex h-full items-end gap-[3px]">
      {alturas.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 + i * 0.05, duration: 0.8, ease: EASE }}
          className="flex-1 bg-white/25"
        />
      ))}
    </div>
  );
}

function Telefono() {
  return (
    <div className="flex items-end gap-6">
      <div className="hidden h-[62%] w-[24%] translate-y-6 border border-white/10 bg-white/[0.02] p-2 sm:block">
        <div className="mb-2 h-1 w-7 bg-white/20" />
        <div className="space-y-1.5">
          {[70, 45, 60, 35].map((w, i) => (
            <div key={i} className="h-1 bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      <div className="relative h-[280px] w-[142px] border border-white/15 bg-[#0f0f0e] p-3 sm:h-[320px] sm:w-[162px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-1.5 w-12 bg-white/30" />
          <div className="h-4 w-4 rounded-full border border-white/20" />
        </div>

        <div className="mb-4 border border-white/12 p-3">
          <div className="mb-2 h-1 w-9 bg-white/40" />
          <div className="mb-3 h-3 w-16 bg-white/70" />
          <div className="h-10">
            <Barras alturas={[35, 55, 40, 75, 60, 90, 70]} />
          </div>
        </div>

        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 border-t border-white/8 pt-2">
              <div className="h-4 w-4 shrink-0 bg-white/10" />
              <div className="flex-1 space-y-1">
                <div className="h-1 w-full bg-white/15" />
                <div className="h-1 w-2/3 bg-white/8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Navegador() {
  return (
    <div className="w-full max-w-xl border border-white/12 bg-[#0f0f0e]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/25" />
        ))}
        <div className="ml-3 h-2 flex-1 bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-4 p-4">
        <div className="hidden w-16 space-y-2 sm:block">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-1.5"
              style={{
                width: `${70 - i * 8}%`,
                background: i === 0 ? "rgb(255 255 255 / 0.6)" : "rgb(255 255 255 / 0.1)",
              }}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-white/10 p-2.5">
                <div
                  className="mb-1.5 h-1 w-5"
                  style={{
                    background: i === 0 ? "rgb(255 255 255 / 0.7)" : "rgb(255 255 255 / 0.25)",
                  }}
                />
                <div className="h-2.5 w-9 bg-white/25" />
              </div>
            ))}
          </div>

          <div className="border border-white/10 p-3">
            <div className="mb-3 h-1 w-14 bg-white/20" />
            <div className="h-24">
              <Barras alturas={[40, 62, 48, 78, 55, 88, 66, 95, 72, 84]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
