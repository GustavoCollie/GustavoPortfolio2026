import Link from "next/link";
import type { Proyecto } from "@/data/content";
import { ruta, type Idioma, type Textos } from "@/data/idioma";
import { leerContenido } from "@/db/consultas";
import PageHero from "@/components/PageHero";
import ProjectVisual from "@/components/ProjectVisual";
import { capturasDe } from "@/lib/capturas";
import { CurtainText, Reveal } from "@/components/kinetics";

/**
 * El archivo completo. A diferencia del home, aquí están los cuatro
 * proyectos y cada uno trae también su impacto y su proceso: quien llega
 * a esta página ya decidió que quiere el detalle.
 */
export default async function Proyectos({ idioma }: { idioma: Idioma }) {
  const { proyectos, textos: t, imagenes } = await leerContenido(idioma);

  return (
    <>
      <PageHero
        index="02"
        seccion={t.trabajo.seccion}
        titulo={t.trabajo.titulo}
        entrada={t.trabajo.entrada}
        meta={[
          {
            etiqueta: t.trabajo.total,
            valor: `${proyectos.length} ${t.comun.cuenta}`,
          },
          { etiqueta: t.trabajo.periodo, valor: "2022 — 2026" },
          { etiqueta: t.trabajo.roles, valor: t.trabajo.rolesValor },
          { etiqueta: t.trabajo.sectores, valor: t.trabajo.sectoresValor },
        ]}
      />

      {proyectos.map((p, i) => (
        <Caso
          key={p.slug}
          proyecto={p}
          index={i}
          idioma={idioma}
          t={t}
          capturas={capturasDe(imagenes, p.slug)}
        />
      ))}
    </>
  );
}

function Caso({
  proyecto,
  index,
  idioma,
  t,
  capturas,
}: {
  proyecto: Proyecto;
  index: number;
  idioma: Idioma;
  t: Textos;
  capturas: { web?: string; movil?: string };
}) {
  const esCollie = proyecto.slug === "collie-app";

  return (
    <article
      id={proyecto.slug}
      // `scroll-mt` compensa la barra fija: sin él, al llegar desde el
      // home con un ancla el titular queda debajo del menú.
      className="shell scroll-mt-28 border-t border-line py-16 md:py-24"
    >
      <div className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className="label-mono text-ink-100">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="label-mono">{proyecto.categoria}</span>
        <span className="label-mono ml-auto">{proyecto.anio}</span>
      </div>

      <ProjectVisual proyecto={proyecto} capturas={capturas} />

      <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] text-ink-100">
            <CurtainText>{proyecto.nombre}</CurtainText>
          </h2>
          <Reveal delay={0.08}>
            <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-300">
              {proyecto.tagline}
            </p>
            <dl className="mt-8 space-y-4">
              <div className="border-t border-line pt-3">
                <dt className="label-mono mb-1.5">{t.comun.rol}</dt>
                <dd className="text-[0.9375rem] text-ink-200">{proyecto.rol}</dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="label-mono mb-1.5">{t.comun.plataformas}</dt>
                <dd className="text-[0.9375rem] text-ink-200">
                  {proyecto.plataformas.join(" · ")}
                </dd>
              </div>
            </dl>

            {esCollie && (
              <Link
                href={ruta("caso", idioma)}
                data-cursor={t.comun.leerCaso}
                className="subrayado mt-8 inline-flex items-center gap-2 text-[0.9375rem] text-ink-100"
              >
                {t.comun.leerCaso} <span aria-hidden>↗</span>
              </Link>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.12} className="space-y-7">
          <div className="border-t border-line pt-4">
            <p className="label-mono mb-2">{t.comun.problema}</p>
            <p className="text-[0.9375rem] leading-relaxed text-ink-400">
              {proyecto.problema}
            </p>
          </div>
          <div className="border-t border-line pt-4">
            <p className="label-mono mb-2">{t.comun.solucion}</p>
            <p className="text-[0.9375rem] leading-relaxed text-ink-300">
              {proyecto.solucion}
            </p>
          </div>
          <div className="border-t border-line pt-4">
            <p className="label-mono mb-3">{t.comun.impacto}</p>
            <ul className="space-y-2">
              {proyecto.impacto.map((im) => (
                <li
                  key={im}
                  className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-300"
                >
                  <span
                    aria-hidden
                    className="mt-[0.55em] h-px w-3 shrink-0 bg-ink-500"
                  />
                  {im}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal
        delay={0.16}
        className="mt-12 grid gap-10 border-t border-line pt-6 md:grid-cols-[1fr_1.2fr]"
      >
        <div>
          <p className="label-mono mb-3">{t.comun.alcance}</p>
          <p className="text-[0.875rem] leading-relaxed text-ink-400">
            {proyecto.stack.join(" · ")}
          </p>
        </div>
        <div>
          <p className="label-mono mb-3">{t.comun.proceso}</p>
          <ol className="space-y-2">
            {proyecto.proceso.map((paso, i) => (
              <li
                key={paso}
                className="flex gap-4 text-[0.875rem] leading-relaxed text-ink-400"
              >
                <span className="label-mono shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {paso}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </article>
  );
}
