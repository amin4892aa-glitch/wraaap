# WRAAAP

Rezeptseite für cremige Puten-Wraps. Mausbewegung hinterlässt Burrito-Emojis, oben läuft der WRAAAAPS-Wellentext.

## Lokal starten

```bash
npm install
npm run dev
```

## Auf Render hosten (empfohlen)

**Static Site** `wraaap` + **Web Service** `wraaap-api` — siehe `render.yaml`.

- Frontend: CDN-static, kein Node-Lag beim Laden
- API: `https://wraaap-api.onrender.com` (Orders zwischen Geräten)
- Lokal: `npm run dev` (Vite + `/api/orders` inline)

Falls du noch den alten **einen** Web Service hast: in Render Blueprint neu deployen oder manuell auf Static Site umstellen und `VITE_API_BASE=https://wraaap-api.onrender.com` beim Build setzen.
