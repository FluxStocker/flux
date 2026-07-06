# `flux` — superficie de servidor

Objeto global disponible en `main.js`. Es la **única** puerta del complemento hacia
FluxStock: todo lo que no esté aquí, no existe para el complemento.

## `flux.plugin`

Identidad del propio complemento: `{ name: string, version: string }`.

## `flux.log(...args)`

Escribe en el log de la aplicación con el prefijo `[plugin:<name>]`. `console.log`,
`console.warn` y `console.error` son alias.

## `flux.onAction(nombre, handler)`

Registra un handler para una **action** — un aviso de que algo ocurrió. El handler
recibe el payload del evento y no devuelve nada; no puede alterar el flujo.

```js
flux.onAction('sale.confirmed', function (payload) {
  flux.log('venta #' + payload.sale_id)
})
```

- Los handlers corren después de que la operación fue persistida.
- Orden: el núcleo primero, los complementos después.

## `flux.onFilter(nombre, handler)`

Registra un handler para un **filter** — un punto donde el complemento puede
**modificar un valor** del flujo. El handler recibe `(valor, contexto)` y debe
devolver el valor resultante (o el recibido, si no aplica).

```js
flux.onFilter('sale.total', function (total, ctx) {
  return total * 0.9 // 10% de descuento
})
```

- Devolver `undefined`/`null` deja el valor intacto.
- Devolver un tipo incompatible con el valor original descarta el resultado (queda
  registrado en el log).
- Varios complementos se encadenan: cada uno recibe el resultado del anterior.

## `flux.onData(handler)`

Registra el **proveedor de datos** para el `client.js` del complemento — el canal
server→client. El handler recibe un contexto (`{ user }` con el usuario de la sesión)
y devuelve un valor JSON-able. El navegador lo obtiene con `flux.client.data()`
([`flux-client.md`](flux-client.md)), que hace `fetch` a `/plugins/<nombre>/data`.

```js
flux.onData(function (ctx) {
  // requiere el scope adecuado en el manifest para leer del core
  return { saludo: 'hola ' + ctx.user.name }
})
```

- Un complemento, un proveedor (el último registro vale).
- Corre en la VM del plugin, serializado con su candado (handlers rápidos).

## Catálogos

Los nombres válidos de actions y filters, con sus payloads, están en
[`hooks.md`](hooks.md). Usar un nombre que no existe no es un error: el handler
simplemente no se dispara nunca (el punto puede sembrarse en una versión futura).

## `flux.db.*` y `flux.notify` — fachada de dominio

Acceso a datos y capacidades de negocio, gateado por los `permissions` del manifest:
solo se montan las fachadas de los scopes declarados (sin el scope, la propiedad no
existe). Catálogo completo con firmas y DTOs en [`scopes.md`](scopes.md).

```js
// requiere "products.read" en el manifest
var page = flux.db.products.list({ search: 'café', limit: 10 })
flux.log(page.total + ' resultados')

// requiere "notify"
flux.notify(userId, 'Título', 'Cuerpo opcional', '/products')
```

## En preparación (no usar todavía)

- `flux.http.*` — cliente HTTP saliente.
- `flux.settings.*` — configuración propia del complemento.
- `flux.route(...)` — rutas HTTP propias.
