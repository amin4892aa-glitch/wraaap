export type StoreId = 'migros' | 'coop' | 'denner' | 'aldi' | 'lidl' | 'custom'

export type Offer = {
  id: string
  store: StoreId
  name: string
  packLabel: string
  packSize: number
  price: number
  containsNuts?: boolean
}

export type Category = {
  id: string
  title: string
  unit: string
  packWord: string
  listAmount: number
  hint: string
  offers: Offer[]
}

export const STORES: Record<StoreId, string> = {
  migros: 'Migros',
  coop: 'Coop',
  denner: 'Denner',
  aldi: 'Aldi',
  lidl: 'Lidl',
  custom: 'Eigenes',
}

/** Exact notebook list · Einkauf bei Aldi */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'wraps',
    title: 'Tortilla-Wraps',
    unit: 'Stück',
    packWord: 'Packungen',
    listAmount: 30,
    hint: 'Laut Liste: 30 Stück (~6 Pack.) · Vollkorn oder Weizen',
    offers: [
      { id: 'aldi-wraps', store: 'aldi', name: 'American Tortilla-Wrap', packLabel: '8 Stück', packSize: 8, price: 1.99 },
      { id: 'lidl-wraps', store: 'lidl', name: 'Snack Day Tortilla Wraps', packLabel: '6 Stück', packSize: 6, price: 1.49 },
      { id: 'coop-wraps', store: 'coop', name: 'Prix Garantie Tortillas', packLabel: '12 Stück', packSize: 12, price: 2.0 },
      { id: 'migros-wraps', store: 'migros', name: 'M-Budget Tortillas', packLabel: '8 Stück', packSize: 8, price: 2.1 },
    ],
  },
  {
    id: 'turkey-slices',
    title: 'Putenbrust-Aufschnitt',
    unit: 'Packungen',
    packWord: 'Packungen',
    listAmount: 3,
    hint: 'Laut Liste: 3 Packungen',
    offers: [
      { id: 'aldi-ponnath', store: 'aldi', name: 'Ponnath Trutenbrust', packLabel: '100–150 g', packSize: 1, price: 1.69 },
      { id: 'migros-donpollo', store: 'migros', name: 'Don Pollo Trutenbrust', packLabel: '150 g', packSize: 1, price: 2.95 },
      { id: 'denner-truten', store: 'denner', name: 'Denner Trutenbrust', packLabel: '150 g', packSize: 1, price: 2.95 },
      { id: 'coop-truten', store: 'coop', name: 'Qualité & Prix Trutenbrust', packLabel: '110 g', packSize: 1, price: 3.95 },
    ],
  },
  {
    id: 'salad',
    title: 'Salat',
    unit: 'Köpfe',
    packWord: 'Köpfe',
    listAmount: 1,
    hint: 'Laut Liste: 1× Kopf · Messer mitbringen',
    offers: [
      { id: 'aldi-kopf', store: 'aldi', name: 'Schweizer Kopfsalat', packLabel: '1 Stück', packSize: 1, price: 1.79 },
      { id: 'lidl-kopf', store: 'lidl', name: 'Kopfsalat', packLabel: '1 Stück', packSize: 1, price: 1.49 },
      { id: 'migros-kopf', store: 'migros', name: 'Kopfsalat', packLabel: '1 Stück', packSize: 1, price: 1.8 },
      { id: 'coop-kopf', store: 'coop', name: 'Kopfsalat', packLabel: '1 Stück', packSize: 1, price: 1.95 },
    ],
  },
  {
    id: 'grated',
    title: 'Geriebener Käse',
    unit: 'Packungen',
    packWord: 'Packungen',
    listAmount: 2,
    hint: 'Laut Liste: max. 2 Packungen',
    offers: [
      { id: 'aldi-reib', store: 'aldi', name: 'Aldi Reibkäse', packLabel: '250 g', packSize: 1, price: 2.49 },
      { id: 'lidl-reib', store: 'lidl', name: 'Lidl Reibkäse', packLabel: '250 g', packSize: 1, price: 2.29 },
      { id: 'coop-reib', store: 'coop', name: 'Prix Garantie Reibkäse', packLabel: '250 g', packSize: 1, price: 2.5 },
      { id: 'migros-reib', store: 'migros', name: 'M-Budget Reibkäse', packLabel: '250 g', packSize: 1, price: 2.7 },
    ],
  },
  {
    id: 'plates',
    title: 'Papp-Teller',
    unit: 'Stück',
    packWord: 'Packungen',
    listAmount: 20,
    hint: 'Laut Liste: 20 Stück',
    offers: [
      { id: 'aldi-teller', store: 'aldi', name: 'Aldi Papierteller', packLabel: '20 Stück', packSize: 20, price: 1.89 },
      { id: 'lidl-teller', store: 'lidl', name: 'Lidl Papierteller', packLabel: '20 Stück', packSize: 20, price: 1.79 },
      { id: 'migros-teller', store: 'migros', name: 'M-Budget Papierteller', packLabel: '20 Stück', packSize: 20, price: 1.95 },
      { id: 'coop-teller', store: 'coop', name: 'Prix Garantie Teller', packLabel: '20 Stück', packSize: 20, price: 2.2 },
    ],
  },
  {
    id: 'napkins',
    title: 'Servietten',
    unit: 'Packungen',
    packWord: 'Packungen',
    listAmount: 1,
    hint: 'Laut Liste: 1 Packung',
    offers: [
      { id: 'aldi-serv', store: 'aldi', name: 'Aldi Servietten', packLabel: '100 Stück', packSize: 1, price: 0.89 },
      { id: 'lidl-serv', store: 'lidl', name: 'Lidl Servietten', packLabel: '100 Stück', packSize: 1, price: 0.79 },
      { id: 'migros-serv', store: 'migros', name: 'M-Budget Servietten', packLabel: '100 Stück', packSize: 1, price: 0.95 },
      { id: 'coop-serv', store: 'coop', name: 'Prix Garantie Servietten', packLabel: '100 Stück', packSize: 1, price: 0.95 },
    ],
  },
  {
    id: 'corn',
    title: 'Maisbüchsen',
    unit: 'Dosen',
    packWord: 'Dosen',
    listAmount: 4,
    hint: 'Laut Liste: 3–4 Dosen',
    offers: [
      { id: 'aldi-mais', store: 'aldi', name: 'Aldi Zuckermais', packLabel: 'Dose', packSize: 1, price: 0.79 },
      { id: 'lidl-mais', store: 'lidl', name: 'Lidl Zuckermais', packLabel: 'Dose', packSize: 1, price: 0.75 },
      { id: 'coop-mais', store: 'coop', name: 'Prix Garantie Mais', packLabel: 'Dose', packSize: 1, price: 0.85 },
      { id: 'migros-mais', store: 'migros', name: 'M-Classic Mais', packLabel: 'Dose', packSize: 1, price: 1.1 },
    ],
  },
  {
    id: 'cheese',
    title: 'Frischkäse',
    unit: 'Packungen',
    packWord: 'Packungen',
    listAmount: 3,
    hint: 'Laut Liste: 3 Packungen',
    offers: [
      { id: 'aldi-fk', store: 'aldi', name: 'Aldi Frischkäse', packLabel: '300 g', packSize: 1, price: 1.49 },
      { id: 'lidl-fk', store: 'lidl', name: 'Lidl Frischkäse Nature', packLabel: '300 g', packSize: 1, price: 1.49 },
      { id: 'migros-fk', store: 'migros', name: 'M-Budget Frischkäse', packLabel: '300 g', packSize: 1, price: 1.5 },
      { id: 'coop-fk', store: 'coop', name: 'Prix Garantie Frischkäse', packLabel: '300 g', packSize: 1, price: 1.5 },
    ],
  },
  {
    id: 'avocado',
    title: 'Avocado',
    unit: 'Stück',
    packWord: 'Stück',
    listAmount: 5,
    hint: 'Laut Liste: 4–5 Stück',
    offers: [
      { id: 'aldi-avo', store: 'aldi', name: 'Aldi Avocado', packLabel: '1 Stück', packSize: 1, price: 1.19 },
      { id: 'lidl-avo', store: 'lidl', name: 'Lidl Avocado', packLabel: '1 Stück', packSize: 1, price: 0.99 },
      { id: 'migros-avo', store: 'migros', name: 'Migros Avocado', packLabel: '1 Stück', packSize: 1, price: 1.3 },
      { id: 'coop-avo', store: 'coop', name: 'Coop Avocado', packLabel: '1 Stück', packSize: 1, price: 1.45 },
    ],
  },
  {
    id: 'onion',
    title: 'Zwiebel',
    unit: 'Stück',
    packWord: 'Stück',
    listAmount: 4,
    hint: 'Laut Liste: 4 Stück',
    offers: [
      { id: 'aldi-zwiebel', store: 'aldi', name: 'Zwiebeln', packLabel: '1 Stück', packSize: 1, price: 0.35 },
      { id: 'lidl-zwiebel', store: 'lidl', name: 'Zwiebeln', packLabel: '1 Stück', packSize: 1, price: 0.39 },
      { id: 'migros-zwiebel', store: 'migros', name: 'Zwiebeln', packLabel: '1 Stück', packSize: 1, price: 0.45 },
      { id: 'coop-zwiebel', store: 'coop', name: 'Zwiebeln', packLabel: '1 Stück', packSize: 1, price: 0.5 },
    ],
  },
  {
    id: 'tomato',
    title: 'Tomaten',
    unit: 'Stück',
    packWord: 'Stück',
    listAmount: 2,
    hint: 'Laut Liste: 2 Stück',
    offers: [
      { id: 'aldi-tomate', store: 'aldi', name: 'Tomaten', packLabel: '1 Stück', packSize: 1, price: 0.55 },
      { id: 'lidl-tomate', store: 'lidl', name: 'Tomaten', packLabel: '1 Stück', packSize: 1, price: 0.59 },
      { id: 'migros-tomate', store: 'migros', name: 'Tomaten', packLabel: '1 Stück', packSize: 1, price: 0.7 },
      { id: 'coop-tomate', store: 'coop', name: 'Tomaten', packLabel: '1 Stück', packSize: 1, price: 0.75 },
    ],
  },
  {
    id: 'pepper',
    title: 'Paprika',
    unit: 'Stück',
    packWord: 'Stück',
    listAmount: 4,
    hint: 'Laut Liste: 3–4 Stück',
    offers: [
      { id: 'aldi-paprika', store: 'aldi', name: 'Paprika', packLabel: '1 Stück', packSize: 1, price: 0.99 },
      { id: 'lidl-paprika', store: 'lidl', name: 'Paprika', packLabel: '1 Stück', packSize: 1, price: 1.09 },
      { id: 'migros-paprika', store: 'migros', name: 'Paprika', packLabel: '1 Stück', packSize: 1, price: 1.3 },
      { id: 'coop-paprika', store: 'coop', name: 'Paprika', packLabel: '1 Stück', packSize: 1, price: 1.4 },
    ],
  },
  {
    id: 'turkey-meat',
    title: 'Putenbrust (Fleisch)',
    unit: 'Packungen',
    packWord: 'Packungen',
    listAmount: 4,
    hint: 'Laut Liste: 3–5 × 500 g',
    offers: [
      { id: 'aldi-pute500', store: 'aldi', name: 'Aldi Putenbrust', packLabel: '500 g', packSize: 1, price: 7.49 },
      { id: 'lidl-pute500', store: 'lidl', name: 'Lidl Putenbrust', packLabel: '500 g', packSize: 1, price: 7.99 },
      { id: 'migros-pute500', store: 'migros', name: 'Migros Putenbrust', packLabel: '500 g', packSize: 1, price: 9.5 },
      { id: 'coop-pute500', store: 'coop', name: 'Coop Putenbrust', packLabel: '500 g', packSize: 1, price: 9.95 },
    ],
  },
  {
    id: 'ketchup',
    title: 'Ketchup',
    unit: 'Flaschen',
    packWord: 'Flaschen',
    listAmount: 1,
    hint: 'Laut Liste: 1 Flasche',
    offers: [
      { id: 'aldi-ketchup', store: 'aldi', name: 'Aldi Ketchup', packLabel: '500 ml', packSize: 1, price: 0.79 },
      { id: 'coop-ketchup', store: 'coop', name: 'Prix Garantie Ketchup', packLabel: '440 ml', packSize: 1, price: 0.45 },
      { id: 'migros-ketchup', store: 'migros', name: 'M-Budget Ketchup', packLabel: '800 ml', packSize: 1, price: 0.8 },
      { id: 'lidl-ketchup', store: 'lidl', name: 'Lidl Ketchup', packLabel: '1000 ml', packSize: 1, price: 0.99 },
    ],
  },
  {
    id: 'mustard',
    title: 'Senf',
    unit: 'Tuben',
    packWord: 'Tuben',
    listAmount: 1,
    hint: 'Laut Liste: 1 Tube',
    offers: [
      { id: 'aldi-senf', store: 'aldi', name: 'Aldi Senf', packLabel: '250 g', packSize: 1, price: 0.89 },
      { id: 'migros-senf', store: 'migros', name: 'M-Budget Senf', packLabel: '300 g', packSize: 1, price: 0.95 },
      { id: 'coop-senf', store: 'coop', name: 'Prix Garantie Senf', packLabel: '300 g', packSize: 1, price: 0.95 },
      { id: 'thomy-senf', store: 'migros', name: 'Thomy Senf mild', packLabel: '200 g', packSize: 1, price: 1.95 },
    ],
  },
  {
    id: 'sambal',
    title: 'Sambal Oelek',
    unit: 'Gläser',
    packWord: 'Gläser',
    listAmount: 1,
    hint: 'Laut Liste: 1 Glas',
    offers: [
      { id: 'aldi-sambal', store: 'aldi', name: 'Aldi Sambal Oelek', packLabel: '200 g', packSize: 1, price: 1.99 },
      { id: 'migros-sambal', store: 'migros', name: 'Tiger Kitchen Sambal', packLabel: '100 g', packSize: 1, price: 1.8 },
      { id: 'coop-sambal', store: 'coop', name: 'Conimex Sambal Oelek', packLabel: '190 g', packSize: 1, price: 4.6 },
      { id: 'denner-sambal', store: 'denner', name: 'Avopri Sambal Oelek', packLabel: '360 g', packSize: 1, price: 5.3 },
    ],
  },
  {
    id: 'lemon',
    title: 'Zitrone',
    unit: 'Stück',
    packWord: 'Stück',
    listAmount: 3,
    hint: 'Laut Liste: 3 Stück für Schnitzwasser',
    offers: [
      { id: 'aldi-zitrone', store: 'aldi', name: 'Zitrone', packLabel: '1 Stück', packSize: 1, price: 0.49 },
      { id: 'lidl-zitrone', store: 'lidl', name: 'Zitrone', packLabel: '1 Stück', packSize: 1, price: 0.55 },
      { id: 'migros-zitrone', store: 'migros', name: 'Zitrone', packLabel: '1 Stück', packSize: 1, price: 0.65 },
      { id: 'coop-zitrone', store: 'coop', name: 'Zitrone', packLabel: '1 Stück', packSize: 1, price: 0.7 },
    ],
  },
  {
    id: 'syrup',
    title: 'Holundersirup',
    unit: 'Flaschen',
    packWord: 'Flaschen',
    listAmount: 1,
    hint: 'Laut Liste: 1 Flasche · Mojito / Schnitzwasser',
    offers: [
      { id: 'aldi-sirup', store: 'aldi', name: 'Aldi Holunderblütensirup', packLabel: '500 ml', packSize: 1, price: 3.99 },
      { id: 'lidl-sirup', store: 'lidl', name: 'Lidl Holunderblütensirup', packLabel: '500 ml', packSize: 1, price: 3.99 },
      { id: 'migros-sirup', store: 'migros', name: 'Holunderblüten-Sirup', packLabel: '500 ml', packSize: 1, price: 5.9 },
      { id: 'coop-sirup', store: 'coop', name: 'Coop Holunderblütensirup', packLabel: '500 ml', packSize: 1, price: 5.95 },
    ],
  },
  {
    id: 'mint',
    title: 'Minze',
    unit: 'Töpfe',
    packWord: 'Töpfe',
    listAmount: 1,
    hint: 'Laut Liste: für die Getränke',
    offers: [
      { id: 'aldi-minze', store: 'aldi', name: 'Frische Minze', packLabel: '1 Topf/Bund', packSize: 1, price: 1.49 },
      { id: 'lidl-minze', store: 'lidl', name: 'Frische Minze', packLabel: '1 Topf/Bund', packSize: 1, price: 1.59 },
      { id: 'migros-minze', store: 'migros', name: 'Frische Minze', packLabel: '1 Topf', packSize: 1, price: 1.95 },
      { id: 'coop-minze', store: 'coop', name: 'Frische Minze', packLabel: '1 Topf', packSize: 1, price: 2.2 },
    ],
  },
]

export function money(value: number) {
  return `CHF ${value.toFixed(2)}`
}

export function packsNeeded(amount: number, packSize: number) {
  if (amount <= 0) return 0
  return Math.max(1, Math.ceil(amount / packSize))
}

export function cheapestOffer(offers: Offer[], amount: number) {
  return offers.reduce((best, offer) => {
    const cost = packsNeeded(amount, offer.packSize) * offer.price
    const bestCost = packsNeeded(amount, best.packSize) * best.price
    return cost < bestCost ? offer : best
  })
}

/** Prefer Aldi (notebook says Aldi), otherwise cheapest */
export function preferredOffer(offers: Offer[], amount: number, preferStore: StoreId = 'aldi') {
  const inStore = offers.filter((offer) => offer.store === preferStore)
  if (inStore.length) return cheapestOffer(inStore, amount)
  return cheapestOffer(offers, amount)
}
