'use client'

import { Metrics, AllocationStrategy } from '../types'

interface Props {
  metrics: Metrics
  strategy: AllocationStrategy
}

export default function MetricsDisplay({ metrics, strategy }: Props) {
  const getStrategyInfo = () => {
    switch (strategy) {
      case 'FirstFit':
        return {
          name: 'First-Fit',
          description: 'Allocates the first free block that is large enough',
          pros: ['Fast allocation', 'Simple to implement', 'Low overhead'],
          cons: ['Can cause fragmentation at beginning of memory', 'May leave many small unusable blocks'],
        }
      case 'BestFit':
        return {
          name: 'Best-Fit',
          description: 'Allocates the smallest free block that is large enough',
          pros: ['Minimizes wasted space', 'Better memory utilization', 'Good for mixed-size allocations'],
          cons: ['Slower than First-Fit', 'Can create many tiny fragments', 'Requires searching entire list'],
        }
      case 'WorstFit':
        return {
          name: 'Worst-Fit',
          description: 'Allocates the largest free block',
          pros: ['Leaves large holes', 'Remaining fragments are usable', 'Good for varied sizes'],
          cons: ['Poorest memory utilization', 'Quickly exhausts large blocks', 'Can cause external fragmentation'],
        }
    }
  }

  const info = getStrategyInfo()

  return (
    <div className="metrics-display">
      <h3>Performance Metrics</h3>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalMemory} KB</div>
          <div className="metric-label">Total Memory</div>
        </div>

        <div className="metric-card used">
          <div className="metric-value">{metrics.usedMemory} KB</div>
          <div className="metric-label">Used Memory</div>
        </div>

        <div className="metric-card free">
          <div className="metric-value">{metrics.freeMemory} KB</div>
          <div className="metric-label">Free Memory</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.utilizationRate.toFixed(1)}%</div>
          <div className="metric-label">Utilization Rate</div>
        </div>

        <div className="metric-card fragmentation">
          <div className="metric-value">{metrics.externalFragmentation.toFixed(1)}%</div>
          <div className="metric-label">External Fragmentation</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.numberOfHoles}</div>
          <div className="metric-label">Number of Holes</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.largestHole} KB</div>
          <div className="metric-label">Largest Hole</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.averageHoleSize.toFixed(1)} KB</div>
          <div className="metric-label">Avg Hole Size</div>
        </div>

        <div className="metric-card success">
          <div className="metric-value">{metrics.successfulAllocations}</div>
          <div className="metric-label">Successful</div>
        </div>

        <div className="metric-card failure">
          <div className="metric-value">{metrics.failedAllocations}</div>
          <div className="metric-label">Failed</div>
        </div>
      </div>

      <div className="strategy-analysis">
        <h4>{info.name} Strategy</h4>
        <p className="strategy-description">{info.description}</p>

        <div className="analysis-grid">
          <div className="analysis-section">
            <strong>Advantages:</strong>
            <ul>
              {info.pros.map((pro, i) => (
                <li key={i} className="pro">✓ {pro}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <strong>Disadvantages:</strong>
            <ul>
              {info.cons.map((con, i) => (
                <li key={i} className="con">✗ {con}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {metrics.externalFragmentation > 30 && (
        <div className="fragmentation-warning">
          <strong>⚠ High External Fragmentation Detected!</strong>
          <p>Consider compacting memory to reduce fragmentation and improve allocation success rate.</p>
        </div>
      )}
    </div>
  )
}

