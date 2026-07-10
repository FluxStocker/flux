# Catálogo de hooks — API 1.x

Contrato público: los hooks listados aquí mantienen nombre y payload dentro de la
misma versión mayor. **Añadir claves a un payload es seguro; quitarlas o
renombrarlas, no.**

> Registrar (`flux.onAction`/`flux.onFilter`) ocurre **una vez** al cargar el
> complemento; el **handler** corre en el momento que indica cada entrada de este
> catálogo — filters **antes** de persistir (modifican), actions **después**
> (reaccionan). Ciclo de vida completo en [`flux.md`](flux.md).

## Actions

Corren tras persistir la operación, fuera de cualquier transacción.

### Convención de ENTIDADES

Todo modelo de negocio con CRUD dispara `"<entidad>.created"`, `"<entidad>.updated"`
y `"<entidad>.deleted"` con un payload de forma **estándar**:

```
{ "<entidad>_id": number, "label": string, "user_id": number|null, ...extras }
```

`label` es el nombre visible del registro. Los extras de cada entidad se listan en
su sección. La forma predecible permite plugins genéricos (p. ej. auditoría) que
escuchan cualquier entidad sin casos especiales.

Entidades sembradas: **product** (extras: `sku`). Las demás se irán sumando con la
misma forma.

> **Gateo por scope:** los hooks de producto exigen que el manifest declare su scope
> ([`scopes.md`](scopes.md)) para registrar un handler — `products.create` para los
> de creación, `products.update` para los de edición, `products.delete` para los de
> borrado. Sin el scope, el handler se ignora (warning en el log).

### `product.created` / `product.updated` / `product.deleted`

Ciclo de vida del producto (convención de entidades). Scope: `products.create` /
`products.update` / `products.delete` respectivamente. Extras:

| Clave | Tipo | Descripción |
|---|---|---|
| `sku` | string | SKU del producto |

### `product.price_changed`

El precio de venta cambió al editar el producto (complementa el historial de
precios que el core persiste). Scope: `products.update`.

| Clave | Tipo | Descripción |
|---|---|---|
| `product_id` | number | Id del producto |
| `label` | string | Nombre del producto |
| `user_id` | number \| null | Quién lo cambió |
| `sku` | string | SKU |
| `old_price` | number | Precio anterior |
| `new_price` | number | Precio nuevo |

### `sale.confirmed`

Venta cobrada en un punto de venta.

| Clave | Tipo | Descripción |
|---|---|---|
| `sale_id` | number | Id de la venta |
| `total` | number | Total cobrado (tras filters) |
| `paid` | number | Efectivo recibido |
| `point_of_sale_id` | number | POS donde se vendió |
| `customer_id` | number \| null | Cliente (si se asoció) |
| `user_id` | number \| null | Vendedor |

### `movement.confirmed`

Movimiento de inventario confirmado desde el módulo de Movimientos (entrada, salida
o transferencia). Los movimientos que emite una venta **no** pasan por aquí — para
ventas usar `sale.confirmed`.

| Clave | Tipo | Descripción |
|---|---|---|
| `movement_id` | number | Id del movimiento |
| `type` | string | `entry` \| `exit` \| `transfer` |
| `reason` | string | Razón del movimiento |
| `user_id` | number \| null | Quién confirmó |

### `auth.login` / `auth.logout`

Sesión iniciada / cerrada.

| Clave | Tipo |
|---|---|
| `user_id` | number |
| `user_name` | string |

### `chat.message_sent`

Mensaje del chat interno persistido (texto o adjunto; incluye reenvíos).

| Clave | Tipo | Descripción |
|---|---|---|
| `message_id` | number | |
| `conversation_id` | number | |
| `sender_id` | number | |
| `attachment_kind` | string | `image` \| `audio` \| `video` \| `file` \| `""` (solo texto) |

### `activity.recorded`

Entrada nueva en el registro de actividad — el "firehose" para complementos de
auditoría (cada mutación, acceso denegado, login…).

| Clave | Tipo |
|---|---|
| `activity_id` | number |
| `action` | string |
| `status` | string |
| `user_id` | number \| null |
| `user_name` | string |
| `method` | string |
| `path` | string |

## Filters

### Convención de ENTIDADES (espejo de las actions)

Cada action de entidad tiene su filter en **gerundio** — el "antes" que modifica o
veta. Corren tras VALIDAR y antes de persistir:

| Filter | value | Al devolver |
|---|---|---|
| `<entidad>.creating` | mapa de atributos | lo devuelto ES lo que se crea |
| `<entidad>.updating` | mapa de atributos | lo devuelto ES lo que se guarda |
| `<entidad>.deleting` | `{ allowed: bool, message: string }` | `allowed: false` **veta** el borrado y el usuario ve `message` (vacío = aviso genérico) |

Regla mnemotécnica: *gerundio = filter (puedo cambiarlo o pararlo); participio =
action (ya pasó, reacciono)*. Devolver `undefined`/`null` o un tipo incompatible
deja el valor intacto (protección del motor).

### `product.creating` / `product.updating`

Atributos del producto antes de persistir. Scope: `products.create` /
`products.update`.

- **Valor**: `{ sku, name, description, cost, price, active }`.
- **Contexto**: `user_id` (number|null); `updating` añade `product_id` (number).
- La unicidad del SKU se comprueba con el valor FINAL (un filter puede cambiarlo).

```js
// margen mínimo del 20% sobre el costo
flux.onFilter('product.updating', function (attrs, ctx) {
  if (attrs.price < attrs.cost * 1.2) attrs.price = attrs.cost * 1.2
  return attrs
})
```

### `product.deleting`

Veto del borrado, con mensaje propio. Scope: `products.delete`.

- **Valor**: `{ allowed: boolean, message: string }`.
- **Contexto**: `product_id` (number), `sku` (string), `label` (string),
  `user_id` (number|null).

```js
flux.onFilter('product.deleting', function (veto, ctx) {
  if (tieneVentas(ctx.product_id)) {
    return { allowed: false, message: 'Tiene ventas históricas: desactívalo en su lugar.' }
  }
  return veto
})
```

### `sale.total`

Total calculado de una venta, **antes** de validar el pago y persistir. Permite
descuentos, recargos o redondeos.

- **Valor**: `number` (el total).
- **Contexto**: `point_of_sale_id` (number), `customer_id` (number|null),
  `user_id` (number|null), `lines` (number — cantidad de líneas).
- El resultado se redondea a 2 decimales.
