'use client'

import { RAGState } from '../types'

interface Props {
  state: RAGState
}

export default function RAGVisualizer({ state }: Props) {
  return (
    <div className="rag-visualizer">
      <h3>Resource Allocation Graph</h3>
      
      <div className="rag-container">
        <svg className="rag-svg" viewBox="0 0 800 500">
          {/* Draw processes (circles) */}
          {state.processes.map((process, index) => {
            const x = 150
            const y = 100 + index * 120
            return (
              <g key={process.name}>
                <circle
                  cx={x}
                  cy={y}
                  r="40"
                  fill={process.color}
                  stroke="#fff"
                  strokeWidth="3"
                  opacity="0.8"
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="#000"
                  fontSize="18"
                  fontWeight="bold"
                >
                  {process.name}
                </text>
              </g>
            )
          })}

          {/* Draw resources (rectangles) */}
          {state.resources.map((resource, index) => {
            const x = 650
            const y = 100 + index * 120
            return (
              <g key={resource.name}>
                <rect
                  x={x - 40}
                  y={y - 30}
                  width="80"
                  height="60"
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth="3"
                  opacity="0.8"
                  rx="5"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {resource.name}
                </text>
                <text
                  x={x}
                  y={y + 18}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                >
                  ({resource.available}/{resource.totalInstances})
                </text>
              </g>
            )
          })}

          {/* Draw edges */}
          {state.edges.map((edge, index) => {
            const fromIsProcess = edge.from.startsWith('P')
            const toIsProcess = edge.to.startsWith('P')
            
            let x1, y1, x2, y2

            if (fromIsProcess) {
              const pIndex = state.processes.findIndex(p => p.name === edge.from)
              x1 = 150
              y1 = 100 + pIndex * 120
            } else {
              const rIndex = state.resources.findIndex(r => r.name === edge.from)
              x1 = 650
              y1 = 100 + rIndex * 120
            }

            if (toIsProcess) {
              const pIndex = state.processes.findIndex(p => p.name === edge.to)
              x2 = 150
              y2 = 100 + pIndex * 120
            } else {
              const rIndex = state.resources.findIndex(r => r.name === edge.to)
              x2 = 650
              y2 = 100 + rIndex * 120
            }

            const isRequest = edge.type === 'request'
            const color = isRequest ? '#ef4444' : '#10b981'
            const strokeDasharray = isRequest ? '5,5' : '0'

            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#666" />
            </marker>
          </defs>
        </svg>

        <div className="rag-legend">
          <div className="legend-item">
            <div className="legend-line allocation"></div>
            <span>Allocation (Resource → Process)</span>
          </div>
          <div className="legend-item">
            <div className="legend-line request"></div>
            <span>Request (Process → Resource)</span>
          </div>
        </div>
      </div>

      {/* Cycle Detection Results */}
      <div className="cycle-results">
        <h4>Deadlock Analysis</h4>
        {state.hasDeadlock ? (
          <div className="deadlock-detected">
            <div className="status-badge error">DEADLOCK DETECTED</div>
            <div className="cycles-list">
              <strong>Detected Cycles:</strong>
              {state.cycles.map((cycle, index) => (
                <div key={index} className="cycle-item">
                  Cycle {index + 1}: {cycle.join(' → ')}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-deadlock">
            <div className="status-badge success">NO DEADLOCK</div>
            <p>The resource allocation graph contains no cycles.</p>
            <p>System is free from deadlock.</p>
          </div>
        )}
      </div>
    </div>
  )
}

