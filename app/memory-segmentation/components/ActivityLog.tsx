'use client'

import { SimulationStep } from '../types'

interface Props {
  steps: SimulationStep[]
}

export default function ActivityLog({ steps }: Props) {
  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <div className="log-container">
        {steps.length === 0 ? (
          <div className="log-empty">No activity yet. Start allocating segments.</div>
        ) : (
          <div className="log-entries">
            {steps.slice().reverse().map((step, index) => (
              <div 
                key={steps.length - index}
                className={`log-entry ${step.result?.success ? 'success' : 'failure'}`}
              >
                <div className="log-step">Step {step.stepNumber}</div>
                <div className="log-action">{step.action}</div>
                {step.result && (
                  <div className="log-message">{step.result.message}</div>
                )}
                {step.segment && (
                  <div 
                    className="log-segment"
                    style={{ borderLeftColor: step.segment.color }}
                  >
                    {step.segment.name} ({step.segment.size} KB)
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

