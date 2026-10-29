import { describe, expect, it } from 'vitest'
import { calcularSaldos, transferenciasMinimas } from './liquidar'

describe('calcularSaldos', () => {
  it('reparte un gasto en partes iguales', () => {
    const saldos = calcularSaldos(['Ana', 'Beto', 'Caro'], [
      { pagador: 'Ana', monto: 300, participantes: [] },
    ])
    expect(saldos).toEqual({ Ana: 20000, Beto: -10000, Caro: -10000 })
  })

  it('respeta los participantes de cada gasto', () => {
    const saldos = calcularSaldos(['Ana', 'Beto', 'Caro'], [
      { pagador: 'Beto', monto: 100, participantes: ['Ana', 'Beto'] },
    ])
    expect(saldos).toEqual({ Ana: -5000, Beto: 5000, Caro: 0 })
  })

  it('la suma de saldos siempre da cero aunque la división no sea exacta', () => {
    const saldos = calcularSaldos(['A', 'B', 'C'], [{ pagador: 'A', monto: 10, participantes: [] }])
    expect(Object.values(saldos).reduce((a, b) => a + b, 0)).toBe(0)
  })
})

describe('transferenciasMinimas', () => {
  it('salda todas las deudas', () => {
    const t = transferenciasMinimas({ Ana: 20000, Beto: -10000, Caro: -10000 })
    expect(t).toEqual([
      { de: 'Beto', a: 'Ana', monto: 100 },
      { de: 'Caro', a: 'Ana', monto: 100 },
    ])
  })

  it('no genera transferencias si todos están a mano', () => {
    expect(transferenciasMinimas({ Ana: 0, Beto: 0 })).toEqual([])
  })

  it('usa como máximo n-1 transferencias', () => {
    const t = transferenciasMinimas({ A: 5000, B: 3000, C: -4000, D: -4000 })
    expect(t.length).toBeLessThanOrEqual(3)
    const neto = {}
    for (const { de, a, monto } of t) {
      neto[de] = (neto[de] ?? 0) - monto
      neto[a] = (neto[a] ?? 0) + monto
    }
    expect(neto).toEqual({ A: 50, B: 30, C: -40, D: -40 })
  })
})
