# Especificación flux — API 1.x (borrador)

**Estado: borrador previo a 1.0.** Mientras no exista el tag `v1.0.0`, la
especificación puede cambiar sin aviso. A partir de 1.0: dentro de la misma versión
mayor nada publicado se rompe (añadir es seguro; renombrar o quitar, no).

## Documentos

- [`manifest.md`](manifest.md) — el `manifest.json` de un complemento.
- [`flux.md`](flux.md) — superficie de servidor y su ciclo de vida, en orden:
  `log` → `onFilter` → `onAction` → `onData` → `db` → `notify`.
- [`flux-client.md`](flux-client.md) — superficie de navegador: paneles, vistas,
  datos y navegación.
- [`hooks.md`](hooks.md) — catálogo de hooks sembrados (contrato).
- [`scopes.md`](scopes.md) — catálogo de scopes de dominio: `flux.db.*` y `notify`
  (contrato).
- [`outlets.md`](outlets.md) — catálogo de posiciones visuales sembradas (contrato).

## Modelo de ejecución

Un complemento puede traer dos archivos de código, uno por mundo:

| Archivo (estructura actual) | Dónde corre | Motor | Objeto puente |
|---|---|---|---|
| `dist/server.js` (entrada `main` del manifest) | dentro del servidor FluxStock | intérprete JS embebido (~ES2017) | `flux` (global) |
| `dist/client.js` (entrada `client` del manifest) | navegador de cada usuario | motor nativo del navegador (módulo ES) | recibido como argumento |

Las rutas concretas las declara el manifest; la fuente vive en `src/` y **todo
compilado sale a `dist/`** ([`manifest.md`](manifest.md)).

- El **main** se ejecuta **una vez al cargar** el complemento (arranque de la app,
  habilitarlo, o hot reload cuando el compilado cambia en disco — `npm run build`):
  es la fase de registro. Sus callbacks corren cada vez que el núcleo dispara el
  hook correspondiente.
- El **client** se importa al iniciar sesión y **exporta una función default** que
  recibe el puente de navegador.
- Los dos mundos **no se comunican directamente**: servidor y navegador se hablan por
  los canales normales de la aplicación.

## Reglas del entorno servidor (el `main`)

- Un solo archivo autocontenido. Sin `require`/`import`, sin APIs de Node ni de
  navegador. Los únicos globales garantizados: `flux` y `console` (alias de `flux.log`).
- Los handlers corren de forma síncrona dentro del request de la operación — los
  filters **antes** de validar/persistir (modifican el valor), las actions
  **después** de persistir (reaccionan): deben ser rápidos. Un error o panic en un
  handler se registra y no afecta al núcleo.
- Se escribe en **TypeScript** (`src/js/server/server.ts`) y se compila a un único
  `dist/server.js` (target ES2017) usando los tipos de [`types/`](../types/).
