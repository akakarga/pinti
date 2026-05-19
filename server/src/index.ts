import { createApp } from './app.ts'

const port = Number(process.env.PORT ?? process.env.PINTI_API_PORT ?? 8787)
const app = createApp()

app.listen(port, () => {
  console.log(`Pinti local API listening on http://localhost:${port}/api`)
})
