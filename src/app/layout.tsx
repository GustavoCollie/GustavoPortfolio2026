import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { perfil } from "@/data/content";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import DatosEstructurados from "@/components/DatosEstructurados";
import MapaFondo from "@/components/MapaFondo";
import ProveedorCarga from "@/components/Carga";
import CursorFluido from "@/components/CursorFluido";
import DesplazamientoBorde from "@/components/DesplazamientoBorde";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import { cssDePaleta, resolverPaleta } from "@/lib/paleta";
import { leerContenido, leerPaleta } from "@/db/consultas";
import type { Cromo } from "@/components/cromo";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Display: grotesca estrecha en versalitas. Es el único gesto tipográfico
 *  del sistema, así que va en los dos pesos que de verdad se usan. */
const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const title = `${perfil.nombreCorto} — ${perfil.rol}`;
const description = perfil.subtitular;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/", languages: { "es-PE": "/", en: "/en" } },
  title: {
    default: title,
    template: `%s · ${perfil.nombreCorto}`,
  },
  description,
  keywords: [
    "Gustavo Márquez",
    "portafolio",
    "product manager",
    "desarrollo de negocios",
    "Scrum",
    "Power BI",
    "aplicaciones móviles",
    "agroexportación",
    "Perú",
  ],
  authors: [{ name: perfil.nombreCorto }],
  openGraph: {
    title,
    description,
    locale: "es_PE",
    type: "profile",
    siteName: perfil.nombreCorto,
    url: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  creator: perfil.nombreCorto,
  twitter: { card: "summary_large_image", title, description },
};

/**
 * El color de la barra del navegador en móvil.
 *
 * Se resuelve contra la paleta guardada en vez de fijarlo: con los
 * grises escritos a mano, elegir una paleta azul dejaba la barra del
 * sistema del color anterior y el corte se veía en cuanto la página
 * empezaba justo debajo.
 */
export async function generateViewport(): Promise<Viewport> {
  const paleta = await leerPaleta();
  return {
    themeColor: [
      {
        media: "(prefers-color-scheme: dark)",
        color: resolverPaleta(paleta, "dark")["ink-950"],
      },
      {
        media: "(prefers-color-scheme: light)",
        color: resolverPaleta(paleta, "light")["ink-950"],
      },
    ],
  };
}

/**
 * Se ejecuta antes del primer pintado para evitar el parpadeo de tema:
 * lee la preferencia guardada y, si no hay ninguna, la del sistema.
 * Debe ir en <head> y ser síncrono; por eso es una cadena y no un módulo.
 *
 * Fija los DOS atributos (ver lib/tema.ts): la preferencia y el pintado.
 * Al arrancar coinciden; sólo una <Escena> invertida los separa.
 *
 * El claro es el tema por defecto, así que sólo se pasa a oscuro si el
 * sistema lo pide explícitamente.
 */
const TEMA_INICIAL = `(function(){try{var t=localStorage.getItem("tema");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var d=document.documentElement;d.dataset.theme=t;d.dataset.temaBase=t;}catch(e){}})();`;

/**
 * Empuja el contador del telón ANTES de que React exista.
 *
 * Va aquí y no en el componente porque la cifra tiene que moverse durante
 * los milisegundos en los que de verdad se está descargando y evaluando el
 * bundle — que son justo aquellos en los que React todavía no puede pintar
 * nada. Si esperase a la hidratación, el contador saltaría de 000 a 100 de
 * golpe y la pantalla no contaría nada.
 *
 * Sube sólo hasta 89: el tramo final lo cierra el componente cuando las
 * fuentes y los recursos están de verdad listos. Se aparta en cuanto ve
 * `data-hidratado`, para no pelearse con React por el mismo nodo.
 */
const ARRANQUE_CARGA = `(function(){if(window.__carga||location.pathname!=="/")return;window.__carga=1;var t0=performance.now();function tick(){var el=document.querySelector(".carga");if(!el){if(performance.now()-t0<12000)setTimeout(tick,24);return;}if(el.dataset.hidratado==="true"||el.dataset.fase!=="cargando")return;var p=Math.min(89,Math.floor((performance.now()-t0)/14));var c=el.querySelector(".carga__contador"),b=el.querySelector(".carga__barra");if(c)c.textContent=String(p).padStart(3,"0");if(b)b.style.transform="scaleX("+p/100+")";el.setAttribute("aria-valuenow",String(p));if(p<89)setTimeout(tick,32);}tick();})();`;

/**
 * Barra, pie y telón viven aquí, por encima de la página, así que no
 * saben en qué idioma están. El layout resuelve los dos —son lecturas
 * cacheadas— y cada uno elige el suyo por la ruta. Ver `components/cromo`.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* La paleta se lee aquí y no en un módulo: antes salía de
     `overrides.json`, que la base dejó obsoleto — el panel guardaba en la
     tabla `paleta` y el sitio seguía leyendo un archivo vacío, así que
     ningún cambio de color llegaba a verse. */
  const [es, en, paleta] = await Promise.all([
    leerContenido("es"),
    leerContenido("en"),
    leerPaleta(),
  ]);
  const paletaCss = cssDePaleta(paleta);
  const recorta = (c: typeof es) => ({
    nombreCorto: c.perfil.nombreCorto,
    ubicacion: c.perfil.ubicacion,
    rol: c.perfil.rol,
    email: c.perfil.email,
    telefono: c.perfil.telefono,
    telefonoRaw: c.perfil.telefonoRaw,
    linkedin: c.perfil.linkedin,
    navegacion: [...c.navegacion],
    nav: c.textos.nav,
    carga: c.textos.carga,
  });
  const cromo: Cromo = { es: recorta(es), en: recorta(en) };

  return (
    <html
      lang="es"
      data-theme="light"
      data-tema-base="light"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_INICIAL }} />
        <script dangerouslySetInnerHTML={{ __html: ARRANQUE_CARGA }} />
        {/* Paleta editada desde /admin. Va después de globals.css para
            ganar por orden de cascada; si no hay cambios, no emite nada. */}
        {paletaCss && (
          <style
            id="paleta-personalizada"
            dangerouslySetInnerHTML={{ __html: paletaCss }}
          />
        )}
      </head>
      <body className="antialiased">
        {/* Primer elemento enfocable: quien navega con teclado no debería
            recorrer el menú entero en cada página. */}
        <a
          href="#contenido"
          className="sr-only rounded-full bg-accent px-5 py-3 text-[0.875rem] font-medium text-accent-contra focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
        >
          Saltar al contenido
        </a>
        <DatosEstructurados />
        {/* Detrás de todo, en -z-10. Hereda el tema, así que se invierte
            con la <Escena> sin necesitar lógica propia. */}
        <MapaFondo />
        <CursorFluido />
        <SmoothScroll>
          {/* El telón vive dentro de SmoothScroll porque necesita parar y
              arrancar Lenis mientras está bajado. */}
          <ProveedorCarga cromo={cromo}>
            {/* Dentro de SmoothScroll: necesita la instancia de Lenis. */}
            <DesplazamientoBorde />
            <ScrollProgress />
            <Nav cromo={cromo} />
            <main id="contenido">{children}</main>
            <Footer cromo={cromo} />
          </ProveedorCarga>
        </SmoothScroll>
        {/* Sólo emite en producción; en local no hace nada. */}
        <Analytics />
      </body>
    </html>
  );
}
