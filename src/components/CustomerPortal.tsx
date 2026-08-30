import { useMemo, useState, type FormEvent } from 'react'
import { addOrder } from '../data/orders'
import {
  DEFAULT_WRAP_LAYERS,
  LAYER_PHOTOS,
  WRAP_LAYERS,
  WRAP_PAINTS,
  layerLabels,
  type WrapLayerId,
} from '../data/wrapDesign'
import './CustomerPortal.css'

const SHELL = WRAP_PAINTS[0]

type CategoryId = 'wraps' | 'protein' | 'veggie' | 'sauce' | 'extras'

type MenuItem = {
  id: string
  category: CategoryId
  filter: string
  name: string
  blurb: string
  photo: string
  popular?: boolean
  layers?: WrapLayerId[]
  layerId?: WrapLayerId
  color: string
}

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'wraps', label: 'Wraps', icon: '◎' },
  { id: 'protein', label: 'Protein', icon: '▣' },
  { id: 'veggie', label: 'Veggie', icon: '❀' },
  { id: 'sauce', label: 'Sauce', icon: '≈' },
  { id: 'extras', label: 'Extras', icon: '+' },
]

const FILTERS: Record<CategoryId, string[]> = {
  wraps: ['All', 'Creamy', 'Sharp', 'Green', 'Heat'],
  protein: ['All'],
  veggie: ['All'],
  sauce: ['All'],
  extras: ['All'],
}

const MENU: MenuItem[] = [
  {
    id: 'classic',
    category: 'wraps',
    filter: 'Creamy',
    name: 'Classic Cream',
    blurb: 'Frischkäse · Pute · Salat',
    photo: '/menu/classic.jpg',
    popular: true,
    layers: ['tortilla', 'frischkaese', 'pute', 'salat', 'avocado'],
    color: '#e8c39a',
  },
  {
    id: 'heatwave',
    category: 'wraps',
    filter: 'Sharp',
    name: 'Heat Wave',
    blurb: 'Sambal · Zwiebel · Pute',
    photo: '/menu/heatwave.jpg',
    popular: true,
    layers: ['tortilla', 'frischkaese', 'pute', 'sambal', 'zwiebel'],
    color: '#c43b2a',
  },
  {
    id: 'garden',
    category: 'wraps',
    filter: 'Green',
    name: 'Garden Glow',
    blurb: 'Avocado · Mais · Salat',
    photo: '/menu/garden.jpg',
    layers: ['tortilla', 'salat', 'avocado', 'mais', 'frischkaese'],
    color: '#8fb85a',
  },
  {
    id: 'sunset',
    category: 'wraps',
    filter: 'Heat',
    name: 'Sunset Roll',
    blurb: 'Paprika · Tomate · Pute',
    photo: '/menu/sunset.jpg',
    layers: ['tortilla', 'paprika', 'tomate', 'pute', 'frischkaese'],
    color: '#e07a3a',
  },
  {
    id: 'noir',
    category: 'wraps',
    filter: 'Creamy',
    name: 'Noir',
    blurb: 'Pute · Zwiebel · Frischkäse',
    photo: '/menu/noir.jpg',
    layers: ['tortilla', 'pute', 'zwiebel', 'frischkaese'],
    color: '#2a2a2a',
  },
  {
    id: 'rosa',
    category: 'wraps',
    filter: 'Creamy',
    name: 'Rosa Soft',
    blurb: 'Frischkäse · Tomate · Salat',
    photo: '/menu/rosa.jpg',
    layers: ['tortilla', 'frischkaese', 'tomate', 'salat'],
    color: '#f2b6c6',
  },
  {
    id: 'layer-pute',
    category: 'protein',
    filter: 'All',
    name: 'Putenbrust',
    blurb: 'Add protein',
    photo: '/menu/pute.jpg',
    layerId: 'pute',
    color: '#e8a090',
  },
  {
    id: 'layer-salat',
    category: 'veggie',
    filter: 'All',
    name: 'Salat',
    blurb: 'Crisp leaves',
    photo: '/menu/salat.jpg',
    layerId: 'salat',
    color: '#8fb85a',
  },
  {
    id: 'layer-mais',
    category: 'veggie',
    filter: 'All',
    name: 'Mais',
    blurb: 'Sweet corn',
    photo: '/menu/mais.jpg',
    layerId: 'mais',
    color: '#f2d27a',
  },
  {
    id: 'layer-avocado',
    category: 'veggie',
    filter: 'All',
    name: 'Avocado',
    blurb: 'Creamy green',
    photo: '/menu/avocado.png',
    popular: true,
    layerId: 'avocado',
    color: '#6b8f3d',
  },
  {
    id: 'layer-paprika',
    category: 'veggie',
    filter: 'All',
    name: 'Paprika',
    blurb: 'Crunch',
    photo: '/menu/paprika.jpg',
    layerId: 'paprika',
    color: '#d85a42',
  },
  {
    id: 'layer-tomate',
    category: 'veggie',
    filter: 'All',
    name: 'Tomate',
    blurb: 'Fresh cut',
    photo: '/menu/tomate.jpg',
    layerId: 'tomate',
    color: '#c43b2a',
  },
  {
    id: 'layer-zwiebel',
    category: 'veggie',
    filter: 'All',
    name: 'Zwiebel',
    blurb: 'Bite',
    photo: '/menu/zwiebel.jpg',
    layerId: 'zwiebel',
    color: '#c9a0d4',
  },
  {
    id: 'layer-frisch',
    category: 'sauce',
    filter: 'All',
    name: 'Frischkäse',
    blurb: 'Base cream',
    photo: '/menu/frischkaese.jpg',
    popular: true,
    layerId: 'frischkaese',
    color: '#f5f0e6',
  },
  {
    id: 'layer-sambal',
    category: 'sauce',
    filter: 'All',
    name: 'Sambal',
    blurb: 'Heat',
    photo: '/menu/sambal.jpg',
    layerId: 'sambal',
    color: '#b33a28',
  },
  {
    id: 'extra-note',
    category: 'extras',
    filter: 'All',
    name: 'Extra note',
    blurb: 'Tell the kitchen',
    photo: '/menu/note.jpg',
    color: '#ffffff',
  },
]

