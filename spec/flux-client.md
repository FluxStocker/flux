# `flux.client` — superficie de navegador

El `client.js` de un complemento es un **módulo ES** que exporta una función
default. FluxStock lo importa al iniciar sesión y le pasa `flux`; la superficie de
navegador vive bajo `flux.client`:

```js
export default function (flux) {
  flux.client.log('cargado')
  // registrarse aquí
}
```

> Espejo del `flux` del servidor (main.js): lo común es `flux.*`, lo del navegador
> `flux.client.*`. El nombre del parámetro es libre (es un argumento).

A diferencia del lado servidor, aquí hay navegador completo (DOM, `fetch`, etc.).
**Regla de oro**: no tocar el DOM de las vistas directamente — la interfaz se
re-renderiza y borra los cambios. Extender solo por los puntos sembrados.

## `flux.client.plugin`

`{ name: string }` — identidad del complemento.

## `flux.client.panel(vista, lado, def)`

Registra un **panel lateral** — el tipo de complemento visual disponible: un card en
el margen de una vista (visible en pantallas anchas), lado `'left'` o `'right'`.

```js
flux.client.panel('products', 'right', {
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

## `flux.client.data()`

Devuelve una `Promise` con los datos que produce el proveedor `flux.onData(...)` del
`main.js` del complemento (el canal server→client): hace `fetch` a
`/plugins/<nombre>/data`. Como `render` es **síncrono**, el patrón es pedir los datos
y registrar (o refrescar) el panel cuando llegan:

```js
flux.client.data().then(function (data) {
  flux.client.panel('home', 'right', {
    title: 'Mi panel',
    render: function () { return render(data) },
  })
})
```

## `flux.client.toast`

Toasts de la aplicación: `success(msg)`, `error(msg)`, `info(msg)`, `message(msg)`.

## `flux.client.log(...args)`

`console.log` con el prefijo `[plugin:<name>]` (visible en la consola del navegador).
