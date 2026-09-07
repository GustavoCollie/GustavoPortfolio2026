-- ─────────────────────────────────────────────────────────────
--  ESQUEMA
--
--  Criterio de diseño: se normaliza lo que se consulta por partes y
--  se guarda como JSONB lo que siempre se lee y se edita entero.
--
--  · Proyectos, experiencias, métricas, competencias, fases y
--    formación son LISTAS ordenadas de elementos homogéneos. Cada
--    uno es una fila: se pueden reordenar, activar y desactivar sin
--    reescribir el resto.
--  · El caso de estudio y los textos de interfaz son documentos
--    profundos que se editan de una pieza. Normalizarlos daría ocho
--    tablas más para no poder consultar nunca por sus campos.
--
--  Todo lleva `idioma`: las dos versiones del sitio son datos, no
--  código. La clave primaria compuesta (idioma, clave) impide que se
--  duplique un proyecto al sembrar dos veces.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS perfil (
  idioma          TEXT PRIMARY KEY CHECK (idioma IN ('es', 'en')),
  datos           JSONB NOT NULL,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS manifiesto (
  idioma          TEXT PRIMARY KEY CHECK (idioma IN ('es', 'en')),
  kicker          TEXT NOT NULL,
  texto           TEXT NOT NULL,
  cierre          TEXT NOT NULL,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metricas (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  clave           TEXT NOT NULL,
  orden           INT  NOT NULL,
  valor           INT  NOT NULL,
  prefijo         TEXT NOT NULL DEFAULT '',
  sufijo          TEXT NOT NULL DEFAULT '',
  titulo          TEXT NOT NULL,
  detalle         TEXT NOT NULL,
  PRIMARY KEY (idioma, clave)
);

CREATE TABLE IF NOT EXISTS experiencias (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  clave           TEXT NOT NULL,
  orden           INT  NOT NULL,
  empresa         TEXT NOT NULL,
  cargo           TEXT NOT NULL,
  periodo         TEXT NOT NULL,
  desde           TEXT NOT NULL,
  hasta           TEXT NOT NULL,
  sector          TEXT NOT NULL,
  modalidad       TEXT,
  resumen         TEXT NOT NULL,
  logros          TEXT[] NOT NULL,
  stack           TEXT[] NOT NULL,
  PRIMARY KEY (idioma, clave)
);

CREATE TABLE IF NOT EXISTS proyectos (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  slug            TEXT NOT NULL,
  orden           INT  NOT NULL,
  nombre          TEXT NOT NULL,
  tagline         TEXT NOT NULL,
  categoria       TEXT NOT NULL,
  plataformas     TEXT[] NOT NULL,
  anio            TEXT NOT NULL,
  rol             TEXT NOT NULL,
  problema        TEXT NOT NULL,
  solucion        TEXT NOT NULL,
  impacto         TEXT[] NOT NULL,
  stack           TEXT[] NOT NULL,
  proceso         TEXT[] NOT NULL,
  destacado       BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (idioma, slug)
);

CREATE TABLE IF NOT EXISTS competencias (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  clave           TEXT NOT NULL,
  orden           INT  NOT NULL,
  grupo           TEXT NOT NULL,
  icono           TEXT NOT NULL,
  claim           TEXT NOT NULL,
  detalle         TEXT NOT NULL,
  items           TEXT[] NOT NULL,
  PRIMARY KEY (idioma, clave)
);

CREATE TABLE IF NOT EXISTS metodologia (
  idioma          TEXT PRIMARY KEY CHECK (idioma IN ('es', 'en')),
  kicker          TEXT NOT NULL,
  titulo          TEXT NOT NULL,
  intro           TEXT NOT NULL,
  fases           JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS educacion (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  clave           TEXT NOT NULL,
  orden           INT  NOT NULL,
  titulo          TEXT NOT NULL,
  institucion     TEXT NOT NULL,
  anio            TEXT NOT NULL,
  tipo            TEXT NOT NULL,
  PRIMARY KEY (idioma, clave)
);

CREATE TABLE IF NOT EXISTS idiomas_hablados (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  clave           TEXT NOT NULL,
  orden           INT  NOT NULL,
  nombre          TEXT NOT NULL,
  nivel           TEXT NOT NULL,
  pct             INT  NOT NULL CHECK (pct BETWEEN 0 AND 100),
  PRIMARY KEY (idioma, clave)
);

CREATE TABLE IF NOT EXISTS caso_estudio (
  idioma          TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  slug            TEXT NOT NULL,
  datos           JSONB NOT NULL,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (idioma, slug)
);

CREATE TABLE IF NOT EXISTS textos_ui (
  idioma          TEXT PRIMARY KEY CHECK (idioma IN ('es', 'en')),
  datos           JSONB NOT NULL,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paleta (
  tema            TEXT PRIMARY KEY CHECK (tema IN ('light', 'dark')),
  datos           JSONB NOT NULL,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Mensajes del formulario ──────────────────────────────────
-- Hoy el formulario sólo manda un correo: si Resend falla o el
-- mensaje se traspapela, no queda rastro. Guardarlos es la razón
-- práctica por la que una base de datos vale la pena aquí.
CREATE TABLE IF NOT EXISTS mensajes (
  id              BIGSERIAL PRIMARY KEY,
  recibido_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  nombre          TEXT NOT NULL,
  email           TEXT NOT NULL,
  empresa         TEXT,
  interes         TEXT,
  mensaje         TEXT NOT NULL,
  leido           BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS mensajes_recibido_idx
  ON mensajes (recibido_en DESC);

-- ── Acceso al panel ──────────────────────────────────────────
-- Una sola fila. La contraseña se guarda como scrypt (sal + hash),
-- nunca en claro: quien pueda leer la base no puede entrar al panel.
CREATE TABLE IF NOT EXISTS admin (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hash            TEXT NOT NULL,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Imágenes ─────────────────────────────────────────────────
-- Los bytes viven en la base y se sirven por `/api/imagen/[clave]`.
--
-- Por qué aquí y no en un almacén de objetos: en Vercel el disco es de
-- sólo lectura, así que escribir en `public/` no es opción, y montar
-- Blob significa otra cuenta y otra credencial para las cuatro o cinco
-- fotos que tiene un portafolio. Postgres no es el sitio ideal para
-- binarios —si algún día hay que subir veinte capturas de proyecto,
-- toca mover esto a Blob— pero para este tamaño evita una dependencia
-- entera.
--
-- Las filas son OPCIONALES: sin fila, la página usa el archivo de
-- `public/` que declara `content.ts`. Subir una foto es sustituir, no
-- estrenar.
CREATE TABLE IF NOT EXISTS imagenes (
  clave           TEXT PRIMARY KEY,
  mime            TEXT NOT NULL,
  bytes           BYTEA NOT NULL,
  alt             TEXT NOT NULL DEFAULT '',
  pie             TEXT NOT NULL DEFAULT '',
  foco            TEXT NOT NULL DEFAULT '50% 50%',
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);
