# WRAAAP

Rezeptseite für cremige Puten-Wraps. Mausbewegung hinterlässt Burrito-Emojis, oben läuft der WRAAAAPS-Wellentext.

## Lokal starten

```bash
npm install
npm run dev
```

## Auf Render hosten

**Web Service** (Node):

1. Repo verbinden
2. Build: `npm ci && npm run build`
3. Start: `npm start` (`node server.mjs` — static + `/api/orders`)

Bestellungen werden serverseitig geteilt: Phone bestellt → Küche-Laptop sieht den Zettel (Polling ~2s).

Lokal: `npm run dev` (Vite inkl. Orders-API).
