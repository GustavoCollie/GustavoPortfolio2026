import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { esBackend } from "@/lib/superficie";

export default function robots(): MetadataRoute.Robots {
  /* El backend sirve las mismas páginas que el front bajo otra URL. Sin
     esto sería contenido duplicado compitiendo consigo mismo en Google,
     y el panel acabaría en los resultados de búsqueda. */
  if (esBackend) return { rules: [{ userAgent: "*", disallow: "/" }] };

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
