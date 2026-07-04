# Catálogo de posiciones visuales — API 1.x

Contrato público, mismas reglas que los hooks: las posiciones listadas mantienen
nombre y contexto dentro de la misma versión mayor.

## Paneles laterales (`fluxUI.panel`)

| Vista | Lados | Contexto del render |
|---|---|---|
| `products` | `left`, `right` | `{ total: number, page: number }` — total de productos del catálogo y página actual |

Registrar un panel en una vista/lado no listado no es un error: simplemente no se
muestra (la posición puede sembrarse en una versión futura).
