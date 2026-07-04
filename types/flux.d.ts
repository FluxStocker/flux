// Tipos de la superficie `flux` (lado servidor, main.js) — API 1.x (borrador).
// Uso recomendado: escribir el plugin en TypeScript y compilar a un único main.js
// (target ES2017, sin imports en runtime):
//
//   esbuild src/main.ts --bundle --format=iife --target=es2017 --outfile=main.js

/** Payload de una action: mapa serializable definido en spec/hooks.md. */
export type ActionPayload = Record<string, unknown>

/** Contexto de solo lectura de un filter. */
export type FilterContext = Record<string, unknown>

/** Actions sembradas (spec/hooks.md). Nombres futuros llegan sin romper. */
export type ActionName =
  | 'sale.confirmed'
  | 'movement.confirmed'
  | 'auth.login'
  | 'auth.logout'
  | 'chat.message_sent'
  | 'activity.recorded'
  | (string & {})

/** Filters sembrados (spec/hooks.md). */
export type FilterName = 'sale.total' | (string & {})

/** DTO de producto (scope products.read). Ver spec/scopes.md. */
export interface Product {
  id: number
  sku: string
  name: string
  description: string
  cost: number
  price: number
  active: boolean
  category: string | null
  unit: string | null
}

/** DTO de venta (scope sales.read). */
export interface Sale {
  id: number
  total: number
  paid: number
  change: number
  status: string
  point_of_sale_id: number
  customer_id: number | null
  user_id: number | null
  created_at: string
}

export interface SaleItem {
  product_id: number
  warehouse_id: number
  quantity: number
  unit_price: number
}

export interface Page<T> {
  data: T[]
  total: number
}

export interface Flux {
  /** Identidad del propio complemento. */
  readonly plugin: { readonly name: string; readonly version: string }

  /**
   * Fachadas de datos por scope: cada propiedad existe SOLO si el manifest declaró
   * el scope correspondiente (spec/scopes.md).
   */
  readonly db: {
    /** Requiere el scope "products.read". */
    readonly products?: {
      list(opts?: { search?: string; active?: boolean; limit?: number; offset?: number }): Page<Product>
      get(id: number): Product | null
    }
    /** Requiere el scope "sales.read". */
    readonly sales?: {
      list(opts?: { from?: string; to?: string; limit?: number; offset?: number }): Page<Sale>
      get(id: number): (Sale & { items: SaleItem[] }) | null
    }
  }

  /**
   * Notifica a un usuario (campana + push en vivo). Requiere el scope "notify";
   * sin él, la propiedad no existe. url debe ser ruta interna ("/...").
   */
  notify?(userId: number, title: string, body?: string, url?: string): void

  /** Log de la aplicación, con prefijo [plugin:<name>]. */
  log(...args: unknown[]): void

  /**
   * Reacciona a un evento del núcleo. El handler corre tras persistir la
   * operación; debe ser rápido. Un error se registra sin afectar al núcleo.
   */
  onAction(name: ActionName, handler: (payload: ActionPayload) => void): void

  /**
   * Modifica un valor en un punto sembrado. Devolver undefined/null deja el
   * valor intacto; un tipo incompatible se descarta.
   */
  onFilter(
    name: FilterName,
    handler: (value: unknown, context: FilterContext) => unknown,
  ): void
}

declare global {
  /** Puente hacia FluxStock — único global garantizado junto a `console`. */
  const flux: Flux
}

export {}
