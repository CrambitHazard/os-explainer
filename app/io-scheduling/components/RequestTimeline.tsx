'use client'

import { IORequest } from '../types'

interface Props {
  requests: IORequest[]
  currentTime: number
}

export default function RequestTimeline({ requests, currentTime }: Props) {
  const maxTime = Math.max(
    ...requests.map(r => r.completionTime || currentTime),
    currentTime,
    10
  )

  return (
    <div className="request-timeline">
      <h3>I/O Request Timeline</h3>
      
      <div className="timeline-container">
        <div className="timeline-header">
          <div className="timeline-labels">Process</div>
          <div className="timeline-bars">
            <div className="time-markers">
              {Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) => (
                <span key={i} className="time-marker" style={{ left: `${(i / maxTime) * 100}%` }}>
                  {i}s
                </span>
              ))}
            </div>
          </div>
        </div>

        {requests.map(request => {
          const start = request.startTime || 0
          const end = request.completionTime || currentTime
          const waitStart = request.arrivalTime
          const waitEnd = request.startTime || currentTime

          return (
            <div key={request.id} className="timeline-row">
              <div className="timeline-label">
                <span className="process-name">{request.processName}</span>
                <span className="device-type">{request.deviceType}</span>
              </div>
              <div className="timeline-bar-container">
                {/* Waiting period */}
                <div
                  className="timeline-segment waiting"
                  style={{
                    left: `${(waitStart / maxTime) * 100}%`,
                    width: `${((waitEnd - waitStart) / maxTime) * 100}%`,
                  }}
                  title={`Waiting: ${(waitEnd - waitStart).toFixed(2)}s`}
                ></div>
                
                {/* Processing period */}
                {request.startTime && (
                  <div
                    className="timeline-segment processing"
                    style={{
                      left: `${(start / maxTime) * 100}%`,
                      width: `${((end - start) / maxTime) * 100}%`,
                      backgroundColor: request.color,
                    }}
                    title={`Processing: ${(end - start).toFixed(2)}s`}
                  >
                    {request.status === 'completed' && <span className="completed-check">✓</span>}
                  </div>
                )}

                {/* Interrupted indicator */}
                {request.status === 'interrupted' && (
                  <div
                    className="interrupt-indicator"
                    style={{ left: `${(currentTime / maxTime) * 100}%` }}
                  >
                    ⚠
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Current time indicator */}
        <div
          className="current-time-line"
          style={{ left: `${(currentTime / maxTime) * 100}%` }}
        >
          <div className="time-indicator">{currentTime.toFixed(1)}s</div>
        </div>
      </div>
    </div>
  )
}

