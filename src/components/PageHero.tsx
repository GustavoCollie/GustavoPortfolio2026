import type { ReactNode } from "react";
import { CurtainText, Reveal } from "./kinetics";

/**
 * Cabecera de página interior.
 *
 * Misma estructura en las tres: filete con número y sección arriba,
 * titular a tamaño display, y una fila de metadatos abajo. Que las
 * páginas interiores se abran todas igual es deliberado — el carácter
 * lo pone el home; aquí manda la legibilidad.
 */
export default function PageHero({
  index,
  seccion,
  titulo,
  entrada,
  meta,
}: {
  index: string;
  seccion: string;
  titulo: ReactNode;
  entrada?: string;
  meta?: { etiqueta: string; valor: string }[];
}) {
  return (
    <header className="shell pt-36 pb-16 md:pt-44 md:pb-24">
      <Reveal
        y={12}
        duration={0.8}
        className="flex items-baseline gap-6 border-t border-line-2 pt-4"
      >
        <span className="label-mono text-ink-100">{index}</span>
        <span className="label-mono">{seccion}</span>
      </Reveal>

      <h1 className="display mt-12 text-[clamp(2.75rem,10vw,8rem)] md:mt-16">
        <CurtainText>{titulo}</CurtainText>
      </h1>

      {entrada && (
        <Reveal delay={0.12}>
          <p className="mt-8 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-300">
            {entrada}
          </p>
        </Reveal>
      )}

      {meta && meta.length > 0 && (
        <Reveal delay={0.18}>
          <dl className="mt-14 grid gap-x-10 gap-y-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {meta.map((m) => (
              <div key={m.etiqueta}>
                <dt className="label-mono mb-2">{m.etiqueta}</dt>
                <dd className="text-[0.9375rem] text-ink-100">{m.valor}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}
    </header>
  );
}
