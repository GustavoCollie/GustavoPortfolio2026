"use client";

/**
 * Primitivas de movimiento reutilizables.
 * Todo lo cinematográfico del sitio se compone a partir de estas piezas.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

export const EASE_CINEMA = [0.16, 1, 0.3, 1] as const;

/**
 * Motion trata `opacity` (y `backgroundColor`) como propiedades aceleradas y
 * NO las escribe cuando vienen de un MotionValue ligado al scroll: el elemento
 * se queda con el valor inicial. Verificado en motion 12.43 y 13.1.
 *
 * Este hook devuelve una ref que aplica el valor directamente al nodo en cada
 * cambio, sin provocar re-render. Úsalo en lugar de `style={{ opacity }}`.
 */
export function useScrollOpacity<T extends HTMLElement = HTMLDivElement>(
  value: MotionValue<number>,
) {
  const ref = useRef<T>(null);

  useMotionValueEvent(value, "change", (v) => {
    if (ref.current) ref.current.style.opacity = String(v);
  });

  useEffect(() => {
    if (ref.current) ref.current.style.opacity = String(value.get());
  }, [value]);

  return ref;
}

/** Media query reactiva. Útil para apagar efectos que sólo tienen sentido
 *  con altura de pantalla suficiente (apilados, anclajes). */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // en el servidor asumimos "no coincide"
  );
}

/* ── Reveal: entrada suave al entrar en cuadro ─────────────── */

export function Reveal({
  children,
  delay = 0,
  y = 28,
  blur = 8,
  duration = 1,
  once = true,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "p" | "h2" | "h3";
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration, delay, ease: EASE_CINEMA }}
    >
      {children}
    </Comp>
  );
}

/* ── Máscara de cortina: el texto sube desde detrás de un borde ── */

/**
 * Quien observa el viewport es la MÁSCARA, no el texto.
 *
 * El texto arranca desplazado un 115% hacia abajo, es decir, fuera del
 * `overflow-hidden` que lo enmarca. IntersectionObserver calcula la
 * intersección sobre el rectángulo ya recortado por los ancestros, así
 * que un texto que empieza fuera de su propia máscara tiene área visible
 * cero: nunca «entra en cuadro» y por tanto nunca se anima. El texto se
 * queda escondido para siempre.
 *
 * Normalmente el fallo pasa desapercibido porque el scroll de la página
 * mueve la máscara y algún fotograma cuela el texto dentro. Dentro de un
 * contenedor `sticky` eso no ocurre nunca, y ahí el titular
 * sencillamente no aparece.
 *
 * Poniendo el disparador en la máscara —que siempre tiene área— y
 * animando el hijo con variantes, el orden queda garantizado.
 */
export function CurtainText({
  children,
  delay = 0,
  duration = 1.1,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.span
      className={`block overflow-hidden ${className ?? ""}`}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      <motion.span
        className="block will-change-transform"
        variants={{
          oculto: { y: "115%", rotate: 2 },
          visible: { y: "0%", rotate: 0 },
        }}
        transition={{ duration, delay, ease: EASE_CINEMA }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/* ── Texto que se ilumina palabra por palabra con el scroll ──── */

export function ScrollLitText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={`text-ink-100 ${className ?? ""}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <LitWord
            key={`${word}-${i}`}
            progress={scrollYProgress}
            range={[start, end]}
          >
            {word}
          </LitWord>
        );
      })}
    </p>
  );
}

function LitWord({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  // Se enciende por opacidad, no por color: así hereda el color del tema
  // y funciona igual en claro y en oscuro sin dos paletas codificadas.
  const opacity = useTransform(progress, range, [0.18, 1]);
  const ref = useScrollOpacity<HTMLSpanElement>(opacity);
  return (
    <span ref={ref} className="mr-[0.28em] inline-block opacity-[0.18]">
      {children}
    </span>
  );
}

/* ── Parallax vertical ligado al scroll ────────────────────── */

export function Parallax({
  children,
  distance = 90,
  className,
  style,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.6 });
  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/* ── Contador que se anima al entrar en cuadro ─────────────── */

export function Counter({
  to,
  duration = 1.9,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const mv = useMotionValue(0);
  const [shown, setShown] = useState(0);

  useMotionValueEvent(mv, "change", (v) => setShown(Math.round(v)));

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      // easeOutExpo — arranca rápido, aterriza suave
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      mv.set(eased * to);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, mv]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ── Botón / elemento magnético que sigue al cursor ────────── */

export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Cabecera de acto ──────────────────────────────────────── */

/**
 * Un filete de ancho completo con el número del acto a un lado y el
 * nombre al otro. Es el único separador del sitio: sustituye a los
 * fondos de sección y a los colores por sección del diseño anterior.
 */
export function ActoBarra({
  index,
  nombre,
  extra,
}: {
  index: string;
  nombre: string;
  extra?: string;
}) {
  return (
    <Reveal
      y={12}
      duration={0.8}
      className="flex items-baseline gap-6 border-t border-line-2 pt-4"
    >
      <span className="label-mono text-ink-100">{index}</span>
      <span className="label-mono">{nombre}</span>
      {extra && <span className="label-mono ml-auto hidden sm:block">{extra}</span>}
    </Reveal>
  );
}

/* ── Titular de sección ────────────────────────────────────── */

export function Titular({
  children,
  className,
  as = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const Comp = as;
  return (
    <Comp
      className={`display text-[clamp(2.5rem,7vw,6.5rem)] ${className ?? ""}`}
    >
      <CurtainText>{children}</CurtainText>
    </Comp>
  );
}

/* ── Variantes compartidas para listas escalonadas ─────────── */

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_CINEMA },
  },
};
