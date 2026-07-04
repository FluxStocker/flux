# `flux.client` — superficie de navegador

El `client.js` de un complemento es un **módulo ES** que exporta una función
default. FluxStock lo importa al iniciar sesión y le pasa el puente:

```js
export default function (fluxUI) {
  // registrarse aquí
}
```

> Nota de nomenclatura: el parámetro se llama `fluxUI` en la implementación actual;
> la especificación se refiere a esta superficie como **flux.client**. El nombre del
> parámetro es libre (es un argumento).

A diferencia del lado servidor, aquí hay navegador completo (DOM, `fetch`, etc.).
**Regla de oro**: no tocar el DOM de las vistas directamente — la interfaz se
re-renderiza y borra los cambios. Extender solo por los puntos sembrados.

## `fluxUI.plugin`

`{ name: string }` — identidad del complemento.

## `fluxUI.panel(vista, lado, def)`

Registra un **panel lateral** — el tipo de complemento visual disponible: un card en
el margen de una vista (visible en pantallas anchas), lado `'left'` o `'right'`.

```js
fluxUI.panel('products', 'right', {
  title: 'Mi panel',
  description: 'Qué muestra',
  render: function (context) {
    return '<p>' + context.total + ' productos</p>'
  },
})
```

- `render(context)` devuelve **HTML** (string). El contexto lo define cada posición
  (ver [`outlets.md`](outlets.md)).
- Varios paneles en la misma posición se **apilan**: el card muestra uno a la vez y
  el usuario los pagina con flechas.
- Al deshabilitar el complemento, sus paneles desaparecen al instante.

## `fluxUI.toast`

Toasts de la aplicación: `success(msg)`, `error(msg)`, `info(msg)`, `message(msg)`.

## `fluxUI.log(...args)`

`console.log` con el prefijo `[plugin:<name>]` (visible en la consola del navegador).
