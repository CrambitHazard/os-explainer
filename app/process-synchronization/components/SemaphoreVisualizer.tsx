'use client'

import { SemaphoreState } from '../types'

interface Props {
  state: SemaphoreState
}

export default function SemaphoreVisualizer({ state }: Props) {
  return (
    <div className="semaphore-visualizer">
      <h3>Semaphore State</h3>
      
      <div className="semaphore-grid">
        <div className="semaphore-value-display">
          <h4>Semaphore Value</h4>
          <div className="semaphore-counter">
            <div className="counter-value">{state.value}</div>
            <div className="counter-label">Available Resources</div>
          </div>
          <div className="resource-boxes">
            {Array.from({ length: state.maxValue }).map((_, i) => (
              <div 
                key={i} 
                className={`resource-box ${i < state.value ? 'available' : 'in-use'}`}
              >
                {i < state.value ? '✓' : '✗'}
              </div>
            ))}
          </div>
        </div>

        <div className="queue-display">
          <h4>Wait Queue ({state.waitQueue.length})</h4>
          <div className="queue-container">
            {state.waitQueue.length === 0 ? (
              <div className="queue-empty">No waiting threads</div>
            ) : (
              state.waitQueue.map((thread, index) => (
                <div 
                  key={thread.id}
                  className="queue-item"
                  style={{ borderLeftColor: thread.color }}
                >
                  <span style={{ color: thread.color }}>{thread.name}</span>
                  <span className="queue-position">Position {index + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="critical-section-display">
          <h4>Critical Section</h4>
          <div className="cs-box">
            {state.threads.filter(t => t.state === 'critical').map(thread => (
              <div 
                key={thread.id}
                className="cs-occupant"
                style={{ borderColor: thread.color }}
              >
                <span style={{ color: thread.color }}>{thread.name}</span>
              </div>
            ))}
            {state.threads.every(t => t.state !== 'critical') && (
              <div className="cs-empty">Empty</div>
            )}
          </div>
        </div>
      </div>

      <div className="semaphore-explanation">
        <h4>Semaphore Operations</h4>
        <ul>
          <li><strong>Wait (P):</strong> Decrements semaphore. If value &lt; 0, thread blocks</li>
          <li><strong>Signal (V):</strong> Increments semaphore. Wakes up one waiting thread</li>
          <li><strong>Binary Semaphore:</strong> Max value = 1 (mutex)</li>
          <li><strong>Counting Semaphore:</strong> Max value &gt; 1 (resource pool)</li>
        </ul>
      </div>
    </div>
  )
}

