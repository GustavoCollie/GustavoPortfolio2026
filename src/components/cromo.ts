import type { Idioma, Textos } from "@/data/idioma";

/**
 * El «cromo» del sitio: lo poco que barra, pie y telón necesitan del
 * contenido.
 *
 * Existe porque esos tres viven en el layout, que está por ENCIMA de la
 * página en el árbol y por tanto no sabe en qué idioma está —el layout
 * no recibe la ruta—. La solución es que el layout resuelva los dos
 * idiomas (son dos lecturas cacheadas, prácticamente gratis) y que cada
 * componente elija el suyo a partir del `usePathname`.
 *
 * Se manda esto y no el contenido entero porque cruza al cliente en cada
 * página: no tiene sentido serializar el caso de estudio completo para
 * pintar un nombre en una barra.
 */
export type Cromo = Record<
  Idioma,
  {
    nombreCorto: string;
    ubicacion: string;
    rol: string;
    email: string;
    telefono: string;
    telefonoRaw: string;
    linkedin: string;
    navegacion: { href: string; label: string }[];
    nav: Textos["nav"];
    carga: Textos["carga"];
  }
>;
