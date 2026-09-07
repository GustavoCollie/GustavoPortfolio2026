import { ImageResponse } from "next/og";
import { perfil } from "@/data/content";

/**
 * Imagen de previsualización para LinkedIn, WhatsApp, Slack y Twitter.
 * Sin ella, cualquier enlace compartido sale como una tarjeta vacía.
 *
 * Se genera en tiempo de build. Satori (el motor) sólo entiende un
 * subconjunto de CSS: todo contenedor con más de un hijo necesita
 * `display: flex` explícito y no admite `background-clip: text`.
 */
export const alt = `${perfil.nombreCorto} — ${perfil.rol}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#06070a",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Luz volumétrica, el mismo recurso que el hero */}
        <div
          style={{
            position: "absolute",
            top: -280,
            left: 240,
            width: 900,
            height: 900,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(76,141,255,0.22) 0%, rgba(76,141,255,0) 68%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -320,
            right: -160,
            width: 760,
            height: 760,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0) 68%)",
            display: "flex",
          }}
        />

        {/* Cabecera: monograma + nombre */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#0f1218",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4c8dff",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            GM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#e6eaf0", fontSize: 26, fontWeight: 600 }}>
              {perfil.nombreCorto}
            </div>
            <div
              style={{
                color: "#6a7488",
                fontSize: 15,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {perfil.rol}
            </div>
          </div>
        </div>

        {/* Titular */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#f2f5f9",
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.02,
            }}
          >
            Estrategia que se
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div
              style={{
                color: "#4c8dff",
                fontSize: 82,
                fontWeight: 700,
                letterSpacing: -3,
                lineHeight: 1.02,
              }}
            >
              ejecuta
            </div>
            <div
              style={{
                color: "#f2f5f9",
                fontSize: 82,
                fontWeight: 700,
                letterSpacing: -3,
                lineHeight: 1.02,
              }}
            >
              en producto.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#96a0b3",
              fontSize: 25,
              lineHeight: 1.45,
              marginTop: 26,
              maxWidth: 880,
            }}
          >
            {perfil.subtitular}
          </div>
        </div>

        {/* Pie: capacidades y ubicación */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {["Scrum", "Power BI", "Android · iOS · Web"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  color: "#96a0b3",
                  fontSize: 17,
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              color: "#6a7488",
              fontSize: 17,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {perfil.ubicacion}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
