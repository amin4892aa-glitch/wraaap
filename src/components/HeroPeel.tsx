import { Paper } from 'paperlab'
import './HeroPeel.css'

export function HeroPeel() {
  return (
    <div className="hero-peel" aria-label="WRAAAP Papier-Intro">
      <Paper
        stock="kraft"
        sheet={{ width: 1.45, height: 1.05, thickness: 0.35 }}
        content={{
          type: 'card',
          title: 'WRAAAP',
          body: 'Budget planen. Bestellen. Küchenzettel fliegen.',
          note: 'Nussallergie · Aldi-Liste · Live an die Küche',
          align: 'center',
          ruled: false,
        }}
        behavior={{ type: 'peel', progress: 0.28 }}
        surface={{ grain: 0.4, deckle: { edges: ['bottom', 'right'], roughness: 0.45 } }}
        scene={{ lighting: 'goldenhour' }}
        physics="breeze"
        interactive
        autoplay
      />
    </div>
  )
}
