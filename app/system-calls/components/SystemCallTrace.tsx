'use client'

import { SystemCall } from '../types'

interface Props {
  calls: SystemCall[]
  maxDisplay?: number
}

export default function SystemCallTrace({ calls, maxDisplay = 20 }: Props) {
  const recentCalls = calls.slice(-maxDisplay).reverse()

  const getCallIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      fork: '🔀',
      exec: '🔄',
      wait: '⏳',
      exit: '🚪',
      open: '📂',
      read: '📖',
      write: '✍️',
      close: '🔒',
      pipe: '🔗',
      signal: '📡',
      malloc: '🧱',
      free: '🗑️',
    }
    return icons[type] || '⚙️'
  }

  const getCallColor = (type: string): string => {
    if (['fork', 'exec', 'wait', 'exit'].includes(type)) return '#00ff41'
    if (['open', 'read', 'write', 'close'].includes(type)) return '#00d4ff'
    if (['pipe', 'signal'].includes(type)) return '#ff00ff'
    if (['malloc', 'free'].includes(type)) return '#ffaa00'
    return '#ffffff'
  }

  return (
    <div className="syscall-trace">
      <h3>System Call Trace</h3>
      <div className="trace-container">
        {recentCalls.length === 0 ? (
          <div className="trace-empty">No system calls yet</div>
        ) : (
          <div className="trace-list">
            {recentCalls.map(call => (
              <div
                key={call.id}
                className={`trace-entry ${call.success ? 'success' : 'error'}`}
                style={{ borderLeftColor: getCallColor(call.type) }}
              >
                <div className="trace-header">
                  <span className="call-icon">{getCallIcon(call.type)}</span>
                  <span className="call-type">{call.type}()</span>
                  <span className="call-pid">PID: {call.pid}</span>
                  <span className="call-time">{call.timestamp.toFixed(2)}s</span>
                </div>
                <div className="trace-description">{call.description}</div>
                {call.returnValue !== null && call.returnValue !== undefined && (
                  <div className="trace-return">
                    Return: <code>{JSON.stringify(call.returnValue)}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

