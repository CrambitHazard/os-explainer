'use client'

import { SimulationResult } from '../types'

interface Props {
  results: SimulationResult[]
}

export default function ComparisonView({ results }: Props) {
  if (results.length === 0) return null

  return (
    <div className="comparison-view">
      <h3>Algorithm Comparison</h3>
      
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Page Faults</th>
            <th>Page Hits</th>
            <th>Fault Rate</th>
            <th>Hit Rate</th>
            <th>Performance</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const minFaults = Math.min(...results.map(r => r.metrics.pageFaults))
            const isBest = result.metrics.pageFaults === minFaults

            return (
              <tr key={index} className={isBest ? 'best' : ''}>
                <td className="algorithm-name">
                  {result.algorithm}
                  {isBest && <span className="badge">Best</span>}
                </td>
                <td>{result.metrics.pageFaults}</td>
                <td>{result.metrics.pageHits}</td>
                <td>{result.metrics.pageFaultRate.toFixed(2)}%</td>
                <td>{result.metrics.pageHitRate.toFixed(2)}%</td>
                <td>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill"
                      style={{ 
                        width: `${result.metrics.pageHitRate}%`,
                        background: isBest ? '#10b981' : 'var(--accent-color)'
                      }}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="comparison-summary">
        <h4>Summary</h4>
        <p>
          The table above compares the performance of different page replacement algorithms
          on the same reference string. Lower page faults indicate better performance.
        </p>
        <p>
          <strong>Note:</strong> Optimal algorithm always performs best but is impossible
          to implement in practice as it requires knowledge of future page references.
        </p>
      </div>
    </div>
  )
}

