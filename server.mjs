import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { pipeline } from 'node:stream/promises'
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

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml'])

function wantsGzip(req) {
  const ae = req.headers['accept-encoding'] || ''
  return ae.includes('gzip')
}

function cacheControl(urlPath, ext) {
  if (urlPath.startsWith('/assets/')) {
    return 'public, max-age=31536000, immutable'
  }
  if (ext === '.html') return 'no-cache'
  if (['.mp4', '.mp3', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.woff', '.woff2'].includes(ext)) {
    return 'public, max-age=604800'
  }
  return 'public, max-age=3600'
}

async function sendFile(res, filePath, urlPath, req) {
  const ext = path.extname(filePath).toLowerCase()
  const stat = fs.statSync(filePath)

  res.statusCode = 200
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  res.setHeader('Cache-Control', cacheControl(urlPath, ext))
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (COMPRESSIBLE.has(ext) && wantsGzip(req) && stat.size > 512) {
    res.setHeader('Content-Encoding', 'gzip')
    res.setHeader('Vary', 'Accept-Encoding')
    await pipeline(fs.createReadStream(filePath), zlib.createGzip({ level: 6 }), res)
    return
  }

  res.setHeader('Content-Length', stat.size)
  await pipeline(fs.createReadStream(filePath), res)
}

function resolveFile(urlPath) {
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const rel = safe === path.sep || safe === '/' ? 'index.html' : safe.replace(/^\//, '')
  const candidate = path.join(DIST, rel)
  if (!candidate.startsWith(DIST)) return null
  try {
    const stat = fs.statSync(candidate)
    if (stat.isFile()) return candidate
  } catch {
    /* missing */
  }
  return null
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' })
      res.end('ok')
      return
    }

    if (handleOrdersApi(req, res)) return

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end('Method not allowed')
      return
    }

    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    let filePath = resolveFile(urlPath)

    if (!filePath) {
      filePath = resolveFile('/index.html')
    }

    if (!filePath) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    if (req.method === 'HEAD') {
      const ext = path.extname(filePath).toLowerCase()
      const stat = fs.statSync(filePath)
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': cacheControl(urlPath, ext),
      })
      res.end()
      return
    }

    await sendFile(res, filePath, urlPath, req)
  } catch {
    if (!res.headersSent) {
      res.writeHead(500)
      res.end('Server error')
    }
  }
})

server.keepAliveTimeout = 65000
server.headersTimeout = 66000

server.listen(PORT, () => {
  console.log(`WRAAAP listening on :${PORT}`)
})
