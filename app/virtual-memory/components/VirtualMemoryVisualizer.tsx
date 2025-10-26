'use client'

import { SimulationStep } from '../types'

interface Props {
  step: SimulationStep
}

export default function VirtualMemoryVisualizer({ step }: Props) {
  return (
    <div className="vm-visualizer">
      <h3>Virtual Memory State</h3>

      <div className="current-reference">
        <span className="label">Accessing Page:</span>
        <span className="page-box">{step.pageReference}</span>
        <div className="status-indicators">
          <span className={`status-badge ${step.tlbHit ? 'hit' : 'miss'}`}>
            TLB: {step.tlbHit ? 'HIT' : 'MISS'}
          </span>
          <span className={`status-badge ${step.pageFault ? 'fault' : 'hit'}`}>
            {step.pageFault ? 'PAGE FAULT' : 'PAGE HIT'}
          </span>
        </div>
      </div>

      <div className="frames-display">
        <h4>Physical Memory Frames</h4>
        <div className="frames-grid">
          {step.frames.map(frame => (
            <div 
              key={frame.frameNumber}
              className={`frame-box ${frame.pageNumber === null ? 'empty' : ''} ${frame.pageNumber === step.pageReference ? 'active' : ''}`}
            >
              <div className="frame-number">Frame {frame.frameNumber}</div>
              <div className="frame-content">
                {frame.pageNumber !== null ? `Page ${frame.pageNumber}` : 'Empty'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="working-set-display">
        <h4>Working Set</h4>
        <div className="working-set-badges">
          {Array.from(step.workingSet).map(page => (
            <span key={page} className="ws-badge">
              {page}
            </span>
          ))}
        </div>
        <div className="ws-size">Size: {step.workingSet.size} pages</div>
      </div>

      <div className="action-display">
        <strong>Action:</strong> {step.action}
        {step.swapOut && (
          <div className="swap-indicator">
            💾 Swap Out: Page {step.victim} written to disk
          </div>
        )}
      </div>
    </div>
  )
}

