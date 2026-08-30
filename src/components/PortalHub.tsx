import './PortalHub.css'

type PortalId = 'customer' | 'kueche' | 'admin'

type Props = {
  onOpen: (portal: PortalId) => void
  onLounge?: () => void
}

const portals: {
  id: PortalId
  title: string
  kicker: string
  body: string
  index: string
}[] = [
  {
    id: 'customer',
    title: 'Customer',
    kicker: 'Build wrap',
    body: 'Stack layers from photos. No prices — kitchen gets the slip.',
    index: '01',
  },
  {
    id: 'kueche',
    title: 'Kitchen',
    kicker: 'Heat stamp',
    body: 'Every roll lands as a ticket. Cook it, stamp it, clear the line.',
    index: '02',
  },
  {
    id: 'admin',
    title: 'Admin',
    kicker: 'Back office',
    body: 'Budgets, prices and the full ledger — staff eyes only.',
    index: '03',
  },
]

/** Slightly wonky oval — felt-marker outline, not a clean vector. */
function MarkerOval({ wide = false }: { wide?: boolean }) {
  if (wide) {
    return (
      <svg
        className="hub-marker-svg"
        viewBox="0 0 640 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          className="hub-marker-stroke"
          d="M100 18
             C220 8, 420 8, 540 18
             C600 28, 628 70, 622 100
             C616 132, 590 172, 540 182
             C420 194, 220 194, 100 182
             C50 172, 14 130, 18 100
             C22 68, 48 28, 100 18 Z"
        />
        <path
          className="hub-marker-stroke hub-marker-bleed"
          d="M104 24
             C222 14, 418 14, 536 24
             C590 34, 616 72, 612 100
             C608 128, 584 166, 536 176
             C418 186, 222 186, 104 176
             C56 166, 24 126, 26 100
             C28 72, 56 34, 104 24 Z"
        />
      </svg>
    )
  }

  return (
    <svg
      className="hub-marker-svg"
      viewBox="0 0 320 180"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className="hub-marker-stroke"
        d="M160 12
           C232 10, 298 38, 306 90
           C314 142, 248 172, 160 168
           C72 164, 8 138, 12 88
           C16 38, 88 14, 160 12 Z"
      />
      <path
        className="hub-marker-stroke hub-marker-bleed"
        d="M160 16
           C228 15, 292 42, 300 90
           C308 138, 244 166, 160 164
           C76 162, 14 134, 18 88
           C22 42, 92 17, 160 16 Z"
      />
    </svg>
  )
}

export function PortalHub({ onOpen, onLounge }: Props) {
  return (
    <div className="hub">
      <div className="hub-noise" aria-hidden />
      <div className="hub-wash" aria-hidden />

      <header className="hub-top">
        <div className="hub-brand">WRAAAP ©2026</div>
        <p>pick a portal</p>
      </header>

      <section className="hub-hero">
        <p className="hub-kicker">Enter a world</p>
        <h1 className="hub-warp">
          <span>HOW TO</span>
          <span>WRAP</span>
        </h1>
        <p className="hub-lede">
          Customer designs, kitchen cooks, admin keeps the numbers — lounge while you wait.
        </p>
      </section>

      <div className="hub-grid">
        {portals.map((portal) => (
          <button
            key={portal.id}
            type="button"
            className={`hub-oval-box hub-${portal.id}`}
            onClick={() => onOpen(portal.id)}
          >
            <MarkerOval />
            <span className="hub-oval-inner">
              <span className="hub-index">{portal.index}</span>
              <em className="hub-tag hub-hl">{portal.kicker}</em>
              <strong className="hub-hl">{portal.title}</strong>
              <p>{portal.body}</p>
              <span className="hub-enter hub-hl">Enter →</span>
            </span>
          </button>
        ))}
      </div>

      {onLounge && (
        <button type="button" className="hub-oval-box hub-lounge" onClick={onLounge}>
          <MarkerOval wide />
          <span className="hub-oval-inner hub-lounge-inner">
            <em className="hub-tag hub-hl">Wait room</em>
            <strong className="hub-hl">Lounge</strong>
            <span className="hub-enter hub-hl">Bandit · chips · auras →</span>
          </span>
        </button>
      )}

      <p className="hub-scroll">Tap an oval</p>
    </div>
  )
}
