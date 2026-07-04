# Catálogo de hooks — API 1.x

Contrato público: los hooks listados aquí mantienen nombre y payload dentro de la
misma versión mayor. **Añadir claves a un payload es seguro; quitarlas o
renombrarlas, no.**

## Actions

Corren tras persistir la operación, fuera de cualquier transacción.

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

### `sale.total`

Total calculado de una venta, **antes** de validar el pago y persistir. Permite
descuentos, recargos o redondeos.

- **Valor**: `number` (el total).
- **Contexto**: `point_of_sale_id` (number), `customer_id` (number|null),
  `user_id` (number|null), `lines` (number — cantidad de líneas).
- El resultado se redondea a 2 decimales.
