import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleOrdersApi } from './server/ordersStore.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT) || 10000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  res.statusCode = 200
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  if (handleOrdersApi(req, res)) return

  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const candidate = path.join(DIST, safe === path.sep ? 'index.html' : safe)

  if (candidate.startsWith(DIST) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    sendFile(res, candidate)
    return
  }

  const index = path.join(DIST, 'index.html')
  if (fs.existsSync(index)) {
    sendFile(res, index)
    return
  }

  res.statusCode = 404
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`WRAAAP listening on :${PORT}`)
})
