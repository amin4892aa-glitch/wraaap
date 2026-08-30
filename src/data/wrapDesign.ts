export type WrapLayerId =
  | 'tortilla'
  | 'frischkaese'
  | 'pute'
  | 'salat'
  | 'mais'
  | 'avocado'
  | 'paprika'
  | 'tomate'
  | 'zwiebel'
  | 'sambal'

export type WrapLayer = {
  id: WrapLayerId
  label: string
  required?: boolean
  color: string
}

export const WRAP_LAYERS: WrapLayer[] = [
  { id: 'tortilla', label: 'Tortilla', required: true, color: '#e8c39a' },
  { id: 'frischkaese', label: 'Frischkäse', color: '#f5f0e6' },
  { id: 'pute', label: 'Putenbrust', color: '#e8a090' },
  { id: 'salat', label: 'Salat', color: '#8fb85a' },
  { id: 'mais', label: 'Mais', color: '#f2d27a' },
  { id: 'avocado', label: 'Avocado', color: '#6b8f3d' },
  { id: 'paprika', label: 'Paprika', color: '#d85a42' },
  { id: 'tomate', label: 'Tomate', color: '#c43b2a' },
  { id: 'zwiebel', label: 'Zwiebel', color: '#c9a0d4' },
  { id: 'sambal', label: 'Sambal', color: '#b33a28' },
]

export const DEFAULT_WRAP_LAYERS: WrapLayerId[] = [
  'tortilla',
  'frischkaese',
  'pute',
  'salat',
  'avocado',
]

export type WrapDesign = {
  paintId: string
  paintLabel: string
  layers: WrapLayerId[]
  layerLabels: string[]
}

export type WrapPaint = {
  id: string
  label: string
  shell: string
  fill: string
  accent: string
  ring: string
}

export const WRAP_PAINTS: WrapPaint[] = [
  { id: 'cream', label: 'Cream', shell: '#e8c39a', fill: '#8fb85a', accent: '#d85a42', ring: '#ffffff' },
  { id: 'noir', label: 'Noir', shell: '#2a2420', fill: '#3d342c', accent: '#c98d63', ring: '#e8e8e8' },
  { id: 'rosa', label: 'Rosa', shell: '#e8a8b4', fill: '#8fb85a', accent: '#ff4d6d', ring: '#ffd0dc' },
  { id: 'heat', label: 'Heat', shell: '#c45a3a', fill: '#f2d27a', accent: '#ff7a3c', ring: '#ff8a6a' },
  { id: 'paprika', label: 'Paprika', shell: '#d4844a', fill: '#6b8f3d', accent: '#ffb347', ring: '#ffc08a' },
  { id: 'verde', label: 'Verde', shell: '#7a9b4e', fill: '#d85a42', accent: '#c8e6a0', ring: '#b8e08a' },
  { id: 'azure', label: 'Azure', shell: '#5a84c4', fill: '#e8c39a', accent: '#9ad0ff', ring: '#a8d4ff' },
]

export const LAYER_PHOTOS: Record<WrapLayerId, string> = {
  tortilla: '/menu/tortilla.jpg',
  frischkaese: '/menu/frischkaese.jpg',
  pute: '/menu/pute.jpg',
  salat: '/menu/salat.jpg',
  mais: '/menu/mais.jpg',
  avocado: '/menu/avocado.png',
  paprika: '/menu/paprika.jpg',
  tomate: '/menu/tomate.jpg',
  zwiebel: '/menu/zwiebel.jpg',
  sambal: '/menu/sambal.jpg',
}

export function layerLabels(ids: WrapLayerId[]) {
  return WRAP_LAYERS.filter((layer) => ids.includes(layer.id)).map((layer) => layer.label)
}
