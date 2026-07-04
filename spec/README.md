# Especificación flux — API 1.x (borrador)

**Estado: borrador previo a 1.0.** Mientras no exista el tag `v1.0.0`, la
especificación puede cambiar sin aviso. A partir de 1.0: dentro de la misma versión
mayor nada publicado se rompe (añadir es seguro; renombrar o quitar, no).

## Documentos

- [`manifest.md`](manifest.md) — el `manifest.json` de un complemento.
- [`flux.md`](flux.md) — superficie de servidor: hooks (actions y filters) y utilidades.
- [`flux-client.md`](flux-client.md) — superficie de navegador: paneles y toasts.
- [`hooks.md`](hooks.md) — catálogo de hooks sembrados (contrato).
- [`outlets.md`](outlets.md) — catálogo de posiciones visuales sembradas (contrato).

## Modelo de ejecución

Un complemento puede traer dos archivos de código, uno por mundo:

| Archivo | Dónde corre | Motor | Objeto puente |
|---|---|---|---|
| `main.js` | dentro del servidor FluxStock | intérprete JS embebido (~ES2017) | `flux` (global) |
| `client.js` | navegador de cada usuario | motor nativo del navegador (módulo ES) | recibido como argumento |

- `main.js` se ejecuta **una vez al arrancar** la aplicación: es la fase de registro.
  Sus callbacks corren cada vez que el núcleo dispara el hook correspondiente.
- `client.js` se importa al iniciar sesión y **exporta una función default** que
  recibe el puente de navegador.
- Los dos mundos **no se comunican directamente**: servidor y navegador se hablan por
  los canales normales de la aplicación.

## Reglas del entorno servidor (`main.js`)

- Un solo archivo autocontenido. Sin `require`/`import`, sin APIs de Node ni de
  navegador. Los únicos globales garantizados: `flux` y `console` (alias de `flux.log`).
- Los handlers corren de forma síncrona tras persistir la operación: deben ser
  rápidos. Un error o panic en un handler se registra y no afecta al núcleo.
- Se recomienda escribir en **TypeScript** y compilar a un único `main.js`
  (target ES2017) usando los tipos de [`types/`](../types/).
