import data from "../data/casinos.json";

export type Provincia = (typeof data.provincias)[number];
export type Casino = {
  id: string;
  nombre: string;
  color: string;
  licencias: Record<string, string>;
};

export const TIPOS = {
  bienvenida: "Bienvenida",
  deposito: "Recarga",
  cashback: "Cashback",
  giros: "Giros gratis",
  torneo: "Torneo o sorteo",
  deportes: "Deportes",
  especial: "Bonos especiales",
} as const;
export type Tipo = keyof typeof TIPOS;

export type Promo = {
  id: string;
  casino: Casino;
  provincia: Provincia;
  tipo: Tipo;
  titulo: string;
  monto: string;
  condiciones: string;
  rollover: string;
  desde: string;
  hasta: string;
  link: string;
  dominio: string;
  verificada: string;
};

export const provincias: Provincia[] = data.provincias;
export const casinos: Casino[] = data.casinos;

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_AR = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

// Acepta 2026-09-25 o 25/9/2026 (como suele escribir fechas Google Sheets en español).
function normalizarFecha(v: string): string {
  const m = v.match(FECHA_AR);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : v;
}
const hoy = () => new Date().toISOString().slice(0, 10);

// Una oferta por archivo en src/data/promos/. El nombre del archivo es su id.
// El panel de /admin crea, edita y borra estos archivos con un commit en GitHub.
const archivos = import.meta.glob<Record<string, string>>("../data/promos/*.json", { eager: true, import: "default" });

// Convierte una oferta en una Promo, o devuelve el motivo por el que no sirve.
export function validarFila(fila: Record<string, string>): Promo | string {
  const f = Object.fromEntries(
    Object.entries(fila).map(([k, v]) => [k.trim().toLowerCase(), String(v ?? "").trim()]),
  );
  for (const campo of ["id", "casino", "provincia", "tipo", "titulo", "condiciones", "desde", "verificada"]) {
    if (!f[campo]) return `falta "${campo}"`;
  }
  const casino = casinos.find((c) => c.id === f.casino.toLowerCase());
  if (!casino) return `el casino "${f.casino}" no está en casinos.json`;
  const provincia = provincias.find((p) => p.id === f.provincia.toLowerCase());
  if (!provincia) return `la provincia "${f.provincia}" no existe`;
  const dominio = casino.licencias[provincia.id];
  if (!dominio) return `${casino.nombre} no tiene licencia en ${provincia.nombre}`;
  const tipo = f.tipo.toLowerCase();
  if (!(tipo in TIPOS)) return `el tipo "${f.tipo}" no existe (usá: ${Object.keys(TIPOS).join(", ")})`;
  for (const campo of ["desde", "hasta", "verificada"]) {
    if (f[campo]) f[campo] = normalizarFecha(f[campo]);
    if (f[campo] && !FECHA.test(f[campo])) return `"${campo}" tiene que ser una fecha como 25/09/2026`;
  }
  if (f.link && !/^https:\/\/[^/]+\.bet\.ar(\/|$)/.test(f.link)) return `el link tiene que ser de un sitio .bet.ar`;
  return {
    id: f.id,
    casino,
    provincia,
    tipo: tipo as Tipo,
    titulo: f.titulo,
    monto: f.monto ?? "",
    condiciones: f.condiciones,
    rollover: f.rollover ?? "",
    desde: f.desde,
    hasta: f.hasta ?? "",
    link: f.link || `https://${dominio}/`,
    dominio,
    verificada: f.verificada,
  };
}

let cache: Promo[] | undefined;

// Promos válidas y no vencidas. Las que tienen errores se saltean y se avisan en la consola del build.
export async function cargarPromos(): Promise<Promo[]> {
  cache ??= Object.entries(archivos).flatMap(([ruta, datos]) => {
    const id = ruta.split("/").pop()!.replace(/\.json$/, "");
    const r = validarFila({ ...datos, id });
    if (typeof r === "string") {
      console.warn(`[promos] ${id} salteada: ${r}`);
      return [];
    }
    return r.hasta && r.hasta < hoy() ? [] : [r];
  });
  return cache;
}
