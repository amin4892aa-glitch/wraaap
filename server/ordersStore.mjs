import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'orders.json')

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8')
}

export function readOrders() {
  ensureStore()
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function writeOrders(orders) {
  ensureStore()
  const next = Array.isArray(orders) ? orders.slice(0, 40) : []
  fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}

export function addOrder(order) {
  const next = [order, ...readOrders().filter((item) => item.id !== order.id)].slice(0, 40)
  return writeOrders(next)
}

export function updateOrderStatus(id, status) {
  const next = readOrders().map((order) =>
    order.id === id ? { ...order, status } : order,
  )
  return writeOrders(next)
}

export function removeOrder(id) {
  return writeOrders(readOrders().filter((order) => order.id !== id))
}

export function clearFinishedOrders() {
  return writeOrders(readOrders().filter((order) => order.status !== 'fertig'))
}

/** Node http / Connect-style middleware for /api/orders* */
export function handleOrdersApi(req, res) {
  const url = new URL(req.url || '/', 'http://local')
  if (!url.pathname.startsWith('/api/orders')) return false

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }

  const send = (status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(body))
  }

  const readBody = () =>
    new Promise((resolve, reject) => {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8')
          resolve(raw ? JSON.parse(raw) : {})
        } catch (error) {
          reject(error)
        }
      })
      req.on('error', reject)
    })

  ;(async () => {
    try {
      if (url.pathname === '/api/orders' && req.method === 'GET') {
        send(200, readOrders())
        return
      }

      if (url.pathname === '/api/orders' && req.method === 'POST') {
        const order = await readBody()
        if (!order?.id) {
          send(400, { error: 'missing id' })
          return
        }
        send(201, addOrder(order))
        return
      }

      if (url.pathname === '/api/orders/clear-finished' && req.method === 'POST') {
        send(200, clearFinishedOrders())
        return
      }

      const match = url.pathname.match(/^\/api\/orders\/([^/]+)$/)
      if (match) {
        const id = decodeURIComponent(match[1])
        if (req.method === 'PATCH') {
          const body = await readBody()
          if (!body?.status) {
            send(400, { error: 'missing status' })
            return
          }
          send(200, updateOrderStatus(id, body.status))
          return
        }
        if (req.method === 'DELETE') {
          send(200, removeOrder(id))
          return
        }
      }

      send(404, { error: 'not found' })
    } catch {
      send(500, { error: 'orders api failed' })
    }
  })()

  return true
}
