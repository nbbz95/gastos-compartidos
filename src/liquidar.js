// Lógica pura: saldos y transferencias mínimas. Trabaja en centavos para evitar errores de punto flotante.

export function calcularSaldos(personas, gastos) {
  const saldos = Object.fromEntries(personas.map((p) => [p, 0]))
  for (const g of gastos) {
    const centavos = Math.round(g.monto * 100)
    const entre = g.participantes.length ? g.participantes : personas
    const parte = Math.floor(centavos / entre.length)
    let resto = centavos - parte * entre.length
    saldos[g.pagador] = (saldos[g.pagador] ?? 0) + centavos
    for (const p of entre) {
      // El resto de la división se reparte de a un centavo para que la suma cierre exacto.
      const extra = resto > 0 ? 1 : 0
      resto -= extra
      saldos[p] = (saldos[p] ?? 0) - parte - extra
    }
  }
  return saldos
}

export function transferenciasMinimas(saldos) {
  const deudores = []
  const acreedores = []
  for (const [persona, saldo] of Object.entries(saldos)) {
    if (saldo < 0) deudores.push({ persona, monto: -saldo })
    else if (saldo > 0) acreedores.push({ persona, monto: saldo })
  }
  deudores.sort((a, b) => b.monto - a.monto)
  acreedores.sort((a, b) => b.monto - a.monto)

  const transferencias = []
  let i = 0
  let j = 0
  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].monto, acreedores[j].monto)
    transferencias.push({ de: deudores[i].persona, a: acreedores[j].persona, monto: monto / 100 })
    deudores[i].monto -= monto
    acreedores[j].monto -= monto
    if (deudores[i].monto === 0) i++
    if (acreedores[j].monto === 0) j++
  }
  return transferencias
}
