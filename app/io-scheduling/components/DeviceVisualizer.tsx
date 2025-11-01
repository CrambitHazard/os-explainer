'use client'

import { Device } from '../types'
import Icon from '../../components/Icon'
import { deviceTypes } from '../examples'

interface Props {
  devices: Device[]
}

export default function DeviceVisualizer({ devices }: Props) {
  return (
    <div className="device-visualizer">
      <h3>Device Status</h3>
      <div className="devices-grid">
        {devices.map(device => {
          const deviceInfo = deviceTypes[device.type]
          return (
            <div
              key={device.id}
              className={`device-card ${device.busy ? 'busy' : 'idle'}`}
            >
              <div className="device-header">
                <span className="device-icon">{deviceInfo.icon}</span>
                <div className="device-info">
                  <h4>{device.name}</h4>
                  <span className="device-type">{deviceInfo.name}</span>
                </div>
                <div className={`device-status ${device.busy ? 'busy' : 'idle'}`}>
                  {device.busy ? <><Icon name="signal" size={14} /> Busy</> : <><Icon name="sleep" size={14} /> Idle</>}
                </div>
              </div>

              {device.currentRequest && (
                <div className="current-request">
                  <div className="request-header">Processing:</div>
                  <div className="request-details">
                    <span className="request-process">{device.currentRequest.processName}</span>
                    <span className="request-data">{device.currentRequest.dataSize} KB</span>
                  </div>
                  {device.type === 'disk' && device.currentTrack !== undefined && (
                    <div className="disk-track">
                      Track: {device.currentTrack} → {device.currentRequest.diskLocation}
                    </div>
                  )}
                </div>
              )}

              <div className="device-stats">
                <div className="stat">
                  <span className="stat-label">Queue:</span>
                  <span className="stat-value">{device.queue.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Completed:</span>
                  <span className="stat-value">{device.completedRequests}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Rate:</span>
                  <span className="stat-value">{device.transferRate} KB/s</span>
                </div>
              </div>

              {device.queue.length > 0 && (
                <div className="device-queue">
                  <div className="queue-header">Waiting Queue:</div>
                  <div className="queue-items">
                    {device.queue.slice(0, 3).map((request, index) => (
                      <div key={request.id} className="queue-item">
                        <span className="queue-position">{index + 1}</span>
                        <span className="queue-process">{request.processName}</span>
                        <span className={`queue-priority ${request.priority}`}>
                          {request.priority}
                        </span>
                      </div>
                    ))}
                    {device.queue.length > 3 && (
                      <div className="queue-more">+{device.queue.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

