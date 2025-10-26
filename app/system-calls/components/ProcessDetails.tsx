'use client'

import { Process } from '../types'

interface Props {
  process: Process | null
}

export default function ProcessDetails({ process }: Props) {
  if (!process) {
    return (
      <div className="process-details">
        <h3>Process Details</h3>
        <div className="no-selection">Select a process to view details</div>
      </div>
    )
  }

  return (
    <div className="process-details">
      <h3>Process Details</h3>
      
      <div className="detail-section">
        <h4>Basic Information</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">PID:</span>
            <span className="detail-value">{process.pid}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Parent PID:</span>
            <span className="detail-value">{process.parentPid || 'None'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{process.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">State:</span>
            <span className={`detail-value state-${process.state}`}>
              {process.state}
            </span>
          </div>
          {process.execProgram && (
            <div className="detail-item">
              <span className="detail-label">Exec Program:</span>
              <span className="detail-value">{process.execProgram}</span>
            </div>
          )}
          {process.returnCode !== undefined && (
            <div className="detail-item">
              <span className="detail-label">Return Code:</span>
              <span className="detail-value">{process.returnCode}</span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-section">
        <h4>File Descriptors</h4>
        {process.fileDescriptors.length === 0 ? (
          <div className="empty-section">No file descriptors</div>
        ) : (
          <table className="fd-table">
            <thead>
              <tr>
                <th>FD</th>
                <th>File</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {process.fileDescriptors.map(fd => (
                <tr key={fd.fd} className={fd.isOpen ? '' : 'closed'}>
                  <td>{fd.fd}</td>
                  <td>{fd.fileName}</td>
                  <td>{fd.mode}</td>
                  <td>{fd.isOpen ? '✅ Open' : '🔒 Closed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="detail-section">
        <h4>Memory Allocations</h4>
        {process.memoryAllocations.length === 0 ? (
          <div className="empty-section">No allocations</div>
        ) : (
          <div className="memory-list">
            {process.memoryAllocations.map((mem, index) => (
              <div key={index} className={`memory-block ${mem.allocated ? 'allocated' : 'freed'}`}>
                <span className="mem-address">{mem.address}</span>
                <span className="mem-size">{mem.size} bytes</span>
                <span className="mem-status">{mem.allocated ? '✅' : '🗑️'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {process.children.length > 0 && (
        <div className="detail-section">
          <h4>Child Processes</h4>
          <div className="children-list">
            {process.children.map(childPid => (
              <span key={childPid} className="child-badge">
                PID: {childPid}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

