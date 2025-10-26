'use client'

import { MonitorState } from '../types'

interface Props {
  state: MonitorState
}

export default function MonitorVisualizer({ state }: Props) {
  return (
    <div className="monitor-visualizer">
      <h3>Monitor State</h3>
      
      <div className="monitor-grid">
        <div className="monitor-status">
          <h4>Monitor Lock</h4>
          <div className={`lock-indicator ${state.locked ? 'locked' : 'unlocked'}`}>
            <div className="lock-icon">{state.locked ? '🔒' : '🔓'}</div>
            <div className="lock-status">
              {state.locked ? 'LOCKED' : 'UNLOCKED'}
            </div>
            {state.owner && (
              <div className="lock-owner" style={{ color: state.owner.color }}>
                Owned by {state.owner.name}
              </div>
            )}
          </div>
        </div>

        <div className="queue-display">
          <h4>Entry Queue ({state.waitQueue.length})</h4>
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

        <div className="queue-display">
          <h4>Condition Queue ({state.conditionQueue.length})</h4>
          <div className="queue-container">
            {state.conditionQueue.length === 0 ? (
              <div className="queue-empty">No waiting threads</div>
            ) : (
              state.conditionQueue.map((thread, index) => (
                <div 
                  key={thread.id}
                  className="queue-item condition"
                  style={{ borderLeftColor: thread.color }}
                >
                  <span style={{ color: thread.color }}>{thread.name}</span>
                  <span className="queue-position">Waiting on condition</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="critical-section-display">
          <h4>Monitor Body</h4>
          <div className="cs-box">
            {state.threads.filter(t => t.state === 'critical').map(thread => (
              <div 
                key={thread.id}
                className="cs-occupant"
                style={{ borderColor: thread.color }}
              >
                <span style={{ color: thread.color }}>{thread.name}</span>
                <span className="cs-label">EXECUTING</span>
              </div>
            ))}
            {state.threads.every(t => t.state !== 'critical') && (
              <div className="cs-empty">No thread executing</div>
            )}
          </div>
        </div>
      </div>

      <div className="monitor-explanation">
        <h4>Monitor Characteristics</h4>
        <ul>
          <li>Only one thread can execute in monitor at a time (automatic mutual exclusion)</li>
          <li>Threads waiting to enter are placed in entry queue</li>
          <li>Condition variables allow threads to wait for specific conditions</li>
          <li>Wait() releases monitor lock and moves thread to condition queue</li>
          <li>Signal() wakes up one thread from condition queue</li>
        </ul>
      </div>
    </div>
  )
}

