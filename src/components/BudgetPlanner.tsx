import { Suspense, lazy, useMemo, useState, type FormEvent } from 'react'
import {
  DEFAULT_CATEGORIES,
  STORES,
  cheapestOffer,
  money,
  packsNeeded,
  preferredOffer,
  type Category,
  type Offer,
  type StoreId,
} from '../data/budget'
import { addOrder } from '../data/orders'
import './BudgetPlanner.css'

const SuccessReceipt = lazy(() =>
  import('./SuccessReceipt').then((m) => ({ default: m.SuccessReceipt })),
)

type LineState = {
  amount: number
  offerId: string
  packs: number
}

type FormState = {
  title: string
  unit: string
  amount: string
  store: StoreId
  productName: string
  packLabel: string
  packSize: string
  price: string
}

const emptyForm: FormState = {
  title: '',
  unit: 'Stück',
  amount: '1',
  store: 'aldi',
  productName: '',
  packLabel: '1 Packung',
  packSize: '1',
  price: '',
}

function makeInitialLines(categories: Category[]): Record<string, LineState> {
  const lines: Record<string, LineState> = {}
  categories.forEach((category) => {
    const offer = preferredOffer(category.offers, category.listAmount, 'aldi')
    lines[category.id] = {
      amount: category.listAmount,
      offerId: offer.id,
      packs: packsNeeded(category.listAmount, offer.packSize),
    }
  })
  return lines
}

