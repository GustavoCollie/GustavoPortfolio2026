import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El proyecto vive dentro de una carpeta con un package-lock.json superior;
  // fijamos la raíz para que Turbopack no la tome por error.
  turbopack: { root: __dirname },
};

export default nextConfig;
