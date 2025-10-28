'use client'

import Icon from '../../components/Icon'

interface VirtualProcess {
  pid: number
  name: string
  status: 'running' | 'sleeping' | 'zombie' | 'terminated'
  parentPid: number | null
  memory: string
  created: string
}

interface Props {
  processes: VirtualProcess[]
}

export default function ProcessManager({ processes }: Props) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return 'status-running'
      case 'sleeping': return 'status-sleeping'
      case 'zombie': return 'status-zombie'
      case 'terminated': return 'status-terminated'
      default: return ''
    }
  }

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'running': return <Icon name="play" size={14} />
      case 'sleeping': return <Icon name="sleep" size={14} />
      case 'zombie': return <Icon name="ghost" size={14} />
      case 'terminated': return <Icon name="cross" size={14} />
      default: return <Icon name="pause" size={14} />
    }
  }

  return (
    <div className="process-manager">
      <div className="manager-header">
        <h3><Icon name="settings" size={18} /> Process Manager</h3>
        <span className="process-count">{processes.length} processes</span>
      </div>

      {processes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="settings" size={32} /></div>
          <p>No processes created yet</p>
        </div>
      ) : (
        <div className="process-table-container">
          <table className="process-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Parent PID</th>
                <th>Memory</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, index) => (
                <tr key={index}>
                  <td className="pid-cell">{process.pid}</td>
                  <td className="process-name-cell">{process.name}</td>
                  <td>
                    <span className={`process-status ${getStatusColor(process.status)}`}>
                      <span className="status-icon">{getStatusIcon(process.status)}</span>
                      {process.status}
                    </span>
                  </td>
                  <td>{process.parentPid || '-'}</td>
                  <td>{process.memory}</td>
                  <td className="time-cell">{process.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

