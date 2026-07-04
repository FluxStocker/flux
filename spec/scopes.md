# Catálogo de scopes de dominio — API 1.x

Los **scopes** son las capacidades de datos/negocio que un complemento puede usar en
el lado servidor. Se declaran en el `manifest.json` (`permissions`) y el
administrador los ve —con estas descripciones— antes de habilitar el complemento.

Reglas:

- Un manifest que declare un scope fuera de este catálogo **no se puede habilitar**.
- Sin el scope declarado, la fachada correspondiente **no existe** en `flux`
  (`flux.db.products` es `undefined` si no declaraste `products.read`).
- Contrato público: los scopes listados mantienen nombre y semántica dentro de la
  misma versión mayor. Los DTOs solo ganan campos, nunca los pierden.

## `products.read`

Leer el catálogo de productos. Monta `flux.db.products`:

- `flux.db.products.list(opts?)` → `{ data: Product[], total: number }`
  - `opts`: `{ search?: string, active?: boolean, limit?: number (50, máx 200), offset?: number }`
- `flux.db.products.get(id)` → `Product | null`

`Product`: `{ id, sku, name, description, cost, price, active, category: string|null, unit: string|null }`

## `sales.read`

Leer las ventas. Monta `flux.db.sales`:

- `flux.db.sales.list(opts?)` → `{ data: Sale[], total: number }`
  - `opts`: `{ from?: 'YYYY-MM-DD', to?: 'YYYY-MM-DD', limit?: number (50, máx 200), offset?: number }`
- `flux.db.sales.get(id)` → `Sale & { items: SaleItem[] } | null`

`Sale`: `{ id, total, paid, change, status, point_of_sale_id, customer_id, user_id, created_at }`
`SaleItem`: `{ product_id, warehouse_id, quantity, unit_price }`

## `notify`

Enviar notificaciones a usuarios (campana + push en vivo). Monta `flux.notify`:

- `flux.notify(userId, title, body?, url?)` — `url` debe ser ruta interna (`/...`).
  La notificación llega con tipo `plugin.<nombre>`: el receptor siempre sabe qué
  complemento le habla.

## Errores

Las fachadas lanzan excepciones JS normales (capturables con `try/catch`); un error
no capturado en un handler se registra en el log sin afectar al núcleo.
