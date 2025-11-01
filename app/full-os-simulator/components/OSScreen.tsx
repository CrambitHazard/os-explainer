'use client'

import { OSLog } from '../types'
import Icon from '../../components/Icon'

interface Props {
  logs: OSLog[]
}

export default function OSScreen({ logs }: Props) {
  const getLogIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'info': return <Icon name="alert-medium" size={14} />
      case 'success': return <Icon name="check" size={14} />
      case 'error': return <Icon name="cross" size={14} />
      case 'command': return <Icon name="signal" size={14} />
      default: return <Icon name="file" size={14} />
    }
  }

  const getLogColor = (type: string): string => {
    switch (type) {
      case 'info': return 'log-info'
      case 'success': return 'log-success'
      case 'error': return 'log-error'
      case 'command': return 'log-command'
      default: return ''
    }
  }

  return (
    <div className="os-screen">
      <div className="os-header">
        <div className="os-window-controls">
          <span className="control-dot red"></span>
          <span className="control-dot yellow"></span>
          <span className="control-dot green"></span>
        </div>
        <div className="os-title">Simulated OS Terminal - AI-Powered</div>
        <div className="os-status">
          <span className="status-dot"></span>
          <span>Active</span>
        </div>
      </div>
      
      <div className="os-terminal">
        <div className="terminal-welcome">
          <pre className="ascii-art">
{`   ___  ____    ____  _                 __      __            
  / _ \\/ ___|  / ___|(_)_ __ ___  _   _\\ \\    / /_ _ _ __  
 | | | \\___ \\  \\___ \\| | '_ \` _ \\| | | |\\ \\/\\/ / _\` | '__| 
 | |_| |___) |  ___) | | | | | | | |_| | \\    / (_| | |    
  \\___/|____/  |____/|_|_| |_| |_|\\__,_|  \\/\\/\\__,_|_|    
                                                             
  AI-Powered Operating System Simulator v1.0
  Type your tasks in the chat to execute them on this OS
`}
          </pre>
        </div>

        <div className="terminal-logs">
          {logs.map(log => (
            <div key={log.id} className={`terminal-log ${getLogColor(log.type)}`}>
              <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="log-icon">{getLogIcon(log.type)}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>

        <div className="terminal-cursor">
          <span className="prompt">$</span>
          <span className="cursor-blink">▊</span>
        </div>
      </div>
    </div>
  )
}

