// JS de NAVEGADOR del plugin (módulo ES). El Layout lo importa en runtime y le pasa
// el puente fluxUI — el espejo del `flux` del servidor. Tipo de complemento visual
// disponible: PANEL LATERAL (fluxUI.panel) — card en el margen de una vista, lado
// 'left' o 'right'; varios paneles en la misma posición se apilan y se paginan con
// las flechas del card.

export default function (fluxUI) {
  fluxUI.log('client.js cargado — extiendo la UI')

  // Panel derecho en Productos. context viene de la vista: { total, page }.
  fluxUI.panel('products', 'right', {
    title: 'Hola Mundo',
    description: 'Demo de panel lateral',
    render: function (context) {
      return (
        '<div class="flex flex-col gap-2 text-sm">' +
        '<p class="font-semibold">👋 Hola desde el plugin</p>' +
        '<p class="text-muted-foreground">Contenido inyectado por <code>hola-mundo</code> sin tocar el código fuente.</p>' +
        '<p>Catálogo: <strong>' + context.total + '</strong> productos (página ' + context.page + ').</p>' +
        '</div>'
      )
    },
  })

  // Segundo panel en la MISMA posición: demuestra el apilado (flechas ‹ 1/2 ›).
  fluxUI.panel('products', 'right', {
    title: 'Estadísticas',
    description: 'Segundo panel apilado',
    render: function (context) {
      return (
        '<div class="flex flex-col gap-2 text-sm">' +
        '<p class="font-semibold">📊 Panel apilado</p>' +
        '<p class="text-muted-foreground">Cuando varios complementos comparten posición, el card los pagina con las flechas de abajo.</p>' +
        '</div>'
      )
    },
  })

  // Panel izquierdo: demuestra el posicionamiento en ambos lados.
  fluxUI.panel('products', 'left', {
    title: 'Lado izquierdo',
    description: 'Posición izquierda',
    render: function () {
      return '<p class="text-sm text-muted-foreground">Este panel vive en la posición izquierda de Productos.</p>'
    },
  })
}