export function BudgetPlanner({ allowOrder = true }: { allowOrder?: boolean }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [lines, setLines] = useState<Record<string, LineState>>(() =>
    makeInitialLines(DEFAULT_CATEGORIES),
  )
  const [portions, setPortions] = useState(30)
  const [nutFree, setNutFree] = useState(true)
  const [storeFilter, setStoreFilter] = useState<StoreId | 'all'>('aldi')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showOrder, setShowOrder] = useState(false)
  const [orderDone, setOrderDone] = useState<null | {
    id: string
    name: string
    total: number
    items: number
  }>(null)
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    when: '',
    note: '',
  })

  const visibleOffers = (category: Category) =>
    category.offers.filter((offer) => {
      if (nutFree && offer.containsNuts) return false
      if (storeFilter !== 'all' && offer.store !== storeFilter) return false
      return true
    })

  const aldiTotal = useMemo(() => {
    let total = 0
    categories.forEach((category) => {
      const amount = lines[category.id]?.amount ?? category.listAmount
      const aldiOffers = category.offers.filter(
        (offer) => offer.store === 'aldi' && !(nutFree && offer.containsNuts),
      )
      if (!aldiOffers.length) return
      const offer = cheapestOffer(aldiOffers, amount)
      total += packsNeeded(amount, offer.packSize) * offer.price
    })
    return total
  }, [categories, lines, nutFree])

  const totals = useMemo(() => {
    let total = 0
    const byStore: Partial<Record<StoreId, number>> = {}
    const shopping: { store: StoreId; name: string; packs: number; subtotal: number }[] = []

    categories.forEach((category) => {
      const line = lines[category.id]
      if (!line || line.packs <= 0) return
      const offer = category.offers.find((item) => item.id === line.offerId)
      if (!offer) return
      const subtotal = line.packs * offer.price
      total += subtotal
      byStore[offer.store] = (byStore[offer.store] || 0) + subtotal
      shopping.push({
        store: offer.store,
        name: offer.name,
        packs: line.packs,
        subtotal,
      })
    })

    return { total, byStore, shopping }
  }, [categories, lines])

  function updateAmount(categoryId: string, amount: number) {
    const category = categories.find((item) => item.id === categoryId)
    if (!category) return
    const nextAmount = Math.max(0, Math.min(500, amount))
    const current = category.offers.find((item) => item.id === lines[categoryId]?.offerId)
    const pool = visibleOffers(category)
    const fallbackPool = pool.length ? pool : category.offers
    const offer =
      (current && fallbackPool.some((item) => item.id === current.id) ? current : null) ||
      preferredOffer(fallbackPool, nextAmount, storeFilter === 'all' ? 'aldi' : storeFilter)
    setLines((prev) => ({
      ...prev,
      [categoryId]: {
        amount: nextAmount,
        offerId: offer.id,
        packs: packsNeeded(nextAmount, offer.packSize),
      },
    }))
  }

  function updatePacks(categoryId: string, packs: number) {
    setLines((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        packs: Math.max(0, Math.min(80, packs)),
      },
    }))
  }

  function selectOffer(categoryId: string, offerId: string) {
    const category = categories.find((item) => item.id === categoryId)
    const offer = category?.offers.find((item) => item.id === offerId)
    if (!category || !offer) return
    const amount = lines[categoryId]?.amount ?? category.listAmount
    setLines((prev) => ({
      ...prev,
      [categoryId]: {
        amount,
        offerId,
        packs: packsNeeded(amount, offer.packSize),
      },
    }))
  }

  function removeCategory(categoryId: string) {
    setCategories((prev) => prev.filter((item) => item.id !== categoryId))
    setLines((prev) => {
      const next = { ...prev }
      delete next[categoryId]
      return next
    })
  }

  function resetList() {
    setCategories(DEFAULT_CATEGORIES)
    setLines(makeInitialLines(DEFAULT_CATEGORIES))
    setPortions(30)
    setStoreFilter('aldi')
  }

  function chooseCheapest() {
    setLines((prev) => {
      const next = { ...prev }
      categories.forEach((category) => {
        const amount = next[category.id]?.amount ?? category.listAmount
        const offers = visibleOffers(category)
        if (!offers.length) return
        const offer = cheapestOffer(offers, amount)
        next[category.id] = {
          amount,
          offerId: offer.id,
          packs: packsNeeded(amount, offer.packSize),
        }
      })
      return next
    })
  }

  function chooseStore(store: StoreId) {
    setStoreFilter(store)
    setLines((prev) => {
      const next = { ...prev }
      categories.forEach((category) => {
        const amount = next[category.id]?.amount ?? category.listAmount
        const inStore = category.offers.filter(
          (offer) => offer.store === store && !(nutFree && offer.containsNuts),
        )
        if (!inStore.length) return
        const offer = cheapestOffer(inStore, amount)
        next[category.id] = {
          amount,
          offerId: offer.id,
          packs: packsNeeded(amount, offer.packSize),
        }
      })
      return next
    })
  }

  function goAldi() {
    chooseStore('aldi')
  }

  function addProduct(event: FormEvent) {
    event.preventDefault()
    const title = form.title.trim()
    const productName = form.productName.trim() || title
    const price = Number(form.price.replace(',', '.'))
    const amount = Math.max(0, Number(form.amount) || 0)
    const packSize = Math.max(1, Number(form.packSize) || 1)

    if (!title || Number.isNaN(price) || price < 0) return

    const id = `custom-${Date.now()}`
    const offer: Offer = {
      id: `${id}-offer`,
      store: form.store,
      name: productName,
      packLabel: form.packLabel.trim() || '1 Packung',
      packSize,
      price,
    }
    const category: Category = {
      id,
      title,
      unit: form.unit.trim() || 'Stück',
      packWord: 'Packungen',
      listAmount: amount,
      hint: 'Selbst hinzugefügt',
      offers: [offer],
    }

    setCategories((prev) => [...prev, category])
    setLines((prev) => ({
      ...prev,
      [id]: {
        amount,
        offerId: offer.id,
        packs: packsNeeded(amount, packSize),
      },
    }))
    setForm(emptyForm)
    setShowForm(false)
  }

  function placeOrder(event: FormEvent) {
    event.preventDefault()
    if (!totals.shopping.length || !orderForm.name.trim()) return

    const order = {
      id: `WRAAAP-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: 'neu' as const,
      source: 'admin' as const,
      customer: { ...orderForm, name: orderForm.name.trim() },
      portions,
      store: storeFilter,
      total: totals.total,
      items: totals.shopping.map((item) => ({
        ...item,
        storeLabel: STORES[item.store],
      })),
      nutFree,
    }

    void addOrder(order)

    setOrderDone({
      id: order.id,
      name: order.customer.name,
      total: order.total,
      items: order.items.length,
    })
    setShowOrder(false)
    setOrderForm({ name: '', email: '', phone: '', when: '', note: '' })
  }

  function orderText() {
    const linesText = totals.shopping
      .map(
        (item) =>
          `• ${item.packs}× ${item.name} (${STORES[item.store]}) – ${money(item.subtotal)}`,
      )
      .join('\n')
    return [
      `WRAAAP Bestellung${orderDone ? ` ${orderDone.id}` : ''}`,
      `Name: ${orderForm.name || orderDone?.name || ''}`,
      `Personen: ${portions}`,
      `Total: ${money(totals.total)}`,
      '',
      linesText,
      orderForm.note ? `\nNotiz: ${orderForm.note}` : '',
      '\nNussallergie beachten!',
    ]
      .filter(Boolean)
      .join('\n')
  }

  const maxStore = Math.max(...Object.values(totals.byStore), 1)

  return (
    <section className="budget panel" id="budget">
      <div className="budget-head">
        <div>
          <p className="budget-kicker">Aldi-Einkauf · Budget</p>
          <h2>{allowOrder ? 'Wrap-Nachmittag bestellen' : 'Wrap-Nachmittag Budget'}</h2>
          <p className="budget-lede">
            {allowOrder
              ? 'Liste für den Aldi-Einkauf. Mengen anpassen, Produkte adden/entfernen — danach kannst du die Bestellung absenden.'
              : 'Nur Einkauf planen und Preise vergleichen. Bestellen läuft über Customer / Küche — nicht hier.'}
          </p>
        </div>
        <div className="budget-total-card">
          <span>Aldi-Total (geschätzt)</span>
          <strong>{money(storeFilter === 'aldi' ? totals.total : aldiTotal)}</strong>
          <em>
            {money((storeFilter === 'aldi' ? totals.total : aldiTotal) / Math.max(portions, 1))}{' '}
            / Person · {portions} Pers.
          </em>
          {allowOrder && (
            <button
              type="button"
              className="budget-btn primary order-cta"
              disabled={!totals.shopping.length}
              onClick={() => {
                goAldi()
                setShowOrder(true)
              }}
            >
              Jetzt bestellen
            </button>
          )}
        </div>
      </div>

      {allowOrder && orderDone && (
        <div className="order-success" role="status">
          <Suspense fallback={null}>
            <SuccessReceipt
              name={orderDone.name}
              id={orderDone.id}
              totalLabel={money(orderDone.total)}
            />
          </Suspense>
          <div>
            <strong>Bestellung {orderDone.id} ist in der Küche</strong>
            <p>
              Danke {orderDone.name} — {orderDone.items} Positionen ·{' '}
              {money(orderDone.total)}. Unter «Küche · Zettel» flattert der Bon rein.
            </p>
          </div>
          <div className="order-success-actions">
            <a
              className="budget-btn"
              href={`mailto:?subject=${encodeURIComponent(`WRAAAP ${orderDone.id}`)}&body=${encodeURIComponent(orderText())}`}
            >
              Per Mail teilen
            </a>
            <a
              className="budget-btn"
              target="_blank"
              rel="noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(orderText())}`}
            >
              WhatsApp
            </a>
            <button type="button" className="budget-btn" onClick={() => window.print()}>
              Drucken
            </button>
            <button type="button" className="budget-btn" onClick={() => setOrderDone(null)}>
              Schliessen
            </button>
          </div>
        </div>
      )}

      <div className="allergy-bar">
        <strong>Nussallergie!</strong>
        <span>Nusshaltige Angebote können ausgeblendet werden.</span>
        <label>
          <input
            type="checkbox"
            checked={nutFree}
            onChange={(event) => setNutFree(event.target.checked)}
          />
          Nur nussfreie Produkte
        </label>
      </div>

      <div className="budget-toolbar">
        <label className="portions-field">
          Personen
          <input
            type="number"
            min={1}
            max={120}
            value={portions}
            onChange={(event) => setPortions(Math.max(1, Number(event.target.value) || 1))}
          />
        </label>
        <div className="store-filter">
          <button
            type="button"
            className={`budget-btn ${storeFilter === 'aldi' ? 'primary' : ''}`}
            onClick={goAldi}
          >
            Nur Aldi
          </button>
          <button
            type="button"
            className={`budget-btn ${storeFilter === 'all' ? 'primary' : ''}`}
            onClick={() => setStoreFilter('all')}
          >
            Alle Läden
          </button>
        </div>
        <button type="button" className="budget-btn" onClick={chooseCheapest}>
          Günstigste wählen
        </button>
        <button type="button" className="budget-btn" onClick={resetList}>
          Listenmengen
        </button>
        <button
          type="button"
          className="budget-btn add"
          onClick={() => setShowForm((open) => !open)}
        >
          {showForm ? 'Formular schließen' : '+ Produkt hinzufügen'}
        </button>
        {allowOrder && (
          <button
            type="button"
            className="budget-btn primary"
            disabled={!totals.shopping.length}
            onClick={() => setShowOrder(true)}
          >
            Bestellen
          </button>
        )}
      </div>

      {allowOrder && showOrder && (
        <div className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <form className="order-sheet" onSubmit={placeOrder}>
            <div className="order-sheet-head">
              <div>
                <p className="budget-kicker">Checkout</p>
                <h3 id="order-title">Bestellung absenden</h3>
              </div>
              <button type="button" className="budget-btn" onClick={() => setShowOrder(false)}>
                Abbrechen
              </button>
            </div>
            <p className="budget-lede">
              Die Bestellung erscheint sofort als Zettel in der Küche. Du kannst sie
              zusätzlich per Mail/WhatsApp teilen.
            </p>
            <div className="add-grid">
              <label>
                Name *
                <input
                  required
                  value={orderForm.name}
                  onChange={(event) => setOrderForm({ ...orderForm, name: event.target.value })}
                  placeholder="Dein Name"
                />
              </label>
              <label>
                E-Mail
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(event) => setOrderForm({ ...orderForm, email: event.target.value })}
                  placeholder="optional"
                />
              </label>
              <label>
                Telefon
                <input
                  value={orderForm.phone}
                  onChange={(event) => setOrderForm({ ...orderForm, phone: event.target.value })}
                  placeholder="optional"
                />
              </label>
              <label>
                Abholung / Datum
                <input
                  value={orderForm.when}
                  onChange={(event) => setOrderForm({ ...orderForm, when: event.target.value })}
                  placeholder="z. B. Samstag 14:00"
                />
              </label>
              <label className="span-2">
                Notiz
                <input
                  value={orderForm.note}
                  onChange={(event) => setOrderForm({ ...orderForm, note: event.target.value })}
                  placeholder="z. B. Nussallergie, Extra-Senf…"
                />
              </label>
            </div>
            <ul className="shop-list order-preview">
              {totals.shopping.map((item) => (
                <li key={`order-${item.store}-${item.name}`}>
                  <span>
                    {item.packs}× {item.name}
                    <em>{STORES[item.store]}</em>
                  </span>
                  <strong>{money(item.subtotal)}</strong>
                </li>
              ))}
            </ul>
            <div className="order-sheet-foot">
              <strong>Total {money(totals.total)}</strong>
              <button type="submit" className="budget-btn primary">
                Bestellung bestätigen
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <form className="add-form" onSubmit={addProduct}>
          <h3>Neues Produkt</h3>
          <div className="add-grid">
            <label>
              Name
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="z. B. Lyoner"
              />
            </label>
            <label>
              Einheit
              <input
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                placeholder="Stück / Packungen"
              />
            </label>
            <label>
              Menge
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
            </label>
            <label>
              Laden
              <select
                value={form.store}
                onChange={(event) =>
                  setForm({ ...form, store: event.target.value as StoreId })
                }
              >
                {Object.entries(STORES).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Produktname
              <input
                value={form.productName}
                onChange={(event) => setForm({ ...form, productName: event.target.value })}
                placeholder="optional"
              />
            </label>
            <label>
              Packungsinfo
              <input
                value={form.packLabel}
                onChange={(event) => setForm({ ...form, packLabel: event.target.value })}
              />
            </label>
            <label>
              Inhalt pro Packung
              <input
                type="number"
                min={1}
                value={form.packSize}
                onChange={(event) => setForm({ ...form, packSize: event.target.value })}
              />
            </label>
            <label>
              Preis (CHF)
              <input
                required
                inputMode="decimal"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                placeholder="2.50"
              />
            </label>
          </div>
          <div className="add-actions">
            <button type="submit" className="budget-btn primary">
              Hinzufügen
            </button>
            <button
              type="button"
              className="budget-btn"
              onClick={() => {
                setForm(emptyForm)
                setShowForm(false)
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="budget-layout">
        <div className="budget-items">
          {categories.map((category) => {
            const line = lines[category.id]
            if (!line) return null
            const offers = visibleOffers(category)
            const selected =
              offers.find((offer) => offer.id === line.offerId) ||
              category.offers.find((offer) => offer.id === line.offerId)

            return (
              <article key={category.id} className="budget-item">
                <div className="budget-item-head">
                  <div>
                    <h3>{category.title}</h3>
                    <p>{category.hint}</p>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeCategory(category.id)}
                    aria-label={`${category.title} entfernen`}
                  >
                    Entfernen
                  </button>
                </div>

                <div className="qty-row">
                  <label>
                    Menge
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => updateAmount(category.id, line.amount - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={line.amount}
                        onChange={(event) =>
                          updateAmount(category.id, Number(event.target.value) || 0)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => updateAmount(category.id, line.amount + 1)}
                      >
                        +
                      </button>
                      <span>{category.unit}</span>
                    </div>
                  </label>
                  <label>
                    Packungen
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => updatePacks(category.id, line.packs - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={line.packs}
                        onChange={(event) =>
                          updatePacks(category.id, Number(event.target.value) || 0)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => updatePacks(category.id, line.packs + 1)}
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>

                <div className="offer-grid">
                  {offers.map((offer) => {
                    const needed = packsNeeded(line.amount, offer.packSize)
                    const active = offer.id === selected?.id
                    return (
                      <button
                        key={offer.id}
                        type="button"
                        className={`offer ${active ? 'selected' : ''}`}
                        onClick={() => selectOffer(category.id, offer.id)}
                      >
                        <span className={`store-tag ${offer.store}`}>
                          {STORES[offer.store]}
                        </span>
                        {offer.containsNuts && <span className="nut-tag">Nüsse</span>}
                        <strong>{offer.name}</strong>
                        <em>{offer.packLabel}</em>
                        <span className="offer-price">{money(offer.price)}</span>
                        <span className="offer-meta">
                          {needed} {category.packWord} · {money(needed * offer.price)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {selected && (
                  <p className="selected-line">
                    Ausgewählt: {line.packs}× {selected.name} ={' '}
                    {money(line.packs * selected.price)}
                  </p>
                )}
              </article>
            )
          })}

          {!categories.length && (
            <p className="empty-note">
              Keine Produkte mehr. Füge welche hinzu oder lade die Listenmengen.
            </p>
          )}
        </div>

        <aside className="budget-side">
          <div className="side-card">
            <h3>Nach Laden</h3>
            <div className="store-bars">
              {Object.entries(totals.byStore).map(([store, value]) => (
                <div key={store} className="store-bar-row">
                  <span>{STORES[store as StoreId]}</span>
                  <div className="store-bar">
                    <i style={{ width: `${(value / maxStore) * 100}%` }} />
                  </div>
                  <strong>{money(value)}</strong>
                </div>
              ))}
              {!Object.keys(totals.byStore).length && <p>Noch keine Auswahl.</p>}
            </div>
          </div>

          <div className="side-card">
            <h3>Aldi-Einkaufsliste</h3>
            <ul className="shop-list">
              {totals.shopping.map((item) => (
                <li key={`${item.store}-${item.name}`}>
                  <span>
                    {item.packs}× {item.name}
                    <em>{STORES[item.store]}</em>
                  </span>
                  <strong>{money(item.subtotal)}</strong>
                </li>
              ))}
            </ul>
            {allowOrder && (
              <button
                type="button"
                className="budget-btn primary order-side-btn"
                disabled={!totals.shopping.length}
                onClick={() => setShowOrder(true)}
              >
                Bestellen · {money(totals.total)}
              </button>
            )}
          </div>

          <div className="side-card compare">
            <h3>Laden vergleichen</h3>
            {(Object.keys(STORES) as StoreId[])
              .filter((store) => store !== 'custom')
              .map((store) => {
                let total = 0
                let missing = 0
                categories.forEach((category) => {
                  const amount = lines[category.id]?.amount ?? category.listAmount
                  const inStore = category.offers.filter(
                    (offer) =>
                      offer.store === store && !(nutFree && offer.containsNuts),
                  )
                  if (!inStore.length) {
                    missing += 1
                    return
                  }
                  const offer = cheapestOffer(inStore, amount)
                  total += packsNeeded(amount, offer.packSize) * offer.price
                })
                return (
                  <button
                    key={store}
                    type="button"
                    className="compare-btn"
                    onClick={() => chooseStore(store)}
                  >
                    <span>Alles bei {STORES[store]}</span>
                    <span>
                      {money(total)}
                      {missing ? ` · ${missing} fehlt` : ''}
                    </span>
                  </button>
                )
              })}
          </div>

          <p className="budget-note">
Mengen exakt nach deiner Einkaufsliste inkl. Zwiebel, Tomaten, Paprika und
Putenbrust 500 g. Dessert/Tiramisu ist durchgestrichen und nicht dabei.
Richtpreise — Filialpreise können abweichen.
          </p>
        </aside>
      </div>
    </section>
  )
}
