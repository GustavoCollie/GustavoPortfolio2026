"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * ─────────────────────────────────────────────────────────────
 *  RECORTE ANTES DE SUBIR
 *
 *  Marco fijo, imagen que se mueve detrás. No es un rectángulo de
 *  selección libre a propósito: cada hueco del sitio tiene una
 *  proporción obligatoria, así que dejar elegir la forma sólo daría
 *  maneras de equivocarse. Lo único que se decide aquí es QUÉ parte de
 *  la foto se ve, que es la decisión que de verdad existe.
 *
 *  Resuelve tres problemas de una vez:
 *
 *  · El encuadre. Antes se subía la foto entera y se corregía a ojo con
 *    un campo de texto («50% 42%»), sin ver el resultado hasta guardar.
 *
 *  · El peso. Una foto de teléfono son 4–8 MB y el límite de subida son
 *    4: se rechazaban casi todas. Al recortar se reescala al tamaño que
 *    el sitio realmente usa y baja a unos cientos de kilobytes.
 *
 *  · La orientación. `imageOrientation: "from-image"` aplica el EXIF, sin
 *    el cual las fotos verticales de móvil llegan tumbadas.
 *
 *  El resultado se deja en un <input type="file"> oculto, así que la
 *  acción del servidor no se entera de nada: recibe un archivo como
 *  siempre.
 * ─────────────────────────────────────────────────────────────
 */

/** Ancho del lienzo de vista previa, en píxeles de dibujo. */
const VISTA = 720;

/** Lado mayor del archivo que se sube. Por encima no se gana nada
 *  visible y sí se gana peso. */
const MAX_LADO = 2000;

const MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const sujeta = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

type Fuente = { mapa: CanvasImageSource; ancho: number; alto: number };

