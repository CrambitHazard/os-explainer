'use client'

import { FrameSizeComparison } from '../types'

interface Props {
  comparisons: FrameSizeComparison[]
}

export default function FrameSizeComparisonChart({ comparisons }: Props) {
  if (comparisons.length === 0) return null

  const maxFaults = Math.max(...comparisons.map(c => c.pageFaults))

  return (
    <div className="frame-comparison">
      <h3>Frame Size vs Page Fault Rate</h3>
      
      <div className="comparison-chart">
        {comparisons.map(comp => (
          <div key={comp.frameCount} className="chart-bar">
            <div className="bar-container">
              <div 
                className="bar-fill"
                style={{ height: `${(comp.pageFaults / maxFaults) * 100}%` }}
              >
                <span className="bar-value">{comp.pageFaults}</span>
              </div>
            </div>
            <div className="bar-label">{comp.frameCount} frames</div>
            <div className="bar-rate">{comp.pageFaultRate.toFixed(1)}%</div>
          </div>
        ))}
      </div>

      <div className="comparison-insights">
        <h4>Insights:</h4>
        <ul>
          <li>More frames generally reduce page faults</li>
          <li>Diminishing returns after optimal working set size</li>
          <li>Belady's anomaly may occur with some algorithms</li>
        </ul>
      </div>
    </div>
  )
}

