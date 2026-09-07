"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { idiomaDeRuta } from "@/data/idioma";
import type { Cromo } from "./cromo";

/**
 * Pie mínimo: una sola fila sobre un filete.
 *
 * El pie del diseño anterior repetía navegación, contacto, redes y una
 * firma tipográfica gigante. Pero en el home el acto 03 YA es el cierre
 * —tiene el correo, el teléfono y el enlace a LinkedIn en cuerpo
 * grande—, así que repetirlo aquí abajo sólo restaba fuerza a los dos.
 *
 * Aquí queda lo que un pie tiene que tener y no cabe en otro sitio: la
 * atribución, el año y una salida de emergencia a las tres secciones.
 */
export default function Footer({ cromo }: { cromo: Cromo }) {
  // El idioma se deduce de la ruta: el layout no la recibe.
  const idioma = idiomaDeRuta(usePathname());
  const { navegacion, nav: t, ...perfil } = cromo[idioma];

  return (
    <footer className="shell border-t border-line py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
        <span className="label-mono">
          © {new Date().getFullYear()} {perfil.nombreCorto}
        </span>

        <nav aria-label={t.pie}>
          <ul className="flex flex-wrap items-baseline gap-x-7 gap-y-2">
            {navegacion.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="subrayado text-[0.8125rem] text-ink-400 hover:text-ink-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={perfil.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="subrayado text-[0.8125rem] text-ink-400 hover:text-ink-100"
              >
                LinkedIn <span aria-hidden>↗</span>
              </a>
            </li>
          </ul>
        </nav>

        <span className="label-mono">{perfil.ubicacion}</span>
      </div>
    </footer>
  );
}
