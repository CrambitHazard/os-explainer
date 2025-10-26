'use client'

import { Interrupt } from '../types'
import { interruptColors } from '../examples'

interface Props {
  interrupts: Interrupt[]
  currentTime: number
}

export default function InterruptHandler({ interrupts, currentTime }: Props) {
  const pendingInterrupts = interrupts.filter(int => !int.handled && int.arrivalTime > currentTime)
  const handledInterrupts = interrupts.filter(int => int.handled)
  const activeInterrupts = interrupts.filter(
    int => !int.handled && int.arrivalTime <= currentTime && int.arrivalTime + int.handlingTime > currentTime
  )

  return (
    <div className="interrupt-handler">
      <h3>Interrupt Handler</h3>

      {activeInterrupts.length > 0 && (
        <div className="active-interrupts">
          <h4>🚨 Active Interrupts</h4>
          {activeInterrupts.map(interrupt => (
            <div
              key={interrupt.id}
              className="interrupt-card active"
              style={{ borderColor: interruptColors[interrupt.priority] }}
            >
              <div className="interrupt-header">
                <span
                  className={`interrupt-priority ${interrupt.priority}`}
                  style={{ backgroundColor: interruptColors[interrupt.priority] }}
                >
                  {interrupt.priority.toUpperCase()}
                </span>
                <span className="interrupt-type">{interrupt.type}</span>
              </div>
              <div className="interrupt-details">
                <span>Source: {interrupt.source}</span>
                <span>Handling Time: {interrupt.handlingTime.toFixed(2)}s</span>
              </div>
              <div className="interrupt-progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${((currentTime - interrupt.arrivalTime) / interrupt.handlingTime) * 100}%`,
                    backgroundColor: interruptColors[interrupt.priority],
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingInterrupts.length > 0 && (
        <div className="pending-interrupts">
          <h4>⏳ Pending Interrupts</h4>
          <div className="interrupt-list">
            {pendingInterrupts.map(interrupt => (
              <div
                key={interrupt.id}
                className="interrupt-item"
                style={{ borderLeftColor: interruptColors[interrupt.priority] }}
              >
                <span className={`priority-badge ${interrupt.priority}`}>
                  {interrupt.priority}
                </span>
                <span className="interrupt-name">{interrupt.type}</span>
                <span className="interrupt-time">@ {interrupt.arrivalTime.toFixed(2)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {handledInterrupts.length > 0 && (
        <div className="handled-interrupts">
          <h4>✅ Handled ({handledInterrupts.length})</h4>
          <div className="interrupt-list">
            {handledInterrupts.slice(-5).map(interrupt => (
              <div key={interrupt.id} className="interrupt-item handled">
                <span className={`priority-badge ${interrupt.priority}`}>
                  {interrupt.priority}
                </span>
                <span className="interrupt-name">{interrupt.type}</span>
                <span className="interrupt-time">@ {interrupt.arrivalTime.toFixed(2)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {interrupts.length === 0 && (
        <div className="no-interrupts">
          <p>No interrupts scheduled</p>
        </div>
      )}
    </div>
  )
}

