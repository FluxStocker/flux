# flux — SDK de complementos de FluxStock

**flux** es la especificación pública para desarrollar complementos (plugins) de
[FluxStock](https://www.fluxstock.app), el sistema de inventario + punto de venta.
FluxStock es software cerrado; este repositorio contiene todo lo que un autor de
complementos necesita — y nada del núcleo.

## Qué hay aquí

| Carpeta | Contenido |
|---|---|
| [`spec/`](spec/) | La especificación versionada: hooks, filters, outlets, scopes, manifest |
| [`types/`](types/) | Tipos TypeScript de las superficies `flux` (servidor) y `flux.client` (navegador) |
| [`proto/`](proto/) | Contrato gRPC para plugins-servicio (en preparación) |
| [`templates/`](templates/) | Plantillas de complementos listas para copiar |

## Un complemento en 30 segundos

```
mi-plugin/
├── manifest.json   # identidad, versión, tipo, permisos
├── main.js         # lado SERVIDOR (motor goja embebido): hooks y filters
└── client.js       # lado NAVEGADOR (módulo ES): extensiones de UI
```

```js
// main.js — corre dentro del servidor FluxStock
flux.onAction('sale.confirmed', function (payload) {
  flux.log('venta #' + payload.sale_id + ' por ' + payload.total)
})
```

```js
// client.js — corre en el navegador del usuario
export default function (flux) {
  flux.client.panel('products', 'right', {
    title: 'Mi panel',
    render: (ctx) => '<p>' + ctx.total + ' productos</p>',
  })
}
```

Se instala copiando la carpeta en `storage/app/plugins/` y habilitándolo en
**Complementos** dentro de FluxStock.

## Lenguajes soportados

| Lenguaje | Puente | Estado |
|---|---|---|
| **JavaScript / TypeScript** ⭐ | motor embebido (servidor) + módulo ES (navegador) | ✅ disponible |
| **Go** | SDK sobre gRPC local | en desarrollo |
| **PHP** | plantilla host FrankenPHP (mismo gRPC por dentro) | planificado |

## Versionado

La especificación versiona con [SemVer](https://semver.org). Dentro de una misma
versión mayor **nada publicado se rompe**: los hooks, outlets y scopes existentes
mantienen nombre y semántica; solo se añade. El `manifest.json` declara la versión
de API que el complemento espera.

## Licencia

MIT — ver [LICENSE](LICENSE). (FluxStock, la aplicación, es software propietario;
esta especificación y sus SDKs son libres.)
