import { STATUS_LABEL, orderProgressPercent, type OrderStatus } from '../data/orders'
import './OrderProgressBar.css'

const STEPS: OrderStatus[] = ['neu', 'in_arbeit', 'fertig']

type Props = {
  status?: OrderStatus | null
  variant?: 'lounge' | 'kitchen'
  className?: string
}

export function OrderProgressBar({ status, variant = 'lounge', className = '' }: Props) {
  const pct = orderProgressPercent(status)
  const stepIndex = status ? STEPS.indexOf(status) : -1

  return (
    <div
      className={[
        'order-progress',
        `order-progress-${variant}`,
        status ? `step-${status}` : 'step-void',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label="Order progress"
    >
      <div className="order-progress-track">
        <div className="order-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="order-progress-steps">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className={[
              index < stepIndex ? 'done' : '',
              index === stepIndex ? 'active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {variant === 'kitchen' ? STATUS_LABEL[step] : stepLabel(step)}
          </li>
        ))}
      </ol>
    </div>
  )
}

function stepLabel(status: OrderStatus) {
  if (status === 'neu') return 'Queued'
  if (status === 'in_arbeit') return 'Cooking'
  return 'Done'
}
