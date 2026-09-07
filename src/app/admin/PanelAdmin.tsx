"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { borrarImagen, guardarCambios, subirImagen } from "./acciones";
import { ADMIN_INICIAL, type EstadoAdmin } from "./tipos";
import Recorte from "./Recorte";
import { proporcionDe } from "@/lib/capturas";
import {
  CLAVES,
  GRUPOS,
  PALETA_BASE,
  PRESETS,
  type PaletaGuardada,
  type Tema,
} from "@/lib/paleta";

type Metrica = { valor: number; sufijo: string; prefijo: string; titulo: string; detalle: string };
type Experiencia = {
  empresa: string;
  cargo: string;
  periodo: string;
  sector: string;
  modalidad?: string;
  resumen: string;
  logros: string[];
  stack: string[];
  desde: string;
  hasta: string;
};
type Proyecto = {
  slug: string;
  nombre: string;
  tagline: string;
  categoria: string;
  anio: string;
  rol: string;
  problema: string;
  solucion: string;
  destacado: boolean;
  plataformas: string[];
  impacto: string[];
  stack: string[];
  proceso: string[];
};

type Competencia = {
  grupo: string;
  icono: string;
  claim: string;
  detalle: string;
  items: string[];
};
type Fase = {
  n: string;
  nombre: string;
  claim: string;
  detalle: string;
  entregables: string[];
};
type Metodologia = {
  kicker: string;
  titulo: string;
  intro: string;
  fases: Fase[];
};
type Formacion = {
  titulo: string;
  institucion: string;
  anio: string;
  tipo: string;
};
type Lengua = { idioma: string; nivel: string; pct: number };

export type DatosPanel = {
  /** La paleta no depende del idioma: es el aspecto del sitio. */
  paleta: PaletaGuardada;
  perfil: Record<string, string>;
  manifiesto: Record<string, string>;
  metricas: Metrica[];
  experiencias: Experiencia[];
  proyectos: Proyecto[];
  competencias: Competencia[];
  metodologia: Metodologia;
  educacion: Formacion[];
  idiomas: Lengua[];
  /** Documentos profundos que se editan de una pieza. Ver la pestaña. */
  caso: Record<string, unknown>;
  textos: Record<string, unknown>;
};

const PESTANAS = [
  "Paleta",
  "Perfil",
  "Resultados",
  "Trayectoria",
  "Proyectos",
  "Competencias",
  "Metodología",
  "Formación",
  "Caso",
  "Textos",
  "Imágenes",
  "Mensajes",
] as const;
type Pestana = (typeof PESTANAS)[number];

/**
 * Panel de administración.
 *
 * Edita el contenido del sitio en Postgres. Cada guardado escribe en las
 * tablas del idioma activo y invalida la caché de las páginas, así que el
 * cambio se ve sin desplegar nada.
 *
 * El idioma se cambia navegando (`?idioma=en`), no con estado local: ver
 * la explicación en `page.tsx`.
 */
