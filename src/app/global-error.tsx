"use client";

/**
 * Último recinto: se activa si falla el propio layout raíz, así que no
 * puede apoyarse en él. Lleva su propio <html> y estilos en línea.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "0 8vw",
          background: "#06070a",
          color: "#e6eaf0",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#fb7185",
          }}
        >
          Error crítico
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem,6vw,4rem)", fontWeight: 400 }}>
          El sitio no pudo cargar
        </h1>
        <p style={{ margin: 0, maxWidth: 460, lineHeight: 1.6, color: "#96a0b3" }}>
          Recarga la página. Si el problema persiste, escríbeme a
          gustavosmarquezmedina@gmail.com.
        </p>
        {error.digest && (
          <p style={{ margin: 0, fontSize: 12, color: "#6a7488" }}>
            Referencia: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            alignSelf: "flex-start",
            border: 0,
            borderRadius: 999,
            padding: "14px 28px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            background: "#e6eaf0",
            color: "#06070a",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
