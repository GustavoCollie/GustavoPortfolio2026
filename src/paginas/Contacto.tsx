import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { Reveal } from "@/components/kinetics";
import { ruta, type Idioma } from "@/data/idioma";
import { leerContenido } from "@/db/consultas";

export default async function Contacto({ idioma }: { idioma: Idioma }) {
  const { perfil, textos: t } = await leerContenido(idioma);

  const canales = [
    {
      label: t.contacto.etiquetas.correo,
      valor: perfil.email,
      href: `mailto:${perfil.email}`,
      nota: t.contacto.notas.correo,
    },
    {
      label: t.contacto.etiquetas.telefono,
      valor: perfil.telefono,
      href: `https://wa.me/${perfil.telefonoRaw.replace(/\D/g, "")}`,
      nota: t.contacto.notas.telefono,
    },
    {
      label: t.contacto.etiquetas.linkedin,
      valor: perfil.linkedinLabel,
      href: perfil.linkedin,
      nota: t.contacto.notas.linkedin,
    },
    {
      label: t.contacto.etiquetas.cv,
      valor: t.contacto.cvValor,
      href: `${ruta("cv", idioma)}?imprimir=1`,
      nota: t.contacto.notas.cv,
    },
  ];

  return (
    <>
      <PageHero
        index="03"
        seccion={t.contacto.seccion}
        titulo={t.contacto.titulo}
        entrada={t.contacto.entrada}
        meta={[
          { etiqueta: t.contacto.ubicacion, valor: perfil.ubicacion },
          { etiqueta: t.contacto.zona, valor: t.contacto.zonaValor },
          { etiqueta: t.contacto.modalidad, valor: t.contacto.modalidadValor },
          { etiqueta: t.contacto.estado, valor: perfil.disponibilidad },
        ]}
      />

      <section className="shell grid gap-14 border-t border-line pt-16 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <ContactForm />

        <div className="space-y-14">
          <div>
            <h2 className="label-mono mb-6">{t.contacto.canales}</h2>
            <ul>
              {canales.map((c, i) => (
                <Reveal as="li" key={c.label} delay={i * 0.07} y={16}>
                  {/* Al pasar por encima, el canal entero se invierte: un
                      relleno de tinta sube desde abajo y el texto pasa a
                      color papel. Es el mismo gesto que hacen la <Escena>
                      con la página, la banda de correo del home y las filas
                      de la trayectoria — el sitio tiene un solo recurso de
                      énfasis y lo repite a distintas escalas.

                      `isolate` mantiene el `-z-10` del relleno DENTRO del
                      enlace; sin él se iría detrás de la sección y no se
                      vería nunca. */}
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    data-cursor={c.label}
                    className="group relative isolate flex items-center justify-between gap-6 overflow-hidden border-t border-line px-4 py-5"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
                    />
                    <div>
                      <p className="label-mono mb-2 transition-colors duration-500 group-hover:text-ink-950/70">
                        {c.label}
                      </p>
                      <p className="text-[1rem] text-ink-100 transition-colors duration-500 group-hover:text-ink-950">
                        {c.valor}
                      </p>
                      <p className="mt-1 text-[0.75rem] text-ink-500 transition-colors duration-500 group-hover:text-ink-950/60">
                        {c.nota}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="shrink-0 text-lg text-ink-400 transition-[transform,color] duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ink-950"
                    >
                      ↗
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal>
            <div className="border border-line-2 p-7">
              <h2 className="label-mono mb-5">{t.contacto.trabajemos}</h2>
              <ul className="space-y-4">
                {t.contacto.lista.map((linea) => (
                  <li
                    key={linea}
                    className="flex gap-3 text-[0.875rem] leading-relaxed text-ink-300"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-px w-3 shrink-0 bg-ink-500"
                    />
                    {linea}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