type Props = {
  onHome: () => void
  onLounge: (orderId: string) => void
}

export function CustomerPortal({ onHome, onLounge }: Props) {
  const [category, setCategory] = useState<CategoryId>('wraps')
  const [filter, setFilter] = useState('All')
  const [layers, setLayers] = useState<WrapLayerId[]>(DEFAULT_WRAP_LAYERS)
  const [wrapName, setWrapName] = useState('Classic Cream')
  const [bagCount, setBagCount] = useState(0)
  const [showOrder, setShowOrder] = useState(false)
  const [name, setName] = useState('')
  const [when, setWhen] = useState('')
  const [note, setNote] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)

  const labels = useMemo(() => layerLabels(layers), [layers])

  const orderLines = useMemo(() => {
    return WRAP_LAYERS.filter((layer) => layers.includes(layer.id)).map((layer) => ({
      ...layer,
      photo: LAYER_PHOTOS[layer.id],
    }))
  }, [layers])

  const items = useMemo(() => {
    return MENU.filter((item) => {
      if (item.category !== category) return false
      if (filter !== 'All' && item.filter !== filter) return false
      return true
    })
  }, [category, filter])

  const categoryLabel = CATEGORIES.find((item) => item.id === category)?.label || 'Wraps'

  function selectCategory(id: CategoryId) {
    setCategory(id)
    setFilter('All')
  }

  function pickItem(item: MenuItem) {
    if (item.layers) {
      setLayers(item.layers)
      setWrapName(item.name)
      setBagCount((count) => Math.max(1, count))
      return
    }
    if (item.layerId) {
      const meta = WRAP_LAYERS.find((layer) => layer.id === item.layerId)
      if (meta?.required) return
      setLayers((prev) =>
        prev.includes(item.layerId!)
          ? prev.filter((id) => id !== item.layerId)
          : [...prev, item.layerId!],
      )
      setBagCount((count) => Math.max(1, count))
      return
    }
    if (item.id === 'extra-note') {
      setShowOrder(true)
    }
  }

  function removeLayer(id: WrapLayerId) {
    const meta = WRAP_LAYERS.find((layer) => layer.id === id)
    if (meta?.required) return
    setLayers((prev) => prev.filter((layerId) => layerId !== id))
  }

  function startOver() {
    setLayers(DEFAULT_WRAP_LAYERS)
    setWrapName('Classic Cream')
    setBagCount(0)
    setShowOrder(false)
    setDoneId(null)
    setCategory('wraps')
    setFilter('All')
    setName('')
    setWhen('')
    setNote('')
  }

  function isSelected(item: MenuItem) {
    if (item.layers) return wrapName === item.name
    if (item.layerId) return layers.includes(item.layerId)
    return false
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    const id = `WRAAAP-${Date.now().toString(36).toUpperCase()}`
    addOrder({
      id,
      createdAt: new Date().toISOString(),
      status: 'neu',
      source: 'customer',
      customer: { name: name.trim(), email: '', phone: '', when, note },
      portions: 1,
      store: 'aldi',
      total: 0,
      nutFree: true,
      items: labels.map((label) => ({
        store: 'aldi',
        name: label,
        packs: 1,
        subtotal: 0,
        storeLabel: 'Design',
      })),
      wrapDesign: {
        paintId: SHELL.id,
        paintLabel: SHELL.label,
        layers,
        layerLabels: labels,
      },
    })
    setDoneId(id)
    setShowOrder(false)
    setBagCount(0)
    window.setTimeout(() => onLounge(id), 450)
  }

  return (
    <div className="kiosk zine">
      <div className="zine-noise" aria-hidden />
      <aside className="kiosk-nav" aria-label="Kategorien">
        <button type="button" className="kiosk-brand" onClick={onHome}>
          WRAAAP
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`kiosk-nav-item ${category === item.id ? 'active' : ''}`}
            onClick={() => selectCategory(item.id)}
          >
            <span className="kiosk-nav-icon" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="kiosk-main">
        <header className="kiosk-head">
          <p className="zine-stamp">LIVE · ORDER</p>
          <h1>
            <span className="zine-slash">/</span>
            {categoryLabel}
          </h1>
          <div className="kiosk-filters">
            {FILTERS[category].map((chip) => (
              <button
                key={chip}
                type="button"
                className={filter === chip ? 'active' : ''}
                onClick={() => setFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="kiosk-banner">
            <strong>BUILD YOUR WRAP</strong>
            <span>pick photos · stack layers · no prices · kitchen gets the scrap</span>
          </div>
        </header>

        <div className="kiosk-grid">
          {items.map((item, index) => {
            const selected = isSelected(item)
            return (
              <button
                key={item.id}
                type="button"
                className={`kiosk-card tilt-${index % 5} ${selected ? 'selected' : ''}`}
                onClick={() => pickItem(item)}
              >
                {item.popular && <span className="kiosk-tag">HOT</span>}
                <div
                  className="kiosk-card-art"
                  style={{ ['--ink' as string]: item.color }}
                >
                  <img src={item.photo} alt="" loading="lazy" />
                  <div className="kiosk-split" aria-hidden>
                    <span className="kiosk-stamp-mark">
                      {selected ? 'IM ZETTEL' : 'DAZU'}
                    </span>
                  </div>
                </div>
                <strong>{item.name}</strong>
                <em>{item.blurb}</em>
                {selected && <span className="kiosk-added">gestempelt</span>}
              </button>
            )
          })}
        </div>
      </main>

      <aside className="kiosk-order" aria-label="Deine Bestellung">
        <p className="kiosk-order-label">YOUR ORDER</p>
        <strong className="zine-hand">{wrapName}</strong>
        <p className="kiosk-order-shell">Tortilla</p>

        <ul className="kiosk-order-list">
          {orderLines.map((line, index) => (
            <li key={line.id} className={`tilt-${index % 5}`}>
              <img src={line.photo} alt="" />
              <div>
                <strong>{line.label}</strong>
                {line.required ? <em>base</em> : <em>layer</em>}
              </div>
              {!line.required && (
                <button type="button" onClick={() => removeLayer(line.id)} aria-label={`${line.label} entfernen`}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>

        <p className="zine-tape">{orderLines.length} auf dem zettel</p>
      </aside>

      <footer className="kiosk-bar">
        <button type="button" className="kiosk-home-pill" onClick={onHome}>
          Portals
        </button>
        <div className="kiosk-bag">
          <span className="kiosk-bag-count">{bagCount || labels.length}</span>
          <div>
            <strong>{wrapName}</strong>
            <em>{labels.length} lagen auf dem zettel</em>
          </div>
        </div>
        <button type="button" className="kiosk-ghost" onClick={startOver}>
          Start Over
        </button>
        <button
          type="button"
          className="kiosk-cta"
          onClick={() => setShowOrder(true)}
          disabled={!layers.length}
        >
          View My Order
        </button>
      </footer>

      {showOrder && (
        <div className="kiosk-sheet" role="dialog" aria-modal="true">
          <form className="kiosk-sheet-card" onSubmit={submit}>
            <div className="kiosk-sheet-head">
              <div>
                <p>My order</p>
                <h2>{wrapName}</h2>
              </div>
              <button type="button" onClick={() => setShowOrder(false)}>
                Close
              </button>
            </div>
            <ul className="kiosk-sheet-photos">
              {orderLines.map((line) => (
                <li key={line.id}>
                  <img src={line.photo} alt="" />
                  <span>{line.label}</span>
                </li>
              ))}
            </ul>
            <p className="kiosk-no-price">No prices on customer — kitchen gets the ticket.</p>
            <label>
              Name *
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label>
              Pickup
              <input
                value={when}
                onChange={(event) => setWhen(event.target.value)}
                placeholder="e.g. 14:30"
              />
            </label>
            <label>
              Note
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="extra sharp…"
              />
            </label>
            <button type="submit" className="kiosk-cta wide">
              Send to kitchen
            </button>
          </form>
        </div>
      )}

      {doneId && (
        <div className="kiosk-done" role="status">
          <strong>Sent · {doneId}</strong>
          <span>Kitchen has your wrap ticket.</span>
          <button type="button" onClick={startOver}>
            New wrap
          </button>
        </div>
      )}
    </div>
  )
}
