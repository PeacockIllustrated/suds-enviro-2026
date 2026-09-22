import type { ClockPosition } from '@/lib/types'

/**
 * The chamber clock face, as a diagram.
 *
 * The Webflow product pages build this out of stacked PNGs, one per
 * inlet, with a `highlight` class picking which are lit. Drawing it
 * instead means it stays true to the rule engine, scales without
 * artefacts and weighs nothing.
 *
 * Presentational only - the interactive version the wizard uses is
 * components/wizard/steps/ClockFace.tsx.
 */

/** Inlets are manufactured at these five positions only. */
const INLET_POSITIONS: ClockPosition[] = ['3', '5', '6', '7', '9']

/** The outlet is fixed at 12 o'clock on every chamber. */
const OUTLET_HOUR = 12

const SIZE = 200
const CENTRE = SIZE / 2
const RING = 70
const NODE = 13

function nodeCentre(hour: number): { x: number; y: number } {
  const angle = (hour / 12) * Math.PI * 2
  return {
    x: CENTRE + RING * Math.sin(angle),
    y: CENTRE - RING * Math.cos(angle),
  }
}

interface InletClockProps {
  /** Positions drawn as available on this chamber. */
  available: ClockPosition[]
  /** Accessible description of what the diagram shows. */
  title: string
}

export function InletClock({ available, title }: InletClockProps) {
  const outlet = nodeCentre(OUTLET_HOUR)

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={title}
      className="h-auto w-full max-w-[220px]"
    >
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RING + NODE + 6}
        className="fill-white stroke-site-ui-blue"
        strokeWidth={3}
      />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RING}
        fill="none"
        className="stroke-site-ui-blue"
        strokeWidth={1}
        strokeDasharray="3 5"
      />

      {/* Channels from each available inlet to the centre. */}
      {INLET_POSITIONS.filter((p) => available.includes(p)).map((position) => {
        const { x, y } = nodeCentre(Number(position))
        return (
          <line
            key={`channel-${position}`}
            x1={x}
            y1={y}
            x2={CENTRE}
            y2={CENTRE}
            className="stroke-site-blue-light"
            strokeWidth={5}
            strokeLinecap="round"
          />
        )
      })}

      {/* The outlet channel, always present. */}
      <line
        x1={outlet.x}
        y1={outlet.y}
        x2={CENTRE}
        y2={CENTRE}
        className="stroke-site-ui-green"
        strokeWidth={5}
        strokeLinecap="round"
      />

      <circle cx={CENTRE} cy={CENTRE} r={16} className="fill-site-blue-dark" />

      {INLET_POSITIONS.map((position) => {
        const { x, y } = nodeCentre(Number(position))
        const isAvailable = available.includes(position)
        return (
          <g key={position}>
            <circle
              cx={x}
              cy={y}
              r={NODE}
              className={
                isAvailable
                  ? 'fill-site-blue stroke-white'
                  : 'fill-white stroke-site-ui-blue'
              }
              strokeWidth={2}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className={`text-[11px] font-bold ${
                isAvailable ? 'fill-white' : 'fill-site-ui-blue'
              }`}
            >
              {position}
            </text>
          </g>
        )
      })}

      {/* Outlet, fixed and always green. */}
      <circle
        cx={outlet.x}
        cy={outlet.y}
        r={NODE}
        className="fill-site-green stroke-white"
        strokeWidth={2}
      />
      <text
        x={outlet.x}
        y={outlet.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white text-[11px] font-bold"
      >
        12
      </text>
    </svg>
  )
}
