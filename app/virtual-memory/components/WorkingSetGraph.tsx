'use client'

import { SimulationStep } from '../types'

interface Props {
  steps: SimulationStep[]
}

export default function WorkingSetGraph({ steps }: Props) {
  if (steps.length === 0) return null

  const maxSize = Math.max(...steps.map(s => s.workingSet.size))
  const height = 200

  return (
    <div className="ws-graph">
      <h3>Working Set Size Over Time</h3>
      <div className="graph-container">
        <svg className="graph-svg" viewBox={`0 0 ${steps.length * 20} ${height}`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const y = height - (i / 5) * height
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={steps.length * 20}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                <text
                  x="-5"
                  y={y + 5}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {i}
                </text>
              </g>
            )
          })}

          {/* Line graph */}
          <polyline
            points={steps
              .map((step, index) => {
                const x = index * 20 + 10
                const y = height - (step.workingSet.size / maxSize) * (height - 20) - 10
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth="2"
          />

          {/* Data points */}
          {steps.map((step, index) => {
            const x = index * 20 + 10
            const y = height - (step.workingSet.size / maxSize) * (height - 20) - 10
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="var(--accent-color)"
              />
            )
          })}
        </svg>
      </div>
      <div className="graph-info">
        <span>Average Working Set Size: {(steps.reduce((sum, s) => sum + s.workingSet.size, 0) / steps.length).toFixed(1)} pages</span>
      </div>
    </div>
  )
}

