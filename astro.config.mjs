import { defineConfig } from "astro/config";

// Dominio público del sitio. Sale en los canonical, el sitemap y las vistas previas al compartir.
// Para cambiarlo, editá esta línea o definí SITE_URL en Netlify.
const SITE_URL = process.env.SITE_URL || "https://casinofertas.com";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
});
