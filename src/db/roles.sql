-- ─────────────────────────────────────────────────────────────
--  ROL DE SÓLO LECTURA PARA EL FRONT
--
--  El sitio público no edita nada: lee el contenido y, como mucho,
--  deja un mensaje del formulario de contacto. No hay ninguna razón
--  para que se despliegue con credenciales capaces de borrar la base.
--
--  Este rol puede:
--    · LEER el contenido de las páginas.
--    · INSERTAR en «mensajes» — y nada más: no puede leerlos de vuelta,
--      así que una lectura no autorizada en el front no expone lo que
--      han escrito otras personas.
--
--  Este rol NO puede:
--    · Tocar «admin», donde vive el hash de la contraseña del panel.
--    · Escribir contenido. Eso es exclusivo del backend.
--
--  Se ejecuta UNA VEZ, con la conexión DIRECTA y el rol postgres:
--
--    psql "<cadena directa>" -v clave="'una-clave-larga'" -f src/db/roles.sql
--
--  o pegándolo en el editor SQL de Supabase tras sustituir :clave.
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portafolio_lector') THEN
    CREATE ROLE portafolio_lector LOGIN;
  END IF;
END
$$;

ALTER ROLE portafolio_lector WITH PASSWORD :clave;

GRANT CONNECT ON DATABASE postgres TO portafolio_lector;
GRANT USAGE   ON SCHEMA public     TO portafolio_lector;

-- Lectura de todo el contenido de páginas.
GRANT SELECT ON
  perfil, manifiesto, metricas, experiencias, proyectos, competencias,
  metodologia, educacion, idiomas_hablados, caso_estudio, textos_ui,
  paleta, imagenes
TO portafolio_lector;

-- El formulario de contacto: entra, no sale.
--
-- Ojo con `INSERT ... RETURNING`: devolver una columna es leerla, y sin
-- SELECT Postgres rechaza la sentencia entera. El INSERT del formulario
-- no devuelve nada a propósito; si algún día hace falta el id, hay que
-- decidir si se concede SELECT (y entonces el front puede leer todos los
-- mensajes) o se busca otra forma.
GRANT INSERT ON mensajes TO portafolio_lector;
GRANT USAGE  ON SEQUENCE mensajes_id_seq TO portafolio_lector;

-- «admin» queda fuera a propósito. No aparece en ningún GRANT.

-- Las tablas que se creen después heredan el mismo criterio: leer sí,
-- escribir no. Sin esto, añadir una tabla al esquema dejaría al front
-- sin acceso y la página en blanco hasta que alguien recordara volver
-- aquí.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO portafolio_lector;
