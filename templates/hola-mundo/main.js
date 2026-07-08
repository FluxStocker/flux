// Plugin de ejemplo: demuestra las primitivas del objeto `flux` en su orden.
//
// CICLO DE VIDA — dos fases:
//   1. REGISTRO: el cuerpo de este archivo corre UNA vez al cargar el complemento
//      (arranque, habilitar, o hot reload al cambiar main.js). Aquí solo registras.
//   2. EJECUCIÓN: cada callback corre cuando ocurre su disparador (ver cada uno).

// flux.log — corre al instante cada vez que lo llamas. Este primero confirma la carga.
flux.log('cargado — v' + flux.plugin.version)

// FILTER — corre en cada operación, ANTES de validar/persistir: lo que devuelvas es
// el valor real con el que sigue el flujo. Descomenta para aplicar 10% de descuento
// a TODAS las ventas:
// flux.onFilter('sale.total', function (total, ctx) {
//   return total * 0.9
// })

// ACTION — corre en cada evento, DESPUÉS de persistir: solo reacciona, no altera nada.
flux.onAction('auth.login', function (payload) {
  flux.log('¡' + payload.user_name + ' inició sesión! (user_id ' + payload.user_id + ')')
})

flux.onAction('sale.confirmed', function (payload) {
  flux.log('venta #' + payload.sale_id + ' cobrada por ' + payload.total)
})

// DATA — el proveedor corre cada vez que el client.js llama flux.client.data(params):
// los params llegan como ctx.params (strings); ctx.user trae el usuario de la sesión.
// Descomenta para probar:
// flux.onData(function (ctx) {
//   return { saludo: 'hola ' + (ctx.user && ctx.user.name) }
// })
