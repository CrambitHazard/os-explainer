'use client'

import { Thread } from '../types'

interface Props {
  threads: Thread[]
}

export default function ThreadVisualizer({ threads }: Props) {
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'waiting': return 'Waiting'
      case 'ready': return 'Ready'
      case 'running': return 'Running'
      case 'critical': return 'Critical Section'
      case 'completed': return 'Completed'
      default: return state
    }
  }

  return (
    <div className="thread-visualizer">
      <h3>Thread States</h3>
      <div className="threads-grid">
        {threads.map(thread => (
          <div key={thread.id} className="thread-card">
            <div className="thread-header">
              <div 
                className="thread-indicator"
                style={{ background: thread.color }}
              />
              <h4>{thread.name}</h4>
            </div>
            <div className={`thread-state state-${thread.state}`}>
              {getStateLabel(thread.state)}
            </div>
            <div className="thread-progress">
              <div className="progress-label">
                Operation {thread.currentOperation} / {thread.operations.length}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(thread.currentOperation / thread.operations.length) * 100}%`,
                    background: thread.color 
                  }}
                />
              </div>
            </div>
            {thread.currentOperation < thread.operations.length && (
              <div className="current-operation">
                {thread.operations[thread.currentOperation]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

