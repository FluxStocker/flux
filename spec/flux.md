# `flux` — superficie de servidor

Objeto global disponible en `main.js`. Es la **única** puerta del complemento hacia
FluxStock: todo lo que no esté aquí, no existe para el complemento.

## Ciclo de vida: registro vs ejecución

Un complemento de servidor vive en **dos fases** — entenderlas evita el 90% de las
confusiones:

1. **Fase de REGISTRO** — el cuerpo de `main.js` corre **una sola vez**, cuando
   FluxStock carga el complemento: al arrancar la app, al habilitarlo desde
   Complementos, o en el hot reload cuando `main.js` cambia en disco. Aquí el
   complemento se **presenta**: escribe un log y registra sus callbacks
   (`onFilter`, `onAction`, `onData`). Nada de negocio ocurre todavía.
2. **Fase de EJECUCIÓN** — cada callback registrado corre **cada vez** que su
   disparador ocurre. Cada uno tiene un disparador distinto (ver cada sección).

Línea de tiempo de una venta, con los tres callbacks situados:

```
main.js carga            → flux.log('cargado')  +  se registran los callbacks   (1 vez)
─────────────────────────────────────────────────────────────────────────────────────
cajero confirma venta    → core suma líneas
                         → FILTER  sale.total   → tu handler AJUSTA el total    (antes de persistir)
                         → core valida pago y persiste la venta
                         → ACTION  sale.confirmed → tu handler REACCIONA        (después de persistir)
─────────────────────────────────────────────────────────────────────────────────────
un panel pide datos      → DATA    tu proveedor responde                        (a demanda del navegador)
```

Orden de referencia de la superficie: `log` → `onFilter` → `onAction` → `onData` →
`flux.db.*` → `flux.notify`.

## `flux.plugin`

Identidad del propio complemento: `{ name: string, version: string }`. Disponible
siempre (registro y callbacks).

## `flux.log(...args)`

**Cuándo corre:** inmediatamente, cada vez que la llamas — en el cuerpo (fase de
registro) o dentro de cualquier callback.

Escribe en el log de la aplicación con el prefijo `[plugin:<name>]`. `console.log`,
`console.warn` y `console.error` son alias. Es tu herramienta de diagnóstico: el
primer `flux.log('cargado')` del cuerpo confirma que el complemento cargó.

## `flux.onFilter(nombre, handler)`

**La llamada registra** (fase de registro). **El handler corre** cada vez que el
núcleo llega al punto sembrado, **ANTES de validar/persistir** la operación — por
eso puede **modificar el valor**.

El handler recibe `(valor, contexto)` y debe devolver el valor resultante (o el
recibido, si no aplica). Lo que devuelvas **es el valor real** con el que sigue la
operación.

```js
// sale.total: corre en cada venta, tras sumar las líneas y ANTES de validar el
// pago y guardar. Lo que devuelvas es lo que se cobra.
flux.onFilter('sale.total', function (total, ctx) {
  if (ctx.lines >= 5) return total * 0.9 // 10% de descuento desde 5 líneas
  return total
})
```

- Devolver `undefined`/`null` deja el valor intacto.
- Devolver un tipo incompatible con el valor original descarta el resultado (queda
  registrado en el log) — un plugin mal escrito no corrompe un total.
- Varios complementos se encadenan por prioridad: cada uno recibe el resultado del
  anterior (el core primero, los complementos después).
- Corre síncrono dentro del request de la operación: handler **rápido**.

## `flux.onAction(nombre, handler)`

**La llamada registra** (fase de registro). **El handler corre** cada vez que el
evento ocurre, **DESPUÉS de que la operación fue persistida** — por eso solo
**reacciona**: recibe el payload y no devuelve nada, no puede alterar el flujo.

```js
// sale.confirmed: corre en cada venta, con la venta YA guardada.
flux.onAction('sale.confirmed', function (payload) {
  flux.log('venta #' + payload.sale_id + ' por ' + payload.total)
})
```

- Filter y action del mismo flujo se complementan: `sale.total` (antes, modifica) →
  `sale.confirmed` (después, reacciona).
- Un error/panic en el handler se loguea y no afecta la operación (ya está guardada).

## `flux.onData(handler)`

**La llamada registra** el proveedor de datos (fase de registro; un complemento, un
proveedor — el último registro vale). **El handler corre** cada vez que el navegador
lo pide: `flux.client.data(params?)` en el `client.js`
([`flux-client.md`](flux-client.md)) hace `fetch` a `/plugins/<nombre>/data` y eso
ejecuta tu proveedor. Es el canal server→client.

Contexto que recibe el handler:

- `ctx.user` — usuario de la sesión que pidió (`{ id, name, email, roles,
  permissions, … }`).
- `ctx.params` — los `params` que pasó `flux.client.data(params)` (**strings**:
  viajan como query string). Las fachadas `flux.db.*.list()` aceptan
  `limit`/`offset` como string, así que se reenvían tal cual — es el canal para que
  un panel pida datos **paginados** o filtrados.

```js
flux.onData(function (ctx) {
  // requiere el scope adecuado en el manifest para leer del core
  return flux.db.products.list({
    limit: ctx.params.limit,
    offset: ctx.params.offset,
  })
})
```

- Devuelve un valor JSON-able; el navegador lo recibe como `data`.
- Corre en la VM del plugin, serializado con su candado: handler rápido.

## `flux.db.*` — datos de dominio (por scope)

**Cuándo corre:** inmediatamente, cada vez que la llamas — en el cuerpo o dentro de
cualquier callback. Son lecturas síncronas contra el core.

Bajo `flux.db` viven las fachadas de DATOS, gateadas por los `permissions` del
manifest: solo se montan los scopes declarados (sin el scope, la propiedad **no
existe** — `flux.db.products` es `undefined` sin `products.read`). Todas las
colecciones comparten forma: `list(opts)` → `{ data, total }` paginado y `get(id)`;
`flux.db.settings` es key-value fijo (`all()` / `get(key)`), sin paginar. Catálogo
completo con firmas y DTOs en [`scopes.md`](scopes.md).

```js
// requiere "products.read" en el manifest
var page = flux.db.products.list({ search: 'café', limit: 10 })
flux.log(page.total + ' resultados')
```

## `flux.notify(userId, título, cuerpo?, url?)` — capacidad (por scope)

**Cuándo corre:** inmediatamente, cada vez que la llamas — normalmente dentro de un
`onAction` (reaccionar a un evento avisando a alguien).

Envía una notificación (campana + push en vivo) al usuario. Requiere el scope
`notify`. La notificación llega con tipo `plugin.<nombre>`: el receptor siempre sabe
qué complemento le habla. `url` debe ser ruta interna (`/...`).

```js
flux.onAction('sale.confirmed', function (payload) {
  flux.notify(payload.user_id, 'Venta registrada', 'Total: ' + payload.total, '/sales')
})
```

## Catálogos

Los nombres válidos de actions y filters, con sus payloads y su momento exacto de
disparo, están en [`hooks.md`](hooks.md). Usar un nombre que no existe no es un
error: el handler simplemente no se dispara nunca (el punto puede sembrarse en una
versión futura).

## En preparación (no usar todavía)

- `flux.http.*` — cliente HTTP saliente.
- `flux.config.*` — configuración propia del complemento (no confundir con
  `flux.db.settings`, la configuración del negocio).
- `flux.route(...)` — rutas HTTP propias.