export default function PanelAdmin({
  inicial,
  idioma,
  imagenes,
  mensajes,
  escritura,
}: {
  inicial: DatosPanel;
  idioma: "es" | "en";
  imagenes: { clave: string; etiqueta: string; src: string; alt: string; pie: string; foco: string; subida: boolean }[];
  mensajes: Mensaje[];
  escritura: boolean;
}) {
  const [pestana, setPestana] = useState<Pestana>("Paleta");
  const [datos, setDatos] = useState<DatosPanel>(inicial);
  const [tema, setTema] = useState<Tema>("dark");
  const [estado, accion, guardando] = useActionState<EstadoAdmin, FormData>(
    guardarCambios,
    ADMIN_INICIAL,
  );

  // Lee el tema real del documento al montar y cuando se conmuta.
  useEffect(() => {
    const raiz = document.documentElement;
    const leer = () => setTema((raiz.dataset.theme as Tema) ?? "dark");
    leer();
    const obs = new MutationObserver(leer);
    obs.observe(raiz, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Vista previa en vivo: escribe las variables del tema activo en <html>.
  useEffect(() => {
    const raiz = document.documentElement;
    const valores = datos.paleta[tema] ?? {};
    for (const clave of CLAVES) {
      const v = valores[clave];
      if (v) raiz.style.setProperty(`--${clave}`, v);
      else raiz.style.removeProperty(`--${clave}`);
    }
  }, [datos.paleta, tema]);

  /* Se manda el estado COMPLETO, no las diferencias contra el contenido
     base. Enviar sólo el diff tenía sentido cuando el destino era un
     archivo JSON que no debía crecer hasta ser una segunda copia del
     sitio; con la base de datos el destino YA es la copia buena.

     Y era peligroso: una sección sin tocar viajaba como `{}`, que en
     JavaScript es verdadero, así que pasaba las guardas del servidor e
     intentaba escribir columnas nulas. En el perfil —que se guarda como
     JSONB— habría sobrescrito los datos con un objeto vacío.

     `idioma` viaja siempre: la acción escribe en las tablas de ese
     idioma y no debe depender de un valor por defecto. */
  const payload = useMemo(
    () => JSON.stringify({ ...datos, idioma }),
    [datos, idioma],
  );
  const hayCambios = JSON.stringify(datos) !== JSON.stringify(inicial);

  const cambiarColor = (clave: string, valor: string) =>
    setDatos((d) => ({
      ...d,
      paleta: { ...d.paleta, [tema]: { ...(d.paleta[tema] ?? {}), [clave]: valor } },
    }));

  const aplicarPreset = (p: (typeof PRESETS)[number]) =>
    setDatos((d) => ({
      ...d,
      paleta: {
        dark: { ...(d.paleta.dark ?? {}), ...p.dark },
        light: { ...(d.paleta.light ?? {}), ...p.light },
      },
    }));

  const restablecerPaleta = () => setDatos((d) => ({ ...d, paleta: {} }));

  const descargar = () => {
    const blob = new Blob([JSON.stringify(datos, null, 2) + "\n"], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `contenido-${idioma}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="shell py-28 md:py-32">
      {/* Cabecera */}
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="label-mono mb-3 text-ink-100">Panel</p>
          <h1 className="display text-[clamp(2rem,4vw,3rem)] text-ink-100">
            Administrar el sitio
          </h1>
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-400">
            Los cambios se guardan en la base de datos y el sitio los refleja
            al instante, sin desplegar nada.
          </p>
        </div>

        <form action={accion} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="payload" value={payload} />

          {/* Cambiar de idioma recarga la página. Si hay cambios sin
              guardar se avisa: perderlos por un clic sería el peor
              momento posible para descubrir cómo funciona. */}
          <div className="mr-2 flex items-center gap-1 rounded-full border border-line-2 p-1">
            {(["es", "en"] as const).map((l) => (
              <a
                key={l}
                href={`/admin?idioma=${l}`}
                onClick={(e) => {
                  if (
                    hayCambios &&
                    l !== idioma &&
                    !confirm(
                      "Hay cambios sin guardar en este idioma. ¿Cambiar de todas formas?",
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`rounded-full px-3 py-1.5 text-[0.75rem] transition ${
                  l === idioma
                    ? "bg-accent text-accent-contra"
                    : "text-ink-400 hover:text-ink-100"
                }`}
              >
                {l === "es" ? "Español" : "English"}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={descargar}
            className="rounded-full border border-line-2 px-5 py-2.5 text-[0.8125rem] text-ink-200 transition hover:border-line-3 hover:bg-surface-2"
          >
            Descargar JSON
          </button>
          <button
            type="submit"
            disabled={guardando || !hayCambios}
            className="rounded-full bg-ink-100 px-6 py-2.5 text-[0.8125rem] font-medium text-ink-950 transition hover:bg-accent hover:text-accent-contra disabled:pointer-events-none disabled:opacity-50"
          >
            {guardando ? "Guardando…" : hayCambios ? "Guardar cambios" : "Sin cambios"}
          </button>
        </form>
      </header>

      {!escritura && (
        <p className="mb-8 rounded-xl border border-line-3 bg-surface-2 p-4 text-[0.875rem] text-ink-200">
          Estás en producción: el disco es de sólo lectura. Puedes previsualizar
          y descargar el JSON, pero para publicar hay que reemplazar el archivo
          en el repositorio y volver a desplegar.
        </p>
      )}

      {estado.mensaje && (
        <p
          className={`mb-8 rounded-xl border p-4 text-[0.875rem] ${
            estado.estado === "ok"
              ? "border-line-3 bg-surface-2 text-ink-200"
              : "border-ink-100 bg-surface-2 text-ink-200"
          }`}
        >
          {estado.mensaje}
        </p>
      )}

      {/* Pestañas */}
      <nav className="mb-10 flex flex-wrap gap-2">
        {PESTANAS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPestana(p)}
            aria-pressed={pestana === p}
            className={`rounded-full px-4 py-2 text-[0.8125rem] transition ${
              pestana === p
                ? "bg-accent text-accent-contra"
                : "border border-line-2 text-ink-300 hover:border-line-3 hover:text-ink-100"
            }`}
          >
            {p}
          </button>
        ))}
      </nav>

      {pestana === "Paleta" && (
        <PestanaPaleta
          datos={datos}
          tema={tema}
          onColor={cambiarColor}
          onPreset={aplicarPreset}
          onReset={restablecerPaleta}
        />
      )}

      {pestana === "Perfil" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <Tarjeta titulo="Datos de contacto y titulares">
            {[
              ["nombreCorto", "Nombre corto"],
              ["rol", "Rol"],
              ["subtitular", "Subtitular del hero"],
              ["disponibilidad", "Estado de disponibilidad"],
              ["ubicacion", "Ubicación"],
              ["email", "Correo"],
              ["telefono", "Teléfono"],
              ["linkedin", "LinkedIn (URL)"],
            ].map(([clave, etiqueta]) => (
              <Campo
                key={clave}
                etiqueta={etiqueta}
                valor={datos.perfil[clave] ?? ""}
                largo={clave === "subtitular"}
                onChange={(v) =>
                  setDatos((d) => ({ ...d, perfil: { ...d.perfil, [clave]: v } }))
                }
              />
            ))}
          </Tarjeta>

          <Tarjeta titulo="Manifiesto (acto 01)">
            {[
              ["kicker", "Etiqueta"],
              ["texto", "Texto que se enciende con el scroll"],
              ["cierre", "Frase de cierre"],
            ].map(([clave, etiqueta]) => (
              <Campo
                key={clave}
                etiqueta={etiqueta}
                valor={datos.manifiesto[clave] ?? ""}
                largo={clave !== "kicker"}
                onChange={(v) =>
                  setDatos((d) => ({
                    ...d,
                    manifiesto: { ...d.manifiesto, [clave]: v },
                  }))
                }
              />
            ))}
          </Tarjeta>
        </div>
      )}

      {pestana === "Resultados" && (
        <div className="grid gap-5 md:grid-cols-2">
          {datos.metricas.map((m, i) => (
            <Tarjeta key={i} titulo={`Resultado ${i + 1}`}>
              <div className="grid grid-cols-3 gap-3">
                <Campo
                  etiqueta="Prefijo"
                  valor={m.prefijo}
                  onChange={(v) => setLista(setDatos, "metricas", i, { prefijo: v })}
                />
                <Campo
                  etiqueta="Valor"
                  valor={String(m.valor)}
                  onChange={(v) =>
                    setLista(setDatos, "metricas", i, { valor: Number(v) || 0 })
                  }
                />
                <Campo
                  etiqueta="Sufijo"
                  valor={m.sufijo}
                  onChange={(v) => setLista(setDatos, "metricas", i, { sufijo: v })}
                />
              </div>
              <Campo
                etiqueta="Título"
                valor={m.titulo}
                onChange={(v) => setLista(setDatos, "metricas", i, { titulo: v })}
              />
              <Campo
                etiqueta="Detalle"
                valor={m.detalle}
                largo
                onChange={(v) => setLista(setDatos, "metricas", i, { detalle: v })}
              />
            </Tarjeta>
          ))}
        </div>
      )}

      {pestana === "Trayectoria" && (
        <div className="space-y-5">
          {datos.experiencias.map((e, i) => (
            <Tarjeta key={i} titulo={`${e.empresa} — ${e.periodo}`}>
              <div className="grid gap-3 md:grid-cols-2">
                <Campo
                  etiqueta="Empresa"
                  valor={e.empresa}
                  onChange={(v) => setLista(setDatos, "experiencias", i, { empresa: v })}
                />
                <Campo
                  etiqueta="Cargo"
                  valor={e.cargo}
                  onChange={(v) => setLista(setDatos, "experiencias", i, { cargo: v })}
                />
                <Campo
                  etiqueta="Periodo"
                  valor={e.periodo}
                  onChange={(v) => setLista(setDatos, "experiencias", i, { periodo: v })}
                />
                <Campo
                  etiqueta="Sector"
                  valor={e.sector}
                  onChange={(v) => setLista(setDatos, "experiencias", i, { sector: v })}
                />
                <Campo
                  etiqueta="Modalidad (opcional)"
                  valor={e.modalidad ?? ""}
                  ayuda="Explica solapamientos: «En paralelo», «Part-time»…"
                  onChange={(v) =>
                    setLista(setDatos, "experiencias", i, {
                      modalidad: v || undefined,
                    })
                  }
                />
              </div>
              <Campo
                etiqueta="Resumen"
                valor={e.resumen}
                largo
                onChange={(v) => setLista(setDatos, "experiencias", i, { resumen: v })}
              />
              <CampoLista
                etiqueta="Logros (uno por línea)"
                valores={e.logros}
                onChange={(v) => setLista(setDatos, "experiencias", i, { logros: v })}
              />
              <CampoLista
                etiqueta="Stack (uno por línea)"
                valores={e.stack}
                onChange={(v) => setLista(setDatos, "experiencias", i, { stack: v })}
              />
            </Tarjeta>
          ))}
        </div>
      )}

      {pestana === "Proyectos" && (
        <div className="space-y-5">
          {datos.proyectos.map((p, i) => (
            <Tarjeta key={p.slug} titulo={p.nombre}>
              <div className="grid gap-3 md:grid-cols-2">
                <Campo
                  etiqueta="Nombre"
                  valor={p.nombre}
                  onChange={(v) => setLista(setDatos, "proyectos", i, { nombre: v })}
                />
                <Campo
                  etiqueta="Categoría"
                  valor={p.categoria}
                  onChange={(v) => setLista(setDatos, "proyectos", i, { categoria: v })}
                />
                <Campo
                  etiqueta="Año"
                  valor={p.anio}
                  onChange={(v) => setLista(setDatos, "proyectos", i, { anio: v })}
                />
                <Campo
                  etiqueta="Rol"
                  valor={p.rol}
                  onChange={(v) => setLista(setDatos, "proyectos", i, { rol: v })}
                />
              </div>
              <Campo
                etiqueta="Tagline"
                valor={p.tagline}
                onChange={(v) => setLista(setDatos, "proyectos", i, { tagline: v })}
              />
              <Campo
                etiqueta="Problema"
                valor={p.problema}
                largo
                onChange={(v) => setLista(setDatos, "proyectos", i, { problema: v })}
              />
              <Campo
                etiqueta="Solución"
                valor={p.solucion}
                largo
                onChange={(v) => setLista(setDatos, "proyectos", i, { solucion: v })}
              />
              <CampoLista
                etiqueta="Impacto (uno por línea)"
                valores={p.impacto}
                onChange={(v) => setLista(setDatos, "proyectos", i, { impacto: v })}
              />
              <CampoLista
                etiqueta="Stack (uno por línea)"
                valores={p.stack}
                ayuda="Aquí van las tecnologías reales que faltan por confirmar."
                onChange={(v) => setLista(setDatos, "proyectos", i, { stack: v })}
              />
              <label className="mt-2 flex items-center gap-3 text-[0.875rem] text-ink-300">
                <input
                  type="checkbox"
                  checked={p.destacado}
                  onChange={(ev) =>
                    setLista(setDatos, "proyectos", i, { destacado: ev.target.checked })
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Aparece en la baraja del home
              </label>
            </Tarjeta>
          ))}
        </div>
      )}

      {pestana === "Competencias" && (
        <div className="grid gap-5 md:grid-cols-3">
          {datos.competencias.map((k, i) => (
            <Tarjeta key={i} titulo={k.grupo || `Dominio ${i + 1}`}>
              <Campo
                etiqueta="Grupo"
                valor={k.grupo}
                onChange={(v) => setLista(setDatos, "competencias", i, { grupo: v })}
              />
              <Campo
                etiqueta="Claim"
                valor={k.claim}
                onChange={(v) => setLista(setDatos, "competencias", i, { claim: v })}
              />
              <Campo
                etiqueta="Detalle"
                valor={k.detalle}
                largo
                onChange={(v) => setLista(setDatos, "competencias", i, { detalle: v })}
              />
              <CampoLista
                etiqueta="Elementos"
                valores={k.items}
                ayuda="Uno por línea."
                onChange={(v) => setLista(setDatos, "competencias", i, { items: v })}
              />
            </Tarjeta>
          ))}
        </div>
      )}

      {pestana === "Metodología" && (
        <div className="space-y-5">
          <Tarjeta titulo="Encabezado">
            <Campo
              etiqueta="Kicker"
              valor={datos.metodologia.kicker}
              onChange={(v) =>
                setDatos((d) => ({ ...d, metodologia: { ...d.metodologia, kicker: v } }))
              }
            />
            <Campo
              etiqueta="Título"
              valor={datos.metodologia.titulo}
              onChange={(v) =>
                setDatos((d) => ({ ...d, metodologia: { ...d.metodologia, titulo: v } }))
              }
            />
            <Campo
              etiqueta="Introducción"
              valor={datos.metodologia.intro}
              largo
              onChange={(v) =>
                setDatos((d) => ({ ...d, metodologia: { ...d.metodologia, intro: v } }))
              }
            />
          </Tarjeta>

          <div className="grid gap-5 md:grid-cols-2">
            {datos.metodologia.fases.map((f, i) => (
              <Tarjeta key={i} titulo={`${f.n} · ${f.nombre}`}>
                <div className="grid grid-cols-[5rem_1fr] gap-3">
                  <Campo
                    etiqueta="Nº"
                    valor={f.n}
                    onChange={(v) => setFase(setDatos, i, { n: v })}
                  />
                  <Campo
                    etiqueta="Nombre"
                    valor={f.nombre}
                    onChange={(v) => setFase(setDatos, i, { nombre: v })}
                  />
                </div>
                <Campo
                  etiqueta="Claim"
                  valor={f.claim}
                  onChange={(v) => setFase(setDatos, i, { claim: v })}
                />
                <Campo
                  etiqueta="Detalle"
                  valor={f.detalle}
                  largo
                  onChange={(v) => setFase(setDatos, i, { detalle: v })}
                />
                <CampoLista
                  etiqueta="Entregables"
                  valores={f.entregables}
                  ayuda="Uno por línea."
                  onChange={(v) => setFase(setDatos, i, { entregables: v })}
                />
              </Tarjeta>
            ))}
          </div>
        </div>
      )}

      {pestana === "Formación" && (
        <div className="grid gap-5 md:grid-cols-2">
          <Tarjeta titulo="Formación">
            {datos.educacion.map((e, i) => (
              <div key={i} className="space-y-3 border-t border-line pt-4 first:border-0 first:pt-0">
                <Campo
                  etiqueta="Título"
                  valor={e.titulo}
                  onChange={(v) => setLista(setDatos, "educacion", i, { titulo: v })}
                />
                <div className="grid grid-cols-[1fr_5rem_8rem] gap-3">
                  <Campo
                    etiqueta="Institución"
                    valor={e.institucion}
                    onChange={(v) => setLista(setDatos, "educacion", i, { institucion: v })}
                  />
                  <Campo
                    etiqueta="Año"
                    valor={e.anio}
                    onChange={(v) => setLista(setDatos, "educacion", i, { anio: v })}
                  />
                  <Campo
                    etiqueta="Tipo"
                    valor={e.tipo}
                    onChange={(v) => setLista(setDatos, "educacion", i, { tipo: v })}
                  />
                </div>
              </div>
            ))}
          </Tarjeta>

          <Tarjeta titulo="Idiomas">
            {datos.idiomas.map((l, i) => (
              <div key={i} className="space-y-3 border-t border-line pt-4 first:border-0 first:pt-0">
                <div className="grid grid-cols-[1fr_1fr_5rem] gap-3">
                  <Campo
                    etiqueta="Idioma"
                    valor={l.idioma}
                    onChange={(v) => setLista(setDatos, "idiomas", i, { idioma: v })}
                  />
                  <Campo
                    etiqueta="Nivel"
                    valor={l.nivel}
                    onChange={(v) => setLista(setDatos, "idiomas", i, { nivel: v })}
                  />
                  <Campo
                    etiqueta="%"
                    valor={String(l.pct)}
                    ayuda="0–100"
                    onChange={(v) =>
                      setLista(setDatos, "idiomas", i, {
                        pct: Math.min(100, Math.max(0, Number(v) || 0)),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </Tarjeta>
        </div>
      )}

      {pestana === "Caso" && (
        <EditorJson
          titulo="Caso de estudio — Collie App"
          ayuda="Es el documento más profundo del sitio: contexto, restricciones, decisiones, fases, resultados, cifras y aprendizajes, cada uno con su propia forma. Un formulario campo a campo serían doscientas líneas de andamiaje para algo que se toca una vez al año, así que se edita como JSON. Se valida antes de guardar: si está mal formado, el botón no deja."
          valor={datos.caso}
          onChange={(v) => setDatos((d) => ({ ...d, caso: v }))}
        />
      )}

      {pestana === "Imágenes" && (
        <div className="grid gap-5 md:grid-cols-2">
          {imagenes.map((img) => (
            <FormularioImagen key={img.clave} img={img} />
          ))}
        </div>
      )}

      {pestana === "Mensajes" && <PestanaMensajes mensajes={mensajes} />}

      {pestana === "Textos" && (
        <EditorJson
          titulo="Textos de interfaz"
          ayuda="Los rótulos que no son contenido sino interfaz: nombres de sección, etiquetas de campo, textos de botón. Misma razón que el caso para editarlos como JSON. Ojo: si borras una clave, la página usará la del código — el sitio no se rompe, pero tampoco reflejará el borrado."
          valor={datos.textos}
          onChange={(v) => setDatos((d) => ({ ...d, textos: v }))}
        />
      )}
    </div>
  );
}

/* ── Mensajes ───────────────────────────────────────────────── */

export type Mensaje = {
  id: number;
  recibido_en: string;
  nombre: string;
  email: string;
  empresa: string | null;
  interes: string | null;
  mensaje: string;
};

/**
 * Lo que ha entrado por el formulario de contacto.
 *
 * Sólo lectura, y a propósito: el valor de esta pestaña es que exista un
 * sitio donde el mensaje sigue estando aunque el correo no saliera.
 * Poder borrarlos desde aquí sólo añadiría maneras de perderlos.
 *
 * No se pinta a partir de `datos` porque no forma parte de lo que se
 * guarda: mezclarlo con el estado del formulario haría que un «guardar»
 * de la paleta arrastrara los mensajes.
 */
function PestanaMensajes({ mensajes }: { mensajes: Mensaje[] }) {
  if (mensajes.length === 0) {
    return (
      <p className="text-[0.9375rem] leading-relaxed text-ink-400">
        Todavía no ha llegado ningún mensaje por el formulario de contacto.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[0.8125rem] text-ink-400">
        {mensajes.length} mensaje{mensajes.length === 1 ? "" : "s"}, del más
        reciente al más antiguo.
      </p>

      {mensajes.map((m) => (
        <article
          key={m.id}
          className="rounded-xl border border-line-2 bg-ink-950/40 p-5"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-[0.9375rem] font-medium text-ink-100">
              {m.nombre}
              {m.empresa && (
                <span className="font-normal text-ink-400"> · {m.empresa}</span>
              )}
            </h3>
            <time
              dateTime={m.recibido_en}
              className="label-mono text-[0.6875rem] text-ink-400"
            >
              {new Date(m.recibido_en).toLocaleString("es-CL", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </header>

          <p className="mt-1 text-[0.8125rem] text-ink-400">
            {/* Enlace de respuesta con el asunto ya puesto: el gesto que
                sigue a leer un mensaje es contestarlo. */}
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent(
                `Re: ${m.interes ?? "tu mensaje"}`,
              )}`}
              className="underline decoration-line-2 underline-offset-4 transition hover:text-ink-100"
            >
              {m.email}
            </a>
            {m.interes && <span> · {m.interes}</span>}
          </p>

          {/* `whitespace-pre-wrap` conserva los saltos de línea que la
              persona escribió; sin él, tres párrafos se leen como uno. */}
          <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-100">
            {m.mensaje}
          </p>
        </article>
      ))}
    </div>
  );
}

