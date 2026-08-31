import http from 'node:http'
import { handleOrdersApi } from './server/ordersStore.mjs'

const PORT = Number(process.env.PORT) || 10000

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' })
    res.end('ok')
    return
  }
  if (handleOrdersApi(req, res)) return
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('not found')
})

server.listen(PORT, () => {
  console.log(`WRAAAP API listening on :${PORT}`)
})
