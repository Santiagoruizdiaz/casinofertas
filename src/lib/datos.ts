import Papa from "papaparse";
import data from "../data/casinos.json";
import ejemplo from "../data/promos-ejemplo.csv?raw";

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

async function leerCsv(): Promise<string> {
  const url = import.meta.env.PROMOS_CSV_URL ?? process.env.PROMOS_CSV_URL;
  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No pude leer la planilla (${res.status}): ${url}`);
    return res.text();
  }
  return ejemplo;
}

// Convierte una fila de la planilla en una Promo, o devuelve el motivo por el que no sirve.
export function validarFila(fila: Record<string, string>): Promo | string {
  const f = Object.fromEntries(
    Object.entries(fila).map(([k, v]) => [k.trim().toLowerCase(), (v ?? "").trim()]),
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

let cache: Promise<Promo[]> | undefined;

// Promos válidas y no vencidas. Las filas con errores se saltean y se avisan en la consola del build.
export function cargarPromos(): Promise<Promo[]> {
  cache ??= (async () => {
    const { data: filas } = Papa.parse<Record<string, string>>(await leerCsv(), {
      header: true,
      skipEmptyLines: "greedy",
    });
    const promos: Promo[] = [];
    const ids = new Set<string>();
    filas.forEach((fila, i) => {
      const r = validarFila(fila);
      if (typeof r === "string") return console.warn(`[promos] fila ${i + 2} salteada: ${r}`);
      if (ids.has(r.id)) return console.warn(`[promos] fila ${i + 2} salteada: id "${r.id}" repetido`);
      ids.add(r.id);
      if (r.hasta && r.hasta < hoy()) return;
      promos.push(r);
    });
    return promos;
  })();
  return cache;
}
