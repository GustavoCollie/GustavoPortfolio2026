# Portafolio — Gustavo Márquez

Portafolio de perfil híbrido **negocios + software**. Bilingüe (español e
inglés), con el contenido en base de datos y un panel para editarlo sin
tocar código ni desplegar.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind 4 ·
Postgres (Supabase) · Motion · Lenis.

---

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # y rellena DATABASE_URL y ADMIN_SECRET
npm run db:local               # Postgres en Docker (opcional, para local)
npm run db:seed                # crea el esquema y vuelca el contenido
npm run dev
```

El sitio arranca **sin base de datos**: si falta `DATABASE_URL` o la
consulta falla, sirve el contenido de `src/data/`. Un portafolio que
devuelve 500 porque la base está caída es peor que uno con el texto de la
última versión desplegada.

---

## Arquitectura

### El contenido vive en la base

`src/data/content.ts` y `content.en.ts` son el contenido **de partida**:
lo que siembra `npm run db:seed` y el respaldo si la base no responde. En
producción manda Postgres.

Se normaliza lo que se consulta por partes —proyectos, experiencias,
métricas, competencias, formación son filas reordenables— y se guarda
como JSONB lo que siempre se lee y se edita entero: el caso de estudio y
los textos de interfaz. Normalizar esos dos daría ocho tablas más para no
consultar nunca por sus campos.

`src/db/consultas.ts` lo devuelve todo con la forma que ya tenían los
módulos de datos, así que las páginas no saben de dónde viene el texto.
Se cachea **por etiqueta**, no por tiempo: el contenido cambia cuando
alguien pulsa «guardar», no cada N minutos, y el panel invalida la caché
en ese momento exacto.

### Dos idiomas, rutas espejo

Cada página existe en los dos idiomas: `/proyectos` ↔ `/en/work`,
`/sobre-mi` ↔ `/en/about`. El español no lleva prefijo porque es el
público principal y su versión debe tener las URL limpias. El conmutador
te deja en la **misma** página del otro idioma, no en la portada.

Los cuerpos de página viven en `src/paginas/` y reciben el idioma; las
rutas de `src/app/` son archivos de cuatro líneas que fijan los metadatos.

### Sistema de diseño

Un solo eje de color: la escala `ink` es semántica, no literal —`ink-950`
es siempre el fondo y `ink-100` siempre el texto—, así que el tema oscuro
la invierte sin tocar una clase. Un solo acento. La tipografía carga el
peso: Inter Tight en versalitas contra Inter de texto.

La `<Escena>` invierte el tema de la página entera mientras el acto de
perfil ocupa el encuadre, reutilizando la paleta clara que ya existía
para el conmutador. Ese mismo gesto —relleno de tinta que sube y texto a
color papel— se repite a otras escalas en la banda de correo, las filas
de trayectoria y los canales de contacto.

### Panel de administración

`/admin`, protegido con contraseña scrypt en la base y cookie de sesión
firmada con HMAC. Edita perfil, resultados, trayectoria, proyectos,
competencias, metodología, formación, el caso de estudio, los textos de
interfaz, la paleta y las imágenes — **en los dos idiomas**.

El caso de estudio y los textos se editan como JSON validado: son
estructuras profundas y heterogéneas que se tocan una vez al año, y un
formulario campo a campo sería mucho andamiaje para poco uso.

### Imágenes

Se suben desde el panel, se guardan en Postgres y se sirven por
`/api/imagen/<clave>/<versión>`. La versión va en la ruta y no en un
`?v=` porque `next/image` rechaza las URL locales con query string; hace
falta porque la respuesta se cachea un año como inmutable.

Postgres no es el sitio ideal para binarios. Se eligió sobre un almacén
de objetos porque en Vercel el disco es de sólo lectura y montar Blob
significa otra cuenta para las cinco fotos de un portafolio. Si algún día
son veinte capturas, toca mover esto a Blob.

Cada proyecto admite dos capturas —escritorio y móvil— con claves
derivadas del slug, así que **un proyecto nuevo trae sus dos huecos
solo**. La maqueta las compone: la web de base y el móvil encima por un
costado, cada una recortada a su proporción para que cualquier original
encaje.

### Currículum

`/cv` y `/en/cv` se generan del mismo contenido, con el mismo sistema de
diseño y una hoja de impresión que lo conserva en papel. La clave es
`print-color-adjust: exact`: sin ella el navegador descarta los fondos y
el documento sale en blanco y negro.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run lint` | ESLint |
| `npm run db:local` | Postgres 17 en Docker |
| `npm run db:seed` | Crea el esquema y siembra los dos idiomas |

La semilla es **idempotente** y poda: la base queda exactamente como el
repositorio, incluido lo que se haya eliminado. Sirve para volver al
contenido de partida si el panel deja algo en mal estado — pero
sobrescribe lo editado desde el panel, así que conviene saberlo antes de
lanzarla contra producción.

---

## Despliegue

1. Provisiona Postgres (Supabase o Neon).
2. Crea el esquema y siembra con la conexión **directa**:
   `DATABASE_URL="<directa>" npm run db:seed`
3. En Vercel, configura las variables de `.env.example`. Para
   `DATABASE_URL` usa la cadena del **pooler**, no la directa.
4. Despliega.
