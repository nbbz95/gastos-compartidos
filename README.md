# Gastos compartidos

App web para dividir gastos entre amigos: cargás quién pagó qué y calcula quién le paga a quién con la menor cantidad de transferencias.

**Demo:** https://nbbz95.github.io/gastos-compartidos/

## Qué hace

- Alta de personas y gastos, con la opción de dividir cada gasto solo entre algunas personas.
- Calcula el saldo de cada uno y propone las transferencias para quedar a mano (como máximo n‑1).
- Guarda todo en el navegador (`localStorage`), sin backend ni registro.
- Se puede instalar como app (PWA) y funciona sin conexión.

## Cómo funciona

La lógica está separada de la interfaz en [`src/liquidar.js`](src/liquidar.js):

1. Pasa los montos a centavos para evitar errores de punto flotante y reparte el resto de la división de a un centavo, así la suma de saldos siempre da cero.
2. Separa deudores y acreedores, los ordena por monto y los va cruzando de a pares (algoritmo greedy).

## Stack

React 18, Vite, Vitest, ESLint, GitHub Actions y GitHub Pages.

## Correr localmente

```bash
npm install
npm run dev     # servidor de desarrollo
npm test        # tests de la lógica
npm run build   # build de producción en dist/
```

## CI/CD

Cada push a `main` corre lint, tests y build, y publica en GitHub Pages ([workflow](.github/workflows/deploy.yml)).
