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
- **Tipado**: el scaffold genera `src/js/server/flux.d.ts` con estas fachadas y DTOs
  tipados **según los scopes del manifest** (línea `ManifestScopes`, autogenerada al
  guardar scopes en la UI): usar `flux.db.x` sin su scope es error de compilación,
  igual que en runtime.

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

## `activity.read`

Leer el registro de actividad (quién hizo qué y con qué resultado). Monta
`flux.db.activity`:

- `flux.db.activity.list(opts?)` → `{ data: Activity[], total: number }`
  - `opts`: `{ user_id?: number (0 = todos), status?: string, search?: string, limit?: number (30, máx 200), offset?: number }`
- `flux.db.activity.get(id)` → `Activity & { details: string } | null`

`Activity`: `{ id, user_id, user_name, method, path, action, status, status_code, created_at }`

> El core acota lo que cada usuario ve (todo con `logs.view`, solo lo suyo con
> `logs.view_own`). Un plugin de confianza replica esa política filtrando por
> `user_id` con el usuario que le pasa `flux.onData(ctx)`.

## `settings.read`

Leer la configuración del negocio (tabla settings, key-value). Monta
`flux.db.settings`. No pagina: es un conjunto fijo de claves.

- `flux.db.settings.all()` → `Settings` (todas las claves publicadas, defaults
  incluidos; la moneda llega resuelta desde el catálogo de monedas)
- `flux.db.settings.get(key)` → `string` (`''` si la clave no está publicada)

`Settings`: `{ business_name, tax_id, address, phone, email, logo, currency_code,
currency_symbol, tax_rate, receipt_header, receipt_footer,
weighted_stock_levels }` (todo strings; `logo` es ruta bajo `/storage/<logo>`,
vacío = sin logo; `weighted_stock_levels` es `"1"` — costo ponderado — o `"0"` —
lotes FIFO)

> Solo se publican estas claves (lista blanca en el core); el resto de ajustes
> internos no forma parte del contrato.

## `notify`

Enviar notificaciones a usuarios (campana + push en vivo). Monta `flux.notify`:

- `flux.notify(userId, title, body?, url?)` — `url` debe ser ruta interna (`/...`).
  La notificación llega con tipo `plugin.<nombre>`: el receptor siempre sabe qué
  complemento le habla.

## Errores

Las fachadas lanzan excepciones JS normales (capturables con `try/catch`); un error
no capturado en un handler se registra en el log sin afectar al núcleo.
