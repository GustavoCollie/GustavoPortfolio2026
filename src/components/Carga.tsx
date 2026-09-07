"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { idiomaDeRuta } from "@/data/idioma";
import type { Cromo } from "./cromo";
import { EASE_CINEMA, useMediaQuery } from "./kinetics";

/**
 * ─────────────────────────────────────────────────────────────
 *  PANTALLA DE CARGA
 *
 *  Telón de apertura: la marca, un contador de tres cifras y una
 *  barra de progreso. Cuando termina, el telón sube y deja al hero
 *  empezar su propia entrada.
 *
 *  El contador NO espera a React. Un script del <head>
 *  (`ARRANQUE_CARGA`, en layout.tsx) lo empuja hasta 89 en cuanto el
 *  primer trozo de HTML llega al navegador; si esperara a la
 *  hidratación, la cifra se quedaría clavada en 000 justo durante los
 *  milisegundos en los que de verdad se está cargando algo, que es lo
 *  único que la pantalla tiene que contar. Al montar, este componente
 *  marca `data-hidratado` y toma el relevo hasta 100.
 *
 *  Sólo aparece si la visita ENTRA por el home. En una navegación
 *  interna volver a bajar el telón sería un peaje, no una entrada.
 * ─────────────────────────────────────────────────────────────
 */

/** ¿Ya se levantó el telón? Fuera del proveedor, siempre sí. */
const CargaCtx = createContext(true);

export function useCarga() {
  return useContext(CargaCtx);
}

type Fase = "cargando" | "saliendo" | "fuera";

/** Tope mientras faltan recursos: el 100 tiene que significar algo. */
const TOPE_PARCIAL = 92;
/** Duración mínima en pantalla. Por debajo se lee como un parpadeo. */
const DURACION = 1900;
/** Si algún recurso no resuelve, no se secuestra la página. */
const PACIENCIA = 6000;

