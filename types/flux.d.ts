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

export interface Flux {
  /** Identidad del propio complemento. */
  readonly plugin: { readonly name: string; readonly version: string }

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