/* ── Paleta ─────────────────────────────────────────────────── */

function PestanaPaleta({
  datos,
  tema,
  onColor,
  onPreset,
  onReset,
}: {
  datos: DatosPanel;
  tema: Tema;
  onColor: (clave: string, valor: string) => void;
  onPreset: (p: (typeof PRESETS)[number]) => void;
  onReset: () => void;
}) {
  const valor = (clave: string) =>
    datos.paleta[tema]?.[clave] ?? PALETA_BASE[tema][clave];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label-mono mb-2">Editando el tema</p>
            <p className="text-[1.0625rem] text-ink-100">
              {tema === "dark" ? "Oscuro" : "Claro"}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-400">
              Conmuta el tema con el botón de la barra para editar el otro. Los
              cambios se ven en vivo en todo el sitio.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-line-2 px-5 py-2.5 text-[0.8125rem] text-ink-200 transition hover:border-ink-100/50 hover:text-ink-100"
          >
            Restablecer paleta
          </button>
        </div>

        <p className="label-mono mb-3">Paletas listas</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.nombre}
              type="button"
              onClick={() => onPreset(p)}
              title={p.nota}
              className="rounded-full border border-line-2 px-4 py-2 text-[0.8125rem] text-ink-200 transition hover:border-accent/50 hover:text-ink-100"
            >
              {p.nombre}
            </button>
          ))}
        </div>
      </div>

      {GRUPOS.map((g) => (
        <div key={g.grupo} className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.0625rem] font-medium text-ink-100">{g.grupo}</h2>
          <p className="mt-1.5 mb-6 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-400">
            {g.descripcion}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.tokens.map((t) => (
              <label
                key={t.clave}
                className="flex items-center gap-3 rounded-xl border border-line bg-ink-950/40 p-3"
              >
                <input
                  type="color"
                  value={valor(t.clave)}
                  onChange={(e) => onColor(t.clave, e.target.value)}
                  aria-label={t.etiqueta}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-line-2 bg-transparent"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.875rem] text-ink-100">
                    {t.etiqueta}
                  </span>
                  <span className="block truncate text-[0.75rem] text-ink-500">
                    {t.ayuda}
                  </span>
                </span>
                <input
                  value={valor(t.clave)}
                  onChange={(e) => onColor(t.clave, e.target.value)}
                  aria-label={`${t.etiqueta} en hexadecimal`}
                  className="w-[5.5rem] rounded-lg border border-line-2 bg-ink-950/60 px-2 py-1.5 font-mono text-[0.75rem] text-ink-200 outline-none focus:border-ink-100"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Piezas de formulario ───────────────────────────────────── */

function Tarjeta({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="mb-5 text-[1.0625rem] font-medium text-ink-100">{titulo}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Campo({
  etiqueta,
  valor,
  onChange,
  largo,
  ayuda,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  largo?: boolean;
  ayuda?: string;
}) {
  const clases =
    "w-full rounded-xl border border-line-2 bg-ink-950/60 px-4 py-3 text-[0.875rem] text-ink-100 outline-none transition placeholder:text-ink-500 focus:border-ink-100 focus:ring-2 focus:border-ink-100";
  return (
    <div>
      <label className="label-mono mb-2 block">{etiqueta}</label>
      {largo ? (
        <textarea
          rows={3}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={`${clases} resize-y`}
        />
      ) : (
        <input
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={clases}
        />
      )}
      {ayuda && <p className="mt-1.5 text-[0.75rem] text-ink-500">{ayuda}</p>}
    </div>
  );
}

function CampoLista({
  etiqueta,
  valores,
  onChange,
  ayuda,
}: {
  etiqueta: string;
  valores: string[];
  onChange: (v: string[]) => void;
  ayuda?: string;
}) {
  return (
    <Campo
      etiqueta={etiqueta}
      valor={valores.join("\n")}
      largo
      ayuda={ayuda}
      onChange={(v) =>
        onChange(
          v
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

/** Deja sólo lo que cambió respecto del contenido original. */


/**
 * Subida y reemplazo de una foto.
 *
 * Formulario propio con su `useActionState`: un archivo no cabe en el
 * JSON que manda el resto del panel, así que viaja aparte como
 * `multipart/form-data`. Y tiene su propio estado de resultado porque su
 * guardado es independiente del botón general.
 *
 * El campo de archivo puede quedarse vacío: entonces sólo se actualizan
 * el texto alternativo, el pie y el encuadre, sin resubir la imagen.
 */
function FormularioImagen({
  img,
}: {
  img: { clave: string; etiqueta: string; src: string; alt: string; pie: string; foco: string; subida: boolean };
}) {
  const [estado, accion, enviando] = useActionState<EstadoAdmin, FormData>(
    subirImagen,
    ADMIN_INICIAL,
  );
  const [estadoBorrado, accionBorrado, borrando] = useActionState<EstadoAdmin, FormData>(
    borrarImagen,
    ADMIN_INICIAL,
  );
  const mensaje = estadoBorrado.mensaje || estado.mensaje;
  const error = estadoBorrado.estado === "error" || estado.estado === "error";

  return (
    <Tarjeta titulo={img.etiqueta}>
      {/* La vista previa usa la proporción REAL del hueco, no una altura
          fija: enseñar la foto en una caja que no es la del sitio es
          justo lo que hacía falta corregir a ciegas con el encuadre. */}
      {img.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.src}
          alt=""
          style={{ aspectRatio: proporcionDe(img.clave) }}
          className="max-h-72 w-full rounded-xl border border-line-2 object-cover"
        />
      ) : (
        <div
          style={{ aspectRatio: proporcionDe(img.clave) }}
          className="grid max-h-72 w-full place-items-center rounded-xl border border-dashed border-line-2 text-[0.8125rem] text-ink-500"
        >
          Sin imagen
        </div>
      )}
      <p className="label-mono">
        {img.subida
          ? "Subida desde el panel"
          : img.src
            ? "Archivo del repositorio"
            : "Pendiente de subir"}
      </p>

      <form action={accion} className="space-y-4">
        <input type="hidden" name="clave" value={img.clave} />
        <Recorte nombre="archivo" clave={img.clave} proporcion={proporcionDe(img.clave)} />
        <Campo etiqueta="Texto alternativo" valor={img.alt} onChange={() => {}} />
        <input type="hidden" name="alt" defaultValue={img.alt} />
        <div className="grid grid-cols-[1fr_9rem] gap-3">
          <div>
            <label className="label-mono mb-2 block">Pie</label>
            <input
              name="pie"
              defaultValue={img.pie}
              className="w-full rounded-xl border border-line-2 bg-ink-950/60 px-4 py-3 text-[0.875rem] text-ink-100 outline-none focus:border-ink-100"
            />
          </div>
          <div>
            <label className="label-mono mb-2 block">Encuadre</label>
            <input
              name="foco"
              defaultValue={img.foco}
              className="w-full rounded-xl border border-line-2 bg-ink-950/60 px-4 py-3 text-[0.875rem] text-ink-100 outline-none focus:border-ink-100"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-accent px-5 py-2.5 text-[0.8125rem] font-medium text-accent-contra transition hover:opacity-85 disabled:opacity-50"
          >
            {enviando ? "Subiendo…" : "Guardar imagen"}
          </button>
        </div>
      </form>

      {img.subida && (
        <form action={accionBorrado}>
          <input type="hidden" name="clave" value={img.clave} />
          <button
            type="submit"
            disabled={borrando}
            className="text-[0.8125rem] text-ink-400 underline underline-offset-4 hover:text-ink-100 disabled:opacity-50"
          >
            {borrando ? "Restaurando…" : "Volver a la del repositorio"}
          </button>
        </form>
      )}

      {mensaje && (
        <p className={`text-[0.8125rem] ${error ? "font-medium text-ink-100" : "text-ink-400"}`}>
          {mensaje}
        </p>
      )}
    </Tarjeta>
  );
}

/**
 * Editor de un documento JSON.
 *
 * Para el caso de estudio y los textos de interfaz: estructuras
 * profundas y heterogéneas que se editan de una pieza y muy de vez en
 * cuando. Un formulario campo a campo sería mucho andamiaje para poco
 * uso, y habría que rehacerlo cada vez que la estructura cambia.
 *
 * El texto se guarda en estado local mientras se escribe —si se
 * intentara analizar en cada tecla, borrar una llave dejaría el
 * documento inválido y se perdería lo editado— y sólo se propaga
 * cuando el JSON es válido. Mientras no lo sea, se avisa y no se
 * escribe nada.
 */
function EditorJson({
  titulo,
  ayuda,
  valor,
  onChange,
}: {
  titulo: string;
  ayuda: string;
  valor: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const [texto, setTexto] = useState(() => JSON.stringify(valor, null, 2));
  const [error, setError] = useState<string | null>(null);

  const escribir = (v: string) => {
    setTexto(v);
    try {
      const parseado = JSON.parse(v);
      if (typeof parseado !== "object" || parseado === null || Array.isArray(parseado)) {
        setError("La raíz tiene que ser un objeto.");
        return;
      }
      setError(null);
      onChange(parseado as Record<string, unknown>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON inválido.");
    }
  };

  return (
    <Tarjeta titulo={titulo}>
      <p className="text-[0.8125rem] leading-relaxed text-ink-400">{ayuda}</p>
      <textarea
        value={texto}
        onChange={(e) => escribir(e.target.value)}
        spellCheck={false}
        rows={26}
        className={`w-full rounded-xl border bg-ink-950/60 px-4 py-3 font-mono text-[0.75rem] leading-relaxed text-ink-100 outline-none transition ${
          error ? "border-ink-100" : "border-line-2 focus:border-ink-100"
        }`}
      />
      <p
        className={`text-[0.75rem] ${error ? "font-medium text-ink-100" : "text-ink-500"}`}
      >
        {error ? `JSON inválido: ${error}` : "JSON válido."}
      </p>
    </Tarjeta>
  );
}

/** Actualiza una fase de la metodología, que vive anidada. */
function setFase(
  set: React.Dispatch<React.SetStateAction<DatosPanel>>,
  indice: number,
  parche: Partial<DatosPanel["metodologia"]["fases"][number]>,
) {
  set((d) => {
    const fases = [...d.metodologia.fases];
    fases[indice] = { ...fases[indice], ...parche };
    return { ...d, metodologia: { ...d.metodologia, fases } };
  });
}

/** Actualiza un elemento de una de las listas del panel. */
function setLista<
  K extends
    | "metricas"
    | "experiencias"
    | "proyectos"
    | "competencias"
    | "educacion"
    | "idiomas",
>(
  set: React.Dispatch<React.SetStateAction<DatosPanel>>,
  clave: K,
  indice: number,
  parche: Partial<DatosPanel[K][number]>,
) {
  set((d) => {
    const lista = [...d[clave]] as DatosPanel[K];
    lista[indice] = { ...lista[indice], ...parche };
    return { ...d, [clave]: lista };
  });
}
