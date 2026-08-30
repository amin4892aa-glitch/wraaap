import type { CardRarity, DropCard } from '../data/dropCards'
import { RARITY_META } from '../data/dropCards'
import './WrapPokeCard.css'

const STAGE: Record<CardRarity, string> = {
  common: 'Basic',
  uncommon: 'Basic',
  rare: 'Stage 1',
  epic: 'Stage 1',
  legendary: 'Stage 2',
  mythic: 'EX',
  divine: 'AMV',
}

const HP: Record<CardRarity, number> = {
  common: 40,
  uncommon: 60,
  rare: 90,
  epic: 120,
  legendary: 160,
  mythic: 250,
  divine: 400,
}

const POWER: Record<CardRarity, { name: string; dmg: number }> = {
  common: { name: 'Nibble', dmg: 10 },
  uncommon: { name: 'Crunch', dmg: 30 },
  rare: { name: 'Stack Layers', dmg: 50 },
  epic: { name: 'Heat Wave', dmg: 80 },
  legendary: { name: 'Kitchen Break', dmg: 110 },
  mythic: { name: 'Sol Collapse', dmg: 180 },
  divine: { name: 'Espresso Notice', dmg: 320 },
}

type Props = {
  card: DropCard
  owned?: boolean
  count?: number
  reveal?: boolean
  locked?: boolean
}

export function WrapPokeCard({
  card,
  owned = true,
  count,
  reveal = false,
  locked = false,
}: Props) {
  const meta = RARITY_META[card.rarity]
  const power = POWER[card.rarity]
  const show = owned && !locked

  return (
    <article
      className={[
        'poke-card',
        `rarity-${card.rarity}`,
        reveal ? 'is-reveal' : '',
        locked || !owned ? 'is-locked' : 'is-owned',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ['--rarity' as string]: meta.color,
        ['--glow' as string]: meta.glow,
      }}
    >
      <div className="poke-foil" aria-hidden />
      <header className="poke-top">
        <div>
          <p className="poke-stage">{STAGE[card.rarity]}</p>
          <h3>{show ? card.name : '????'}</h3>
        </div>
        <div className="poke-hp">
          <span>HP</span>
          <strong>{show ? HP[card.rarity] : '??'}</strong>
        </div>
      </header>

      <div className="poke-art-frame">
        <div className="poke-art">
          {show ? <img src={card.art} alt="" /> : <span>?</span>}
        </div>
        <span className="poke-type">
          {card.kind === 'wrap' ? 'WRAP' : 'ING'}
        </span>
      </div>

      <div className="poke-rarity-chip">{meta.label}</div>

      <div className="poke-attack">
        <em>{show ? power.name : '????'}</em>
        <strong>{show ? power.dmg : '??'}</strong>
      </div>

      <p className="poke-flavor">
        {show ? card.blurb : 'An unknown aura waits in the void…'}
      </p>

      <footer className="poke-foot">
        <span>{meta.chanceLabel}</span>
        {typeof count === 'number' && count > 0 && <span>×{count}</span>}
        {reveal && <span>NEW</span>}
      </footer>
    </article>
  )
}
