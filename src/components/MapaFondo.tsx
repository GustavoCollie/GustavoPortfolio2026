import { TRAZADO_MUNDO } from "@/lib/mapa";

/**
 * ─────────────────────────────────────────────────────────────
 *  MAPA DE FONDO
 *
 *  El planisferio detrás de todo el sitio, en proyección
 *  equirectangular. Sustituye al globo de vidrio: decía lo mismo
 *  —comercio internacional— por 170 KB de three.js y una GPU
 *  renderizando vidrio con transmisión en cada fotograma del scroll.
 *  Esto son unos pocos kilobytes de trazado y cero JavaScript.
 *
 *  Es un COMPONENTE DE SERVIDOR a propósito: los contornos son datos
 *  fijos, así que el SVG se arma una vez y viaja ya dibujado en el
 *  HTML. No hay hidratación, ni fotograma en blanco, ni chunk aparte.
 *
 *  Y lo importante para el recorrido: el relleno es `var(--ink-100)`,
 *  o sea el color del TEXTO. Cuando la <Escena> invierte el tema, el
 *  mapa se invierte con él sin una sola línea de lógica — pasa de
 *  tinta sobre papel a luz sobre negro, y siempre queda visible. Un
 *  color fijo habría desaparecido en la mitad del recorrido.
 * ─────────────────────────────────────────────────────────────
 */

export default function MapaFondo() {
  return (
    <div
      aria-hidden
      className="mapa-fondo pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <svg
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid slice"
        // `h-[130%] w-[130%]` con centrado: el planisferio es mucho más
        // ancho que alto, y a tamaño exacto quedaban dos franjas vacías
        // arriba y abajo en pantallas verticales.
        className="absolute top-1/2 left-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
      >
        {/* Retícula de meridianos y paralelos, aún más tenue que la
            tierra: da escala de mapa sin competir con el texto. */}
        <g stroke="var(--ink-100)" strokeWidth="0.15" opacity="0.05">
          {[-120, -60, 0, 60, 120].map((lon) => (
            <line key={lon} x1={lon + 180} y1="0" x2={lon + 180} y2="180" />
          ))}
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line key={lat} x1="0" y1={90 - lat} x2="360" y2={90 - lat} />
          ))}
        </g>

        {/* 0.10 de opacidad: suficiente para reconocer los continentes,
            insuficiente para pelearse con un párrafo encima. */}
        <path d={TRAZADO_MUNDO} fill="var(--ink-100)" opacity="0.1" />
      </svg>
    </div>
  );
}
