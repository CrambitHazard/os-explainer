'use client'

import { LogEntry } from '../types'

interface Props {
  log: LogEntry[]
}

export default function LogDisplay({ log }: Props) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓'
      case 'error': return '✗'
      case 'warning': return '⚠'
      default: return 'ℹ'
    }
  }

  return (
    <div className="log-display">
      <h3>Execution Log</h3>
      <div className="log-container">
        {log.length === 0 ? (
          <div className="log-empty">Run safety algorithm to see execution steps.</div>
        ) : (
          <div className="log-entries">
            {log.map((entry, index) => (
              <div key={index} className={`log-entry log-${entry.type}`}>
                <span className="log-icon">{getLogIcon(entry.type)}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