/** Carga el archivo aplicando la orientación del EXIF. */
async function cargar(archivo: File): Promise<Fuente> {
  try {
    const mapa = await createImageBitmap(archivo, {
      imageOrientation: "from-image",
    });
    return { mapa, ancho: mapa.width, alto: mapa.height };
  } catch {
    // Navegadores sin `createImageBitmap` con opciones: se pierde la
    // corrección de orientación pero se puede recortar igual.
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { mapa: img, ancho: img.naturalWidth, alto: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/** Gira una fuente 90° a la derecha y devuelve otra fuente. */
function girar(f: Fuente): Fuente {
  const lienzo = document.createElement("canvas");
  lienzo.width = f.alto;
  lienzo.height = f.ancho;
  const ctx = lienzo.getContext("2d")!;
  ctx.translate(f.alto, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(f.mapa, 0, 0);
  return { mapa: lienzo, ancho: f.alto, alto: f.ancho };
}

/**
 * Ancho mínimo razonable del archivo final.
 *
 * Al acercar se recortan menos píxeles del original, así que el recorte
 * sale más pequeño. No se reescala hacia arriba —eso no recupera detalle,
 * sólo lo inventa y añade peso—: se avisa, que es lo único honesto que se
 * puede hacer con una foto que no da para ese encuadre.
 *
 * El hueco del móvil se dibuja a un 17% del ancho de la maqueta, así que
 * pedirle lo mismo que a una captura de escritorio rechazaría recortes
 * perfectamente buenos.
 */
const minimoUtil = (proporcion: number) => (proporcion < 1 ? 500 : 1000);

export default function Recorte({
  nombre,
  clave,
  proporcion,
}: {
  /** Nombre del campo del formulario. */
  nombre: string;
  /** Clave de la imagen: sólo para nombrar el archivo generado. */
  clave: string;
  /** Ancho / alto del hueco donde irá la imagen. */
  proporcion: number;
}) {
  const oculto = useRef<HTMLInputElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  const [fuente, setFuente] = useState<Fuente | null>(null);
  const [zoom, setZoom] = useState(1);
  const [centro, setCentro] = useState({ x: 0.5, y: 0.5 });
  const [peso, setPeso] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const alto = Math.round(VISTA / proporcion);

  /* La geometría del recorte se calcula una sola vez y la usan tanto la
     vista previa como el archivo final. Tenerla duplicada era la forma
     segura de que lo que se ve y lo que se sube dejaran de coincidir. */
  const region = useCallback(
    (f: Fuente) => {
      const base = Math.max(VISTA / f.ancho, alto / f.alto);
      const s = base * zoom;
      const dw = f.ancho * s;
      const dh = f.alto * s;
      const ox = sujeta(VISTA / 2 - centro.x * dw, VISTA - dw, 0);
      const oy = sujeta(alto / 2 - centro.y * dh, alto - dh, 0);
      return { sx: -ox / s, sy: -oy / s, sw: VISTA / s, sh: alto / s, dw, dh };
    },
    [alto, zoom, centro],
  );

  /* ── Vista previa ─────────────────────────────────────────── */
  useEffect(() => {
    const c = lienzo.current;
    if (!c || !fuente) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { sx, sy, sw, sh } = region(fuente);
    ctx.clearRect(0, 0, VISTA, alto);
    ctx.drawImage(fuente.mapa, sx, sy, sw, sh, 0, 0, VISTA, alto);
  }, [fuente, region, alto]);

  /* ── Generar el archivo ───────────────────────────────────── */
  useEffect(() => {
    if (!fuente) return;
    // Se espera a que el gesto pare: codificar en cada píxel de arrastre
    // haría el recortador inservible en un móvil.
    const t = setTimeout(async () => {
      const { sx, sy, sw, sh } = region(fuente);
      const ancho = Math.max(1, Math.min(MAX_LADO, Math.round(sw)));
      const altoSalida = Math.max(1, Math.round(ancho / proporcion));

      const salida = document.createElement("canvas");
      salida.width = ancho;
      salida.height = altoSalida;
      const ctx = salida.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(fuente.mapa, sx, sy, sw, sh, 0, 0, ancho, altoSalida);

      const blob = await new Promise<Blob | null>((r) =>
        salida.toBlob(r, "image/webp", 0.9),
      );
      if (!blob || !oculto.current) return;

      // `DataTransfer` es la única forma de poner un archivo fabricado en
      // un <input type="file">. Donde no exista, se sube el original.
      try {
        const dt = new DataTransfer();
        dt.items.add(new File([blob], `${clave}.webp`, { type: "image/webp" }));
        oculto.current.files = dt.files;
        setPeso(`${ancho}×${altoSalida} · ${(blob.size / 1024).toFixed(0)} KB`);
        setAviso(
          ancho < minimoUtil(proporcion)
            ? `Se está acercando más de lo que da esta foto: saldría a ${ancho} px de ancho y se verá borrosa. Aleja un poco o usa un original más grande.`
            : null,
        );
      } catch {
        setAviso(
          "Este navegador no deja preparar el recorte. Se subirá la imagen original.",
        );
      }
    }, 260);
    return () => clearTimeout(t);
  }, [fuente, region, proporcion, clave]);

  /* ── Elegir archivo ───────────────────────────────────────── */
  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setAviso(null);
    setPeso(null);
    if (!archivo) {
      setFuente(null);
      if (oculto.current) oculto.current.value = "";
      return;
    }
    if (!MIMES.includes(archivo.type)) {
      setFuente(null);
      setAviso(`Formato no admitido (${archivo.type || "desconocido"}).`);
      return;
    }
    try {
      const f = await cargar(archivo);
      setZoom(1);
      setCentro({ x: 0.5, y: 0.5 });
      setFuente(f);
    } catch {
      setAviso("No pude leer esa imagen. Prueba con otra.");
    }
  }

  /* ── Arrastrar y pellizcar ────────────────────────────────── */
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const distancia = useRef(0);

  function aEscala(e: React.PointerEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    return VISTA / r.width;
  }

  function alBajar(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      distancia.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function alMover(e: React.PointerEvent<HTMLCanvasElement>) {
    const previo = punteros.current.get(e.pointerId);
    if (!previo || !fuente) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distancia.current > 0) ajustarZoom((d / distancia.current - 1) * 2);
      distancia.current = d;
      return;
    }

    const k = aEscala(e);
    const { dw, dh } = region(fuente);
    const dx = (e.clientX - previo.x) * k;
    const dy = (e.clientY - previo.y) * k;
    // Arrastrar la imagen a la derecha muestra la parte de su izquierda:
    // el centro se desplaza en sentido contrario al dedo.
    mover(-dx / dw, -dy / dh);
  }

  function alSoltar(e: React.PointerEvent<HTMLCanvasElement>) {
    punteros.current.delete(e.pointerId);
    distancia.current = 0;
  }

  const mover = (dx: number, dy: number) => {
    if (!fuente) return;
    const { dw, dh } = region(fuente);
    // El marco tiene que seguir cubierto: el centro no puede acercarse a
    // un borde más de lo que mide medio marco.
    const mx = Math.min(0.5, VISTA / (2 * dw));
    const my = Math.min(0.5, alto / (2 * dh));
    setCentro((c) => ({
      x: sujeta(c.x + dx, mx, 1 - mx),
      y: sujeta(c.y + dy, my, 1 - my),
    }));
  };

  const ajustarZoom = (delta: number) =>
    setZoom((z) => sujeta(z + delta, 1, 6));

  const CONTROL =
    "rounded-full border border-line-2 px-3 py-1.5 text-[0.75rem] text-ink-200 transition hover:border-line-3 hover:bg-surface-2";

  return (
    <div className="space-y-3">
      <label className="label-mono mb-2 block">Reemplazar archivo</label>

      {/* El archivo que de verdad viaja al servidor. */}
      <input ref={oculto} type="file" name={nombre} className="hidden" />

      <input
        type="file"
        accept={MIMES.join(",")}
        onChange={elegir}
        className="w-full text-[0.8125rem] text-ink-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-[0.8125rem] file:text-accent-contra"
      />

      {fuente && (
        <>
          <div className="relative overflow-hidden rounded-xl border border-line-2 bg-ink-950">
            <canvas
              ref={lienzo}
              width={VISTA}
              height={alto}
              onPointerDown={alBajar}
              onPointerMove={alMover}
              onPointerUp={alSoltar}
              onPointerCancel={alSoltar}
              onWheel={(e) => ajustarZoom(e.deltaY < 0 ? 0.12 : -0.12)}
              // `touch-none` es lo que impide que arrastrar dentro del
              // marco desplace la página en un móvil.
              className="w-full cursor-grab touch-none active:cursor-grabbing"
            />
            {/* Retícula de tercios: encuadrar a ojo sin referencia sale
                casi siempre descentrado. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, transparent calc(100%/3 - 1px), rgb(255 255 255 / .35) calc(100%/3), transparent calc(100%/3 + 1px), transparent calc(200%/3 - 1px), rgb(255 255 255 / .35) calc(200%/3), transparent calc(200%/3 + 1px)), linear-gradient(to bottom, transparent calc(100%/3 - 1px), rgb(255 255 255 / .35) calc(100%/3), transparent calc(100%/3 + 1px), transparent calc(200%/3 - 1px), rgb(255 255 255 / .35) calc(200%/3), transparent calc(200%/3 + 1px))",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="range"
              min={1}
              max={6}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Acercar"
              className="h-1 flex-1 min-w-32 cursor-pointer accent-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => fuente && setFuente(girar(fuente))}
              className={CONTROL}
            >
              Girar 90°
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setCentro({ x: 0.5, y: 0.5 });
              }}
              className={CONTROL}
            >
              Centrar
            </button>
          </div>

          <p className="text-[0.75rem] text-ink-500">
            Arrastra para encuadrar y pellizca o usa la barra para acercar.
            {peso ? ` Se subirá a ${peso}.` : " Preparando…"}
          </p>
        </>
      )}

      {!fuente && (
        <p className="text-[0.75rem] text-ink-500">
          JPG, PNG, WebP o AVIF. Se recorta y se reescala aquí, así que no
          importa lo que pese el original. Déjalo vacío para cambiar sólo los
          textos.
        </p>
      )}

      {aviso && <p className="text-[0.75rem] font-medium text-ink-100">{aviso}</p>}
    </div>
  );
}
