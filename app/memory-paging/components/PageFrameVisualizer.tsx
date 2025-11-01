'use client'

import { SimulationStep } from '../types'

interface Props {
  steps: SimulationStep[]
  currentStep: number
}

export default function PageFrameVisualizer({ steps, currentStep }: Props) {
  if (steps.length === 0) return null

  const step = steps[currentStep]
  const numFrames = step.frames.length

  return (
    <div className="frame-visualizer">
      <h3>Page Frames State</h3>
      
      <div className="current-reference">
        <span className="label">Current Reference:</span>
        <span className={`reference-box ${step.isPageFault ? 'fault' : 'hit'}`}>
          {step.reference}
        </span>
        <span className={`status ${step.isPageFault ? 'fault' : 'hit'}`}>
          {step.isPageFault ? 'PAGE FAULT' : 'PAGE HIT'}
        </span>
      </div>

      <div className="frames-container">
        {step.frames.map((frame, index) => (
          <div key={index} className="frame">
            <div className="frame-label">Frame {index}</div>
            <div className={`frame-content ${frame.pageNumber === null ? 'empty' : ''} ${frame.pageNumber === step.reference && !step.isPageFault ? 'highlight-hit' : ''} ${frame.pageNumber === step.reference && step.isPageFault ? 'highlight-fault' : ''}`}>
              {frame.pageNumber !== null ? frame.pageNumber : '-'}
            </div>
            {frame.lastUsed !== undefined && frame.pageNumber !== null && (
              <div className="frame-info">
                Last used: {frame.lastUsed}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-description">
        <strong>Action:</strong> {step.action}
      </div>

      <div className="step-counter">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  )
}

