'use client'

import { LogEntry } from '../types'
import Icon from '../../components/Icon'

interface Props {
  log: LogEntry[]
}

export default function LogDisplay({ log }: Props) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <Icon name="check" size={14} />
      case 'error': return <Icon name="cross" size={14} />
      case 'warning': return <Icon name="alert-high" size={14} />
      default: return <Icon name="alert-medium" size={14} />
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

