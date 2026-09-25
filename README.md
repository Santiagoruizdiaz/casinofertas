# Casinofertas

Promociones de los casinos online legales de Argentina, filtradas por provincia. Solo lista sitios `.bet.ar` con licencia provincial.

Sitio estático hecho con [Astro](https://astro.build). Las promos se cargan en una planilla de Google; las provincias, los casinos y sus licencias viven en `src/data/casinos.json`.

## Cómo cargar promos

Una fila por promo en la planilla, con estas columnas (con estos nombres en la primera fila):

| Columna | Obligatoria | Ejemplo | Notas |
| --- | --- | --- | --- |
| `id` | sí | `bplay-cashback-pba` | Único. Casino, promo y provincia, sin espacios. |
| `casino` | sí | `bplay` | El `id` del casino en `casinos.json`. |
| `provincia` | sí | `pba` | Código de la provincia en `casinos.json` (por ejemplo `caba`, `pba`, `mza`). El casino tiene que tener licencia ahí. |
| `tipo` | sí | `cashback` | `bienvenida`, `deposito`, `cashback`, `giros`, `torneo` o `deportes`. |
| `titulo` | sí | `Viernes de cashback` | Lo que se lee grande en la tarjeta. |
| `monto` | no | `Hasta $10.000` | Texto libre. |
| `condiciones` | sí | `Apostá $10.000 el viernes…` | Una o dos frases. |
| `rollover` | no | `x1` | Requisito de apuesta. `x0` si no tiene; vacío si no se sabe. |
| `desde` | sí | `01/06/2026` | Fecha de inicio. Acepta `01/06/2026` o `2026-06-01`. |
| `hasta` | no | `01/06/2027` | Vencimiento. Pasada la fecha, la promo se oculta sola. |
| `link` | no | `https://pba.bplay.bet.ar/promociones` | Tiene que ser `.bet.ar`. Si falta, se usa el dominio del casino. |
| `verificada` | sí | `24/09/2026` | Última vez que la revisaste. Se muestra en la tarjeta. |

Hay un ejemplo completo en `src/data/promos-ejemplo.csv`: se puede importar en Google Sheets (Archivo > Importar) para arrancar.

Si una fila tiene un error (casino que no existe, casino sin licencia en esa provincia, fecha mal escrita), el sitio la saltea y el log del build dice qué fila y por qué.

## Conectar la planilla

1. En Google Sheets: Archivo > Compartir > Publicar en la web > elegí la hoja > formato CSV > Publicar. Copiá el link.
2. En Netlify: Site configuration > Environment variables > `PROMOS_CSV_URL` = ese link.
3. Sin esa variable, el sitio usa `src/data/promos-ejemplo.csv`.

## Actualización

- El sitio se vuelve a publicar todos los días a las 6:00 (`.github/workflows/rebuild-diario.yml`). Necesita un *build hook* de Netlify guardado como secret `NETLIFY_BUILD_HOOK` en GitHub.
- Para publicar al instante: Netlify > Deploys > Trigger deploy, o GitHub > Actions > Rebuild diario > Run workflow.
- Entre publicaciones, la página oculta sola las promos que vencieron y marca las que vencen en los próximos 7 días.

## Provincias y casinos

`src/data/casinos.json` tiene las 24 jurisdicciones (23 provincias más CABA) y cada casino con su dominio `.bet.ar` por provincia.

- Licencias verificadas contra listas oficiales: CABA, Provincia de Buenos Aires, Mendoza, Córdoba (parcial) y La Rioja. El resto se completa a medida que se revisan.
- Salta, Santiago del Estero y Tierra del Fuego no tienen juego online regulado (`"estado": "sin-regulacion"`); San Juan está en proceso (`"en-proceso"`).

## Desarrollo

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # genera dist/
```
