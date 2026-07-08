# Catálogo de posiciones visuales — API 1.x

Contrato público, mismas reglas que los hooks: las posiciones listadas mantienen
nombre dentro de la misma versión mayor.

## Paneles laterales (`flux.client.panel`)

Vistas sembradas y lados disponibles (el host **rechaza** al guardar una posición
fuera de este catálogo):

| Vista | Lados |
|---|---|
| `home` | `left`, `right` |
| `products` | `left`, `right` |
| `sell` | `left` — la columna de cobro ocupa el margen derecho |
| `kardex` | `left`, `right` |
| `movements` | `left`, `right` |
| `customers` | `left`, `right` |
| `suppliers` | `left`, `right` |
| `categories` | `left`, `right` |
| `units` | `left`, `right` |
| `warehouses` | `left`, `right` |
| `warehouse-stock` | `left`, `right` |
| `points-of-sale` | `left`, `right` |
| `cash-session` | `left`, `right` |
| `reports` | `left`, `right` |
| `users` | `left`, `right` |
| `roles` | `left`, `right` |
| `currencies` | `left`, `right` |
| `activity-logs` | `left`, `right` |
| `backups` | `left`, `right` |

Registrar un panel en una vista/lado no listado no es un error: simplemente no se
muestra (la posición puede sembrarse en una versión futura).

## Contexto del render/mount

Todas las posiciones reciben el MISMO contexto:

```ts
{ view: string, user: object | null, props: object }
```

- `view` — slug de la vista actual (tabla de arriba).
- `user` — usuario de la sesión (`{ id, name, email, roles, permissions, … }`).
- `props` — las props Inertia de la página actual, filtradas (sin `settings` ni
  credenciales) — el mismo snapshot que `flux.client.page.props`.

**Frontera de contrato**: el SOBRE (`view`/`user`/`props`) es estable; el
**contenido** de `props` refleja lo que la página muestra y su forma es interna de
FluxStock — puede cambiar entre versiones sin aviso. Para datos estables usa
`flux.client.data()` y los scopes de dominio ([`scopes.md`](scopes.md)); la
configuración del negocio viaja SOLO por el scope `settings.read`.

## Comportamiento responsive

- **≥ 2xl (escritorio ancho)** — cada posición es un card fijo en el margen del
  contenido, lado `left` o `right`. Varios paneles en la misma posición se apilan y
  el card los pagina con flechas.
- **< 2xl (móvil/tablet/laptop)** — los márgenes no existen: una **barra vertical**
  pegada al borde izquierdo muestra el icono de cada complemento con panel en la
  vista actual (unión de ambos lados, un icono por complemento); tocar el icono
  abre un **drawer** lateral con el card del complemento.
