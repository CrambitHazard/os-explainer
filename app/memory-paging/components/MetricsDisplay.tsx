'use client'

import { Metrics, Algorithm } from '../types'

interface Props {
  metrics: Metrics
  algorithm: Algorithm
}

export default function MetricsDisplay({ metrics, algorithm }: Props) {
  const getAlgorithmInfo = () => {
    switch (algorithm) {
      case 'FIFO':
        return {
          name: 'First In First Out',
          pros: ['Simple to implement', 'Low overhead', 'Fair treatment of all pages'],
          cons: ['Suffers from Belady\'s Anomaly', 'May replace frequently used pages', 'Ignores page usage patterns'],
        }
      case 'LRU':
        return {
          name: 'Least Recently Used',
          pros: ['Good approximation of optimal', 'Considers temporal locality', 'Better performance than FIFO'],
          cons: ['Higher overhead to track usage', 'Requires hardware support or software tracking', 'More complex implementation'],
        }
      case 'Optimal':
        return {
          name: 'Optimal Page Replacement',
          pros: ['Minimum page faults (theoretical best)', 'Benchmark for other algorithms', 'Perfect decision making'],
          cons: ['Impossible to implement in practice', 'Requires future knowledge', 'Used only for comparison'],
        }
    }
  }

  const info = getAlgorithmInfo()

  return (
    <div className="metrics-display">
      <h3>Performance Metrics</h3>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalReferences}</div>
          <div className="metric-label">Total References</div>
        </div>
        
        <div className="metric-card fault">
          <div className="metric-value">{metrics.pageFaults}</div>
          <div className="metric-label">Page Faults</div>
        </div>
        
        <div className="metric-card hit">
          <div className="metric-value">{metrics.pageHits}</div>
          <div className="metric-label">Page Hits</div>
        </div>
        
        <div className="metric-card rate">
          <div className="metric-value">{metrics.pageFaultRate.toFixed(2)}%</div>
          <div className="metric-label">Page Fault Rate</div>
        </div>
        
        <div className="metric-card rate">
          <div className="metric-value">{metrics.pageHitRate.toFixed(2)}%</div>
          <div className="metric-label">Page Hit Rate</div>
        </div>
      </div>

      <div className="algorithm-analysis">
        <h4>{algorithm} - {info.name}</h4>
        
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
  )
}

