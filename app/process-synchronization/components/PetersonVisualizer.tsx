'use client'

import { PetersonState } from '../types'

interface Props {
  state: PetersonState
}

export default function PetersonVisualizer({ state }: Props) {
  return (
    <div className="peterson-visualizer">
      <h3>Peterson's Algorithm State</h3>
      
      <div className="peterson-grid">
        <div className="peterson-variables">
          <h4>Shared Variables</h4>
          <div className="variable-display">
            <div className="variable">
              <span className="var-label">flag[0]:</span>
              <span className={`var-value ${state.flag[0] ? 'active' : ''}`}>
                {state.flag[0] ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div className="variable">
              <span className="var-label">flag[1]:</span>
              <span className={`var-value ${state.flag[1] ? 'active' : ''}`}>
                {state.flag[1] ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div className="variable">
              <span className="var-label">turn:</span>
              <span className="var-value active">
                {state.turn}
              </span>
            </div>
          </div>
        </div>

        <div className="critical-section-display">
          <h4>Critical Section</h4>
          <div className="cs-box">
            {state.threads.map(thread => (
              thread.state === 'critical' && (
                <div 
                  key={thread.id}
                  className="cs-occupant"
                  style={{ borderColor: thread.color }}
                >
                  <span style={{ color: thread.color }}>{thread.name}</span>
                  <span className="cs-label">IN CRITICAL SECTION</span>
                </div>
              )
            ))}
            {state.threads.every(t => t.state !== 'critical') && (
              <div className="cs-empty">Empty</div>
            )}
          </div>
        </div>
      </div>

      <div className="peterson-explanation">
        <h4>How Peterson's Algorithm Works</h4>
        <ul>
          <li>Each thread sets its flag to indicate interest in entering</li>
          <li>Thread sets turn to give priority to the other thread</li>
          <li>Thread waits if other's flag is set AND it's the other's turn</li>
          <li>Only one thread can be in critical section at a time</li>
          <li>Guarantees mutual exclusion, progress, and bounded waiting</li>
        </ul>
      </div>
    </div>
  )
}

