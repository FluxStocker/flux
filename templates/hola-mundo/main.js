// Plugin de ejemplo: demuestra las tres primitivas del objeto `flux`.
// El cuerpo de este archivo corre UNA vez al arrancar la app (fase de registro);
// los callbacks corren cada vez que el core dispara el hook.

flux.log('cargado — v' + flux.plugin.version)

// Action: reaccionar a un evento (no altera el flujo).
flux.onAction('auth.login', function (payload) {
  flux.log('¡' + payload.user_name + ' inició sesión! (user_id ' + payload.user_id + ')')
})

flux.onAction('sale.confirmed', function (payload) {
  flux.log('venta #' + payload.sale_id + ' cobrada por ' + payload.total)
})

// Filter: modificar un valor en un punto sembrado. Devuelve el valor (modificado o
// no). Descomenta para aplicar 10% de descuento a TODAS las ventas:
// flux.onFilter('sale.total', function (total, ctx) {
//   return total * 0.9
// })
