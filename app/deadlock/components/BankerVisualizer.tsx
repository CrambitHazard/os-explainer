'use client'

import { BankerState } from '../types'

interface Props {
  state: BankerState
}

export default function BankerVisualizer({ state }: Props) {
  return (
    <div className="banker-visualizer">
      <h3>Banker's Algorithm - System State</h3>

      <div className="banker-matrices">
        {/* Allocation Matrix */}
        <div className="matrix-container">
          <h4>Allocation Matrix</h4>
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Process</th>
                {state.resources.map(r => (
                  <th key={r.id}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.processes.map(p => (
                <tr key={p.id}>
                  <td style={{ color: p.color, fontWeight: 'bold' }}>{p.name}</td>
                  {p.allocation.map((val, i) => (
                    <td key={i} className="matrix-cell">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Maximum Matrix */}
        <div className="matrix-container">
          <h4>Maximum Matrix</h4>
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Process</th>
                {state.resources.map(r => (
                  <th key={r.id}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.processes.map(p => (
                <tr key={p.id}>
                  <td style={{ color: p.color, fontWeight: 'bold' }}>{p.name}</td>
                  {p.maximum.map((val, i) => (
                    <td key={i} className="matrix-cell">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Need Matrix */}
        <div className="matrix-container">
          <h4>Need Matrix</h4>
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Process</th>
                {state.resources.map(r => (
                  <th key={r.id}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.processes.map(p => (
                <tr key={p.id}>
                  <td style={{ color: p.color, fontWeight: 'bold' }}>{p.name}</td>
                  {p.need.map((val, i) => (
                    <td key={i} className="matrix-cell highlighted">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Available Resources */}
        <div className="matrix-container">
          <h4>Available Resources</h4>
          <table className="matrix-table">
            <thead>
              <tr>
                {state.resources.map(r => (
                  <th key={r.id}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {state.available.map((val, i) => (
                  <td key={i} className="matrix-cell available">{val}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Analysis */}
      <div className="safety-results">
        <h4>Safety Analysis</h4>
        {state.isSafe ? (
          <div className="safe-state">
            <div className="status-badge success">SAFE STATE</div>
            <div className="safe-sequence">
              <strong>Safe Sequence:</strong>
              <div className="sequence-flow">
                {state.safeSequence.map((proc, index) => (
                  <span key={index}>
                    <span className="sequence-item">{proc}</span>
                    {index < state.safeSequence.length - 1 && <span className="arrow">→</span>}
                  </span>
                ))}
              </div>
            </div>
            <p className="explanation">
              All processes can complete in this order without deadlock.
            </p>
          </div>
        ) : (
          <div className="unsafe-state">
            <div className="status-badge error">UNSAFE STATE</div>
            <p className="explanation">
              No safe sequence exists. System may enter deadlock.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

