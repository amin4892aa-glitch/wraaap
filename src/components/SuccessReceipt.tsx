import { Paper } from 'paperlab'
import './SuccessReceipt.css'

type Props = {
  name: string
  id: string
  totalLabel: string
}

export function SuccessReceipt({ name, id, totalLabel }: Props) {
  return (
    <div className="success-receipt">
      <Paper
        stock="thermal"
        sheet={{ width: 1, height: 1.8, thickness: 0.25 }}
        content={{
          type: 'receipt',
          store: 'WRAAAP',
          address: name,
          items: [
            { name: 'Bestellung angenommen', price: 0 },
            { name: 'An Küche gesendet', price: 0 },
          ],
          taxRate: 0,
          barcode: true,
          footer: `${id} · ${totalLabel}`,
        }}
        behavior={{ type: 'unroll', progress: 0.95, tightness: 0.4, sway: 0.2 }}
        surface={{ deckle: { edges: ['bottom'], roughness: 0.5 } }}
        scene={{ lighting: 'raking' }}
        autoplay
        interactive
      />
    </div>
  )
}