export default function ProveedorCarga({
  children,
  cromo,
}: {
  children: ReactNode;
  cromo: Cromo;
}) {
  const pathname = usePathname();

  // Se decide en el primer render (y en el servidor, donde `pathname` ya
  // es correcto): así el HTML inicial lleva el telón puesto y no hay ni
  // un fotograma de contenido antes de que baje.
  const idioma = idiomaDeRuta(pathname);
  const { carga: t, ...perfil } = cromo[idioma];

  // El telón sólo baja en las dos portadas.
  const [activa] = useState(() => pathname === "/" || pathname === "/en");
  const [fase, setFase] = useState<Fase>("cargando");
  const [listo, setListo] = useState(() => pathname !== "/");

  // En el servidor devuelve `false`, así que el telón sí viaja en el HTML
  // (y el CSS lo oculta al instante). Al hidratar pasa a `true` y el hero
  // recibe el permiso de animar sin que nadie haya llamado a setState.
  const quieto = useMediaQuery("(prefers-reduced-motion: reduce)");

  const raiz = useRef<HTMLDivElement>(null);
  const contador = useRef<HTMLSpanElement>(null);
  const barra = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  /* ── Contador ──────────────────────────────────────────── */
  useEffect(() => {
    if (!activa || quieto) return;
    const el = raiz.current;
    if (!el) return;

    // A partir de aquí manda React: el script del <head> se aparta.
    el.dataset.hidratado = "true";

    const escribir = (p: number) => {
      const v = Math.round(p);
      if (contador.current) {
        contador.current.textContent = String(v).padStart(3, "0");
      }
      if (barra.current) {
        barra.current.style.transform = `scaleX(${v / 100})`;
      }
      el.setAttribute("aria-valuenow", String(v));
    };

    let salida: number | undefined;

    const terminar = () => {
      escribir(100);
      // Un respiro en el 100: sin él la cifra final no se llega a leer.
      salida = window.setTimeout(() => {
        setFase("saliendo");
        setListo(true);
      }, 320);
    };

    // Arriba del todo: si el navegador restauró la posición anterior,
    // el telón subiría para descubrir la mitad de la página.
    window.scrollTo(0, 0);

    let recursos = false;
    const marcar = () => {
      recursos = true;
    };

    Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise<void>((resolver) => {
        if (document.readyState === "complete") resolver();
        else window.addEventListener("load", () => resolver(), { once: true });
      }),
    ]).then(marcar);

    const impaciencia = window.setTimeout(marcar, PACIENCIA);

    const inicio = performance.now();
    let cuadro = 0;

    const tick = (ahora: number) => {
      const t = Math.min((ahora - inicio) / DURACION, 1);
      const suave = 1 - Math.pow(1 - t, 2); // easeOutQuad
      const p = Math.min(suave * 100, recursos ? 100 : TOPE_PARCIAL);
      escribir(p);

      if (p >= 100) {
        terminar();
        return;
      }
      cuadro = requestAnimationFrame(tick);
    };
    cuadro = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(cuadro);
      window.clearTimeout(impaciencia);
      window.clearTimeout(salida);
    };
  }, [activa, quieto]);

  /* ── Bloqueo del scroll mientras el telón está bajado ───── */
  useEffect(() => {
    if (!activa || quieto || !lenis) return;
    if (fase === "fuera") {
      lenis.start();
      return;
    }
    lenis.stop();
    lenis.scrollTo(0, { immediate: true });
  }, [activa, quieto, fase, lenis]);

  const palabras = perfil.nombreCorto.split(" ");

  return (
    <CargaCtx.Provider value={listo || quieto}>
      {activa && !quieto && fase !== "fuera" && (
        <motion.div
          ref={raiz}
          className="carga fixed inset-0 z-[95] flex flex-col justify-between bg-ink-950 px-6 py-8 md:px-12 md:py-10"
          data-fase={fase}
          role="progressbar"
          aria-label="Cargando la experiencia"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          // El script del <head> ya ha movido `aria-valuenow`, el contador y
          // la barra para cuando React llega a hidratar: encuentra 017 donde
          // el servidor escribió 000 y aborta la hidratación del árbol.
          // Estos tres nodos son, por diseño, propiedad de código externo
          // hasta que se marca `data-hidratado`.
          suppressHydrationWarning
          initial={false}
          animate={{ y: fase === "saliendo" ? "-100%" : "0%" }}
          transition={{ duration: 1.05, ease: EASE_CINEMA }}
          onAnimationComplete={() => {
            // También se dispara al fijar la posición inicial; de ahí la guarda.
            if (fase === "saliendo") setFase("fuera");
          }}
        >
          <motion.div
            className="flex h-full flex-col justify-between"
            animate={{
              opacity: fase === "cargando" ? 1 : 0,
              filter: fase === "cargando" ? "blur(0px)" : "blur(6px)",
            }}
            transition={{ duration: 0.45, ease: EASE_CINEMA }}
          >
            <div className="flex items-baseline justify-between gap-6">
              <span className="label-mono">{perfil.rol}</span>
              <span className="label-mono">{perfil.ubicacion}</span>
            </div>

            {/* Marca: una línea por palabra, subiendo desde la máscara */}
            <div className="display text-[clamp(3rem,13vw,11rem)] leading-[0.86]">
              {palabras.map((palabra, i) => (
                <span key={palabra} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block text-ink-100 will-change-transform"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      delay: 0.12 + i * 0.11,
                      duration: 1.2,
                      ease: EASE_CINEMA,
                    }}
                  >
                    {palabra}
                  </motion.span>
                </span>
              ))}
            </div>

            <div>
              <div className="mb-4 flex items-baseline justify-between gap-6">
                <span className="label-mono">{t.cargando}</span>
                {/* `tabular-nums` fija el ancho: sin ello las tres cifras
                    bailan de izquierda a derecha en cada incremento. */}
                <span
                  ref={contador}
                  suppressHydrationWarning
                  className="carga__contador font-mono text-[clamp(2rem,6vw,3.5rem)] leading-none tabular-nums text-ink-100"
                >
                  000
                </span>
              </div>
              <span className="block h-px w-full overflow-hidden bg-line-2">
                <span
                  ref={barra}
                  suppressHydrationWarning
                  className="carga__barra block h-full w-full origin-left bg-accent"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
      {children}
    </CargaCtx.Provider>
  );
}
