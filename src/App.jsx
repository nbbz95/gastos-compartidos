import { useEffect, useMemo, useState } from 'react'
import { calcularSaldos, transferenciasMinimas } from './liquidar'

const CLAVE = 'gastos-compartidos:v1'
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function cargar() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? { personas: [], gastos: [] }
  } catch {
    return { personas: [], gastos: [] }
  }
}

export default function App() {
  const [estado, setEstado] = useState(cargar)
  const [nombre, setNombre] = useState('')
  const [gasto, setGasto] = useState({ descripcion: '', monto: '', pagador: '', participantes: [] })
  const { personas, gastos } = estado

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // Sin almacenamiento disponible: la app sigue funcionando en memoria.
    }
  }, [estado])

  const saldos = useMemo(() => calcularSaldos(personas, gastos), [personas, gastos])
  const transferencias = useMemo(() => transferenciasMinimas(saldos), [saldos])
  const total = gastos.reduce((s, g) => s + g.monto, 0)

  function agregarPersona(e) {
    e.preventDefault()
    const n = nombre.trim()
    if (!n || personas.includes(n)) return
    setEstado({ ...estado, personas: [...personas, n] })
    setNombre('')
  }

  function quitarPersona(p) {
    if (gastos.some((g) => g.pagador === p || g.participantes.includes(p))) {
      alert(`${p} tiene gastos cargados. Borralos primero.`)
      return
    }
    setEstado({ ...estado, personas: personas.filter((x) => x !== p) })
  }

  function agregarGasto(e) {
    e.preventDefault()
    const monto = Number(gasto.monto)
    if (!gasto.pagador || !(monto > 0)) return
    const nuevo = { ...gasto, monto, id: crypto.randomUUID() }
    setEstado({ ...estado, gastos: [...gastos, nuevo] })
    setGasto({ descripcion: '', monto: '', pagador: gasto.pagador, participantes: [] })
  }

  function alternarParticipante(p) {
    const ps = gasto.participantes.includes(p)
      ? gasto.participantes.filter((x) => x !== p)
      : [...gasto.participantes, p]
    setGasto({ ...gasto, participantes: ps })
  }

  function reiniciar() {
    if (confirm('¿Borrar todas las personas y gastos?')) setEstado({ personas: [], gastos: [] })
  }

  return (
    <main>
      <header>
        <h1>Gastos compartidos</h1>
        <p>Cargá quién pagó qué y te digo quién le paga a quién, con la menor cantidad de transferencias.</p>
      </header>

      <section>
        <h2>1. Personas</h2>
        <form onSubmit={agregarPersona} className="fila">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" aria-label="Nombre" />
          <button>Agregar</button>
        </form>
        <ul className="chips">
          {personas.map((p) => (
            <li key={p}>
              {p} <button className="x" onClick={() => quitarPersona(p)} aria-label={`Quitar a ${p}`}>×</button>
            </li>
          ))}
        </ul>
      </section>

      {personas.length >= 2 && (
        <section>
          <h2>2. Gastos</h2>
          <form onSubmit={agregarGasto} className="gasto">
            <input value={gasto.descripcion} onChange={(e) => setGasto({ ...gasto, descripcion: e.target.value })} placeholder="Descripción (ej: asado)" aria-label="Descripción" />
            <input type="number" min="0" step="0.01" value={gasto.monto} onChange={(e) => setGasto({ ...gasto, monto: e.target.value })} placeholder="Monto" aria-label="Monto" />
            <select value={gasto.pagador} onChange={(e) => setGasto({ ...gasto, pagador: e.target.value })} aria-label="Quién pagó">
              <option value="">¿Quién pagó?</option>
              {personas.map((p) => <option key={p}>{p}</option>)}
            </select>
            <fieldset>
              <legend>Entre quiénes (vacío = todos)</legend>
              {personas.map((p) => (
                <label key={p}>
                  <input type="checkbox" checked={gasto.participantes.includes(p)} onChange={() => alternarParticipante(p)} /> {p}
                </label>
              ))}
            </fieldset>
            <button>Agregar gasto</button>
          </form>

          <ul className="lista">
            {gastos.map((g) => (
              <li key={g.id}>
                <span>{g.descripcion || 'Gasto'} · pagó {g.pagador}{g.participantes.length ? ` · entre ${g.participantes.join(', ')}` : ''}</span>
                <strong>{pesos.format(g.monto)}</strong>
                <button className="x" onClick={() => setEstado({ ...estado, gastos: gastos.filter((x) => x.id !== g.id) })} aria-label="Borrar gasto">×</button>
              </li>
            ))}
          </ul>
          {gastos.length > 0 && <p className="total">Total: {pesos.format(total)}</p>}
        </section>
      )}

      {gastos.length > 0 && (
        <section>
          <h2>3. Cómo saldar</h2>
          {transferencias.length === 0 ? (
            <p>Están todos a mano.</p>
          ) : (
            <ol className="lista">
              {transferencias.map((t, i) => (
                <li key={i}><span><b>{t.de}</b> le paga a <b>{t.a}</b></span><strong>{pesos.format(t.monto)}</strong></li>
              ))}
            </ol>
          )}
          <h3>Saldos</h3>
          <ul className="lista">
            {personas.map((p) => (
              <li key={p}><span>{p}</span><strong className={saldos[p] < 0 ? 'neg' : 'pos'}>{pesos.format(saldos[p] / 100)}</strong></li>
            ))}
          </ul>
          <button className="secundario" onClick={reiniciar}>Empezar de nuevo</button>
        </section>
      )}

      <footer>Los datos quedan guardados solo en tu navegador.</footer>
    </main>
  )
}
