# hola-mundo — plantilla de complemento

El complemento mínimo completo: hooks del lado servidor (`main.js`) y un panel
lateral del lado navegador (`client.js`).

## Probar

1. Copia esta carpeta en `storage/app/plugins/hola-mundo/` de tu FluxStock.
2. Habilítalo en **Complementos** (requiere el permiso de administración).
3. Reinicia la aplicación.
4. Inicia sesión (verás el hook `auth.login` en el log) y entra a **Productos** en
   una pantalla ancha (verás los paneles laterales).

## Estructura

- `manifest.json` — identidad y entradas ([spec](../../spec/manifest.md)).
- `main.js` — servidor: `flux.onAction` / `flux.onFilter` ([spec](../../spec/flux.md)).
- `client.js` — navegador: `fluxUI.panel` ([spec](../../spec/flux-client.md)).
