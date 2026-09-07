"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { idiomaDeRuta, rutaEquivalente, ruta } from "@/data/idioma";
import type { Cromo } from "./cromo";
import { EASE_CINEMA } from "./kinetics";
import ThemeToggle from "./ThemeToggle";

/**
 * Barra fija, sin fondo ni desenfoque.
 *
 * Con tres enlaces y tipografía pequeña la barra pesa poco, y dejarla
 * flotando sobre el contenido mantiene la página entera como un solo
 * plano — sin el cristal translúcido del diseño anterior.
 *
 * En cuanto se empieza a bajar se CONDENSA: menos aire arriba y abajo, la
 * marca más pequeña, la ubicación se retira y aparece un fondo sólido.
 * No desaparece, porque una barra que se esconde obliga a un gesto extra
 * cada vez que se quiere navegar.
 *
 * El fondo no es un adorno: arriba del todo la barra flota sobre espacio
 * en blanco y `mix-blend-difference` basta para que se lea sobre lo que
 * sea. En cuanto hay contenido debajo, mezclar deja de funcionar — el
 * menú y el párrafo se pisan y no se lee ninguno de los dos. Por eso al
 * condensar se cambia de estrategia: cristal esmerilado —fondo del tema
 * al 55% con desenfoque detrás—, filete inferior y colores normales.
 * El desenfoque separa la barra del contenido sin cortarlo en seco, que
 * es lo que hacía un fondo opaco.
 *
 * Las dos estrategias son incompatibles y por eso se alternan: mezclar
 * contra un fondo propio se invertiría a sí mismo, y `backdrop-filter`
 * no tiene nada que desenfocar si el elemento no es opaco a su manera.
 *
 * El menú móvil es una cortina a pantalla completa con los enlaces en
 * tamaño display: en un sitio cuya única baza es la tipografía, el menú
 * también tiene que serlo.
 */
export default function Nav({ cromo }: { cromo: Cromo }) {
  const pathname = usePathname();
  const idioma = idiomaDeRuta(pathname);
  const { navegacion, nav: t, ...perfil } = cromo[idioma];
  const [abierto, setAbierto] = useState(false);

  /* Umbral con histéresis: condensa a los 60 px y sólo vuelve a expandirse
     por debajo de 20. Con un único umbral, quedarse justo encima hacía que
     la barra parpadeara entre los dos estados con cada micro-scroll. */
  const { scrollY } = useScroll();
  const [condensada, setCondensada] = useState(false);
  const estado = useRef(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const siguiente = estado.current ? v > 20 : v > 60;
    if (siguiente === estado.current) return;
    estado.current = siguiente;
    setCondensada(siguiente);
  });

  // La cortina ocupa la pantalla: si el documento sigue desplazándose
  // detrás, al cerrarla apareces en otro sitio.
  useEffect(() => {
    document.documentElement.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.35, ease: EASE_CINEMA }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          condensada
            ? "border-b border-line bg-ink-950/55 text-ink-100 backdrop-blur-xl backdrop-saturate-150"
            : "mix-blend-difference text-white"
        }`}
      >
        {/* Los hijos heredan el color del <header> y se diferencian por
            opacidad, no por un color propio: así el cambio entre los dos
            estados es una sola declaración y no una por elemento. */}
        <nav
          className={`shell flex items-center justify-between gap-6 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            condensada ? "py-3" : "py-6"
          }`}
        >
          <Link
            href={ruta("home", idioma)}
            className="group flex items-baseline gap-3"
            aria-label={t.inicio}
          >
            <span
              className={`display tracking-[-0.04em] transition-[font-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                condensada ? "text-[0.875rem]" : "text-[1.05rem]"
              }`}
            >
              {perfil.nombreCorto}
            </span>
            {/* La ubicación se retira al condensar: es contexto de
                bienvenida, no navegación. Se colapsa el ancho además de la
                opacidad para que los enlaces recuperen el espacio. */}
            <span
              className={`label-mono hidden overflow-hidden whitespace-nowrap !text-current opacity-60 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:block ${
                condensada ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
              }`}
            >
              {perfil.ubicacion}
            </span>
          </Link>

          <div className="flex items-center gap-7">
            <ul className="hidden items-center gap-7 md:flex">
                {navegacion.map((item) => {
                  const activo = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`subrayado text-[0.8125rem] transition-opacity ${
                          activo ? "opacity-100" : "opacity-65 hover:opacity-100"
                        }`}
                        style={activo ? { backgroundSize: "100% 1px" } : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
              })}
            </ul>

            <Link
              href={rutaEquivalente(pathname)}
              hrefLang={idioma === "es" ? "en" : "es"}
              aria-label={t.cambiarIdioma}
              className="font-mono text-[0.6875rem] tracking-[0.12em] opacity-65 transition-opacity hover:opacity-100"
            >
              {t.otroIdioma}
            </Link>

            <ThemeToggle />

            <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-expanded={abierto}
                aria-label={abierto ? t.cerrarMenu : t.abrirMenu}
                className="relative z-50 grid h-6 w-6 place-items-center md:hidden"
              >
                <span className="relative block h-3 w-5">
                  <span
                    className={`absolute left-0 block h-px w-5 bg-current transition-transform duration-500 ${
                      abierto ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-px w-5 bg-current transition-transform duration-500 ${
                      abierto ? "top-1.5 -rotate-45" : "top-3"
                    }`}
                  />
                </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE_CINEMA }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink-950 md:hidden"
          >
            <ul className="shell">
              {navegacion.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.07,
                    duration: 0.7,
                    ease: EASE_CINEMA,
                  }}
                >
                  <Link
                    href={item.href}
                    // Se cierra en el clic y no en un efecto sobre `pathname`:
                    // la cortina se cierra porque alguien eligió, no porque
                    // haya cambiado la ruta.
                    onClick={() => setAbierto(false)}
                    className="flex items-baseline gap-5 border-b border-line py-5"
                  >
                    <span className="label-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="display text-[clamp(2.25rem,11vw,3.5rem)] text-ink-100">
                      {item.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="shell mt-12 space-y-1">
              <a
                href={`mailto:${perfil.email}`}
                className="block text-sm text-ink-300"
              >
                {perfil.email}
              </a>
              <a
                href={`tel:${perfil.telefonoRaw}`}
                className="block text-sm text-ink-300"
              >
                {perfil.telefono}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
