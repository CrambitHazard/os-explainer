'use client'

interface LogEntry {
  timestamp: string
  action: string
  message: string
  success: boolean
}

interface Props {
  log: LogEntry[]
}

export default function ActivityLog({ log }: Props) {
  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <div className="log-container">
        {log.length === 0 ? (
          <div className="log-empty">No activities yet</div>
        ) : (
          <div className="log-entries">
            {log.slice().reverse().map((entry, index) => (
              <div 
                key={index} 
                className={`log-entry ${entry.success ? 'success' : 'error'}`}
              >
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-action">{entry.action}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

