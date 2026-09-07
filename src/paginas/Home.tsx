import Hero from "@/components/home/Hero";
import Perfil from "@/components/home/Perfil";
import Trabajo from "@/components/home/Trabajo";
import Cierre from "@/components/home/Cierre";
import Escena from "@/components/Escena";
import type { Idioma } from "@/data/idioma";
import { leerContenido } from "@/db/consultas";

/**
 * HOME — tres actos.
 *
 *   Apertura · 01 Perfil · 02 Trabajo · 03 Cierre
 *
 * El cuerpo vive aquí y no en `app/page.tsx` porque lo comparten las dos
 * rutas del sitio: `/` y `/en`. La página de cada idioma es un archivo de
 * cuatro líneas que decide los metadatos y llama a esto con su `idioma`.
 */
/** Una sola lectura para los cuatro actos: la caché la comparte, pero
 *  pedirla cuatro veces ensuciaría el árbol sin ganar nada. */
export default async function Home({ idioma }: { idioma: Idioma }) {
  const c = await leerContenido(idioma);

  return (
    <>
      <Hero c={c} />
      {/* Perfil en color invertido: la página entera pasa a oscuro
          mientras se lee y vuelve al papel para los proyectos. Es el
          único cambio de registro del recorrido, y separa el «quién soy»
          del «qué hice» sin necesidad de un fondo de sección. */}
      <Escena>
        <Perfil c={c} idioma={idioma} />
      </Escena>
      <Trabajo c={c} idioma={idioma} />
      <Cierre c={c} idioma={idioma} />
    </>
  );
}
