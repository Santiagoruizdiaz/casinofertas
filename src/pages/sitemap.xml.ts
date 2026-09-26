import type { APIRoute } from "astro";
import { provincias } from "../lib/datos";

// Todas las páginas públicas. /admin queda afuera a propósito.
export const GET: APIRoute = ({ site }) => {
  const hoy = new Date().toISOString().slice(0, 10);
  const paginas = [
    { ruta: "/", prioridad: "1.0" },
    ...provincias.map((p) => ({ ruta: `/${p.id}/`, prioridad: p.estado === "sin-regulacion" ? "0.4" : "0.8" })),
    { ruta: "/casinos/", prioridad: "0.7" },
    { ruta: "/juego-responsable/", prioridad: "0.5" },
  ];
  const urls = paginas
    .map((p) => `  <url><loc>${new URL(p.ruta, site)}</loc><lastmod>${hoy}</lastmod><priority>${p.prioridad}</priority></url>`)
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
