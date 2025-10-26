'use client'

import { SimulationStep } from '../types'

interface Props {
  referenceString: number[]
  currentStep: number
  steps: SimulationStep[]
}

export default function ReferenceStringDisplay({ referenceString, currentStep, steps }: Props) {
  return (
    <div className="reference-display">
      <h3>Reference String</h3>
      <div className="reference-string">
        {referenceString.map((page, index) => {
          const isPast = index < currentStep
          const isCurrent = index === currentStep
          const step = steps[index]
          const isFault = step?.isPageFault

          return (
            <div 
              key={index}
              className={`reference-item ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''} ${isFault ? 'fault' : 'hit'}`}
            >
              <span className="page-number">{page}</span>
              {isPast && (
                <span className="status-indicator">
                  {isFault ? '✗' : '✓'}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div className="legend">
        <span className="legend-item">
          <span className="indicator fault">✗</span> Page Fault
        </span>
        <span className="legend-item">
          <span className="indicator hit">✓</span> Page Hit
        </span>
      </div>
    </div>
  )
}

