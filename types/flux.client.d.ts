// Tipos de la superficie `flux.client` (lado navegador, client.js) — API 1.x
// (borrador). El client.js es un módulo ES que exporta una función default; puede
// escribirse en TypeScript y compilarse a ESM:
//
//   esbuild src/client.ts --bundle --format=esm --outfile=client.js

/** Contexto que la posición expone al render (spec/outlets.md). */
export type PanelContext = Record<string, unknown>

/** Definición de un panel lateral. */
export interface PanelDef {
  /** Título del card cuando este panel está activo (por defecto, el nombre del plugin). */
  title?: string
  /** Subtítulo del card. */
  description?: string
  /** Devuelve el HTML del contenido. Se re-evalúa cuando cambia el contexto. */
  render: (context: PanelContext) => string
}

/** Vistas con posiciones sembradas (spec/outlets.md). */
export type PanelView = 'home' | 'products' | (string & {})

export interface FluxClient {
  /** Identidad del propio complemento. */
  readonly plugin: { readonly name: string }

  /**
   * Registra un panel lateral en una vista. Varios paneles en la misma posición
   * se apilan y el usuario los pagina con flechas.
   */
  panel(view: PanelView, side: 'left' | 'right', def: PanelDef): void

  /** Toasts de la aplicación. */
  readonly toast: {
    success(message: string): void
    error(message: string): void
    info(message: string): void
    message(message: string): void
  }

  /**
   * Datos del servidor: ejecuta el proveedor `flux.onData(...)` del main.js del
   * plugin (goja) y devuelve su resultado. Es el canal server→client.
   */
  data<T = unknown>(): Promise<T>

  /** console.log con prefijo [plugin:<name>]. */
  log(...args: unknown[]): void
}

/** Objeto que recibe client.js. La superficie de navegador es `flux.client`. */
export interface Flux {
  readonly client: FluxClient
}

/** Forma que debe exportar client.js. */
export type ClientSetup = (flux: Flux) => void
