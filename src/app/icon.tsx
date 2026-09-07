import { ImageResponse } from "next/og";

/** Favicon. Hasta ahora el sitio llevaba el de Next.js por defecto. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
          borderRadius: 7,
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        GM
      </div>
    ),
    { ...size },
  );
}
