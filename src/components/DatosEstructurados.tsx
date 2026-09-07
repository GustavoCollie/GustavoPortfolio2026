import {
  competencias,
  educacion,
  experiencias,
  perfil,
  proyectos,
} from "@/data/content";
import { SITE_URL } from "@/lib/site";

/**
 * JSON-LD (schema.org).
 *
 * Es lo que permite que Google entienda que esto es la ficha de una persona
 * —con su puesto, su empleador y sus habilidades— en vez de una página
 * cualquiera. Sin esto el sitio compite sólo por texto plano.
 *
 * Se renderiza en el servidor: no añade JavaScript al cliente.
 */
export default function DatosEstructurados() {
  const actual = experiencias[0];

  const persona = {
    "@type": "Person",
    "@id": `${SITE_URL}/#persona`,
    name: `${perfil.nombre} ${perfil.apellidos}`,
    alternateName: perfil.nombreCorto,
    jobTitle: actual.cargo,
    description: perfil.subtitular,
    email: `mailto:${perfil.email}`,
    telephone: perfil.telefonoRaw,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    sameAs: [perfil.linkedin],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ica",
      addressCountry: "PE",
    },
    worksFor: {
      "@type": "Organization",
      name: actual.empresa,
    },
    alumniOf: educacion.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institucion,
    })),
    knowsAbout: competencias.flatMap((g) => g.items),
    knowsLanguage: [
      { "@type": "Language", name: "Spanish", alternateName: "es" },
      { "@type": "Language", name: "English", alternateName: "en" },
    ],
    hasOccupation: experiencias.map((e) => ({
      "@type": "Occupation",
      name: e.cargo,
      occupationLocation: { "@type": "Country", name: "Perú" },
      description: e.resumen,
    })),
  };

  const sitio = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#sitio`,
    url: SITE_URL,
    name: `${perfil.nombreCorto} — ${perfil.rol}`,
    inLanguage: "es-PE",
    author: { "@id": `${SITE_URL}/#persona` },
    publisher: { "@id": `${SITE_URL}/#persona` },
  };

  const trabajos = proyectos.map((p) => ({
    "@type": "CreativeWork",
    name: p.nombre,
    description: p.tagline,
    url: `${SITE_URL}/proyectos#${p.slug}`,
    creator: { "@id": `${SITE_URL}/#persona` },
    dateCreated: p.anio,
    keywords: p.stack.join(", "),
  }));

  const grafo = {
    "@context": "https://schema.org",
    "@graph": [persona, sitio, ...trabajos],
  };

  return (
    <script
      type="application/ld+json"
      // El contenido es nuestro y no lleva entrada de usuario, pero se
      // escapa `<` igualmente para que nada pueda cerrar la etiqueta.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(grafo).replace(/</g, "\\u003c"),
      }}
    />
  );
}
