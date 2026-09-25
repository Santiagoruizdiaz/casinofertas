# Casinofertas

Promociones de los casinos online legales de Argentina, filtradas por provincia. Solo lista sitios `.bet.ar` con licencia provincial.

Sitio estático hecho con [Astro](https://astro.build). Las promos se editan desde el panel en `/admin` y se guardan en `src/data/promos/`; las provincias, los casinos y sus licencias viven en `src/data/casinos.json`.

## Panel de ofertas (`/admin`)

En `/admin/` se entra con la cuenta de GitHub (solo pueden quienes tienen permiso de escritura en este repo). Desde ahí se agregan, editan y borran ofertas. Cada cambio guardado es un commit en `main` y Netlify vuelve a publicar el sitio solo en un par de minutos.

El panel es [Decap CMS](https://decapcms.org). Cada oferta es un archivo JSON en `src/data/promos/`, y el nombre del archivo es su `id`. Antes de guardar, el panel avisa si el casino no tiene licencia en la provincia elegida.

### Activar el login (una sola vez)

1. En GitHub: Settings > Developer settings > OAuth Apps > New OAuth App. *Homepage URL*: `https://benevolent-meringue-c9fd77.netlify.app`. *Authorization callback URL*: `https://api.netlify.com/auth/done`. Guardá el *Client ID* y generá un *Client secret*.
2. En Netlify: Project configuration > Access & security > OAuth > Install provider > GitHub, y pegá los dos valores.

### Probarlo en la compu

```sh
npm run dev          # en una terminal
npx decap-server     # en otra
```

Abrí `http://localhost:4321/admin/`: el panel usa los archivos locales en vez de GitHub.

## Campos de cada oferta

| Campo | Obligatorio | Ejemplo | Notas |
| --- | --- | --- | --- |
| `id` | sí | `bplay-cashback-pba` | Es el nombre del archivo. El panel lo arma solo con casino, título y provincia. |
| `casino` | sí | `bplay` | El `id` del casino en `casinos.json`. |
| `provincia` | sí | `pba` | Código de la provincia en `casinos.json` (por ejemplo `caba`, `pba`, `mza`). El casino tiene que tener licencia ahí. |
| `tipo` | sí | `cashback` | `bienvenida`, `deposito`, `cashback`, `giros`, `torneo`, `deportes` o `especial` (cumpleaños y otros bonos puntuales). |
| `titulo` | sí | `Viernes de cashback` | Lo que se lee grande en la tarjeta. |
| `monto` | no | `Hasta $10.000` | Texto libre. |
| `condiciones` | sí | `Apostá $10.000 el viernes…` | Una o dos frases. |
| `rollover` | no | `x1` | Requisito de apuesta. `x0` si no tiene; vacío si no se sabe. |
| `desde` | sí | `01/06/2026` | Fecha de inicio. Acepta `01/06/2026` o `2026-06-01`. |
| `hasta` | no | `01/06/2027` | Vencimiento. Pasada la fecha, la promo se oculta sola. |
| `link` | no | `https://pba.bplay.bet.ar/promociones` | Tiene que ser `.bet.ar`. Si falta, se usa el dominio del casino. |
| `verificada` | sí | `2026-09-24` | Última vez que la revisaste. Se muestra en la tarjeta. Si está vacía, la oferta no aparece en el sitio. |

Si una oferta tiene un error (casino que no existe, casino sin licencia en esa provincia, fecha mal escrita), el sitio la saltea y el log del build dice cuál y por qué.

## Actualización

- El sitio se vuelve a publicar todos los días a las 6:00, para sacar las promos vencidas (`.github/workflows/rebuild-diario.yml`). Necesita un *build hook* de Netlify guardado como secret `NETLIFY_BUILD_HOOK` en GitHub.
- Para publicar al instante: Netlify > Deploys > Trigger deploy, o GitHub > Actions > Rebuild diario > Run workflow.
- Entre publicaciones, la página oculta sola las promos que vencieron y marca las que vencen en los próximos 7 días.

## Provincias y casinos

`src/data/casinos.json` tiene las 24 jurisdicciones (23 provincias más CABA) y cada casino con su dominio `.bet.ar` por provincia.

- Licencias verificadas contra listas oficiales o comunicados del regulador en todas las provincias con juego online. Donde no hay lista pública (Córdoba, Santa Fe, Jujuy, Santiago del Estero, Chaco, Formosa, Corrientes, Neuquén), la fuente es la prensa o el selector de provincias de la propia marca.
- San Juan y Tucumán están en proceso (`"en-proceso"`).

## Desarrollo

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # genera dist/
```
