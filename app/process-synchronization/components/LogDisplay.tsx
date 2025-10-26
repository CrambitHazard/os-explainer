'use client'

import { LogEntry } from '../types'

interface Props {
  log: LogEntry[]
}

export default function LogDisplay({ log }: Props) {
  return (
    <div className="log-display">
      <h3>Execution Log</h3>
      <div className="log-container">
        {log.length === 0 ? (
          <div className="log-empty">No actions yet. Click "Step" or "Auto Run" to begin.</div>
        ) : (
          <div className="log-entries">
            {log.slice().reverse().map((entry, index) => (
              <div key={log.length - index} className="log-entry">
                <span className="log-step">Step {entry.step}</span>
                <span className="log-thread">{entry.threadName}</span>
                <span className="log-action">{entry.action}</span>
                <span className="log-details">{entry.details}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

