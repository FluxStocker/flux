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
  - `opts`: `{ search?: string, active?: boolean, category_id?: number, limit?: number (50, máx 200), offset?: number }`
- `flux.db.products.get(id)` → `Product | null`

`Product`: `{ id, sku, name, description, cost, price, active, category: string|null,
unit: string|null, currency: { code, symbol }|null, created_at: string }`

## `products.create` / `products.update` / `products.delete`

Intervenir el CICLO DE VIDA de un producto. No montan `flux.db.*` — **gatean hooks**:
solo con el scope puedes registrar los handlers de esa operación (los filters
modifican o vetan; los actions reaccionan). Los datos de esos hooks son acceso
privilegiado, por eso no vienen con `products.read`. El admin ve al habilitar qué
ciclos toca el complemento.

| Scope | Hooks que habilita ([`hooks.md`](hooks.md)) |
|---|---|
| `products.create` | filter `product.creating` + action `product.created` |
| `products.update` | filter `product.updating` + actions `product.updated`, `product.price_changed` |
| `products.delete` | filter `product.deleting` (veto) + action `product.deleted` |

Registrar un hook sin su scope no rompe el plugin: el handler se ignora y se loguea
el motivo.

```js
// requiere products.update en el manifest
flux.onFilter('product.updating', (attrs) => {
  if (attrs.price < attrs.cost * 1.2) attrs.price = attrs.cost * 1.2
  return attrs
})
```

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

## `meta.read` / `meta.write`

METADATOS DE ENTIDADES: la vía para que un complemento EXTIENDA datos de un modelo
del core (p. ej. un campo `image` en product) **sin tocar el esquema del core**. Las
claves están namespaceadas por el slug del complemento: solo lees y escribes lo
TUYO — imposible tocar metadatos de otro plugin. Montan `flux.db.meta`:

Con `meta.read`:

- `flux.db.meta.get(entity, id, key)` → valor (o `null`)
- `flux.db.meta.forEntities(entity, ids)` → `{ [id]: { [key]: valor } }` (hidratar
  un lote de golpe)

Con `meta.write` (primer scope de ESCRITURA del catálogo — el admin lo ve tal cual):

- `flux.db.meta.set(entity, id, key, valor)` — valor JSON-able, máx 64 KB
- `flux.db.meta.delete(entity, id, key)`

Reglas:

- `entity` sale de una lista blanca; hoy: `product`. Crece entidad a entidad.
- `key`: minúsculas, números y `-_.` (máx 100).
- Eliminar el complemento del sistema borra TODOS sus metadatos.

```js
flux.db.meta.set('product', 42, 'image', 'https://cdn.ejemplo.com/cafe.jpg')
const url = flux.db.meta.get('product', 42, 'image')
```

## `files.write`

Subir archivos (imágenes, adjuntos) al ALMACÉN PROPIO del complemento, servidos
públicamente bajo `/storage/…`. El core controla dónde y cómo se guarda (confinado a
`plugins/<slug>/`, extensión en lista blanca, máx 5 MB) — el plugin nunca elige la
ruta. Se usa desde el navegador:

- `flux.client.upload(file)` → `Promise<string>` — sube y devuelve la URL pública.

La URL NO se persiste sola: guárdala como metadato para asociarla a una entidad.

```js
export default function (flux) {
  flux.client.formField('product', {
    label: 'Imagen',
    mount(el, ctx) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const url = await flux.client.upload(input.files[0]) // sube (files.write)
        ctx.setMeta('image', url)                            // asocia (meta.write)
      }
      el.appendChild(input)
    },
  })
}
```

Extensiones permitidas: `png, jpg, jpeg, webp, gif, svg, pdf`. Eliminar el
complemento borra su almacén completo.

## `notify`

Enviar notificaciones a usuarios (campana + push en vivo). Monta `flux.notify`:

- `flux.notify(userId, title, body?, url?)` — `url` debe ser ruta interna (`/...`).
  La notificación llega con tipo `plugin.<nombre>`: el receptor siempre sabe qué
  complemento le habla.

## Errores

Las fachadas lanzan excepciones JS normales (capturables con `try/catch`); un error
no capturado en un handler se registra en el log sin afectar al núcleo.
