'use client'

import { IOMetrics, IOSchedulingAlgorithm } from '../types'

interface Props {
  metrics: IOMetrics
  algorithm: IOSchedulingAlgorithm
}

export default function MetricsDisplay({ metrics, algorithm }: Props) {
  const getAlgorithmAnalysis = (): string[] => {
    const analysis: string[] = []

    switch (algorithm) {
      case 'FCFS':
        analysis.push('✓ Simple and fair - no starvation')
        analysis.push('✓ Easy to implement')
        if (metrics.averageWaitingTime > 2) {
          analysis.push('✗ High average waiting time')
        }
        analysis.push('✗ No optimization for seek time or priority')
        analysis.push('⚠ Can cause convoy effect with slow requests')
        break

      case 'Priority':
        analysis.push('✓ Important requests served first')
        analysis.push('✓ Good for real-time systems')
        if (metrics.averageWaitingTime < 2) {
          analysis.push('✓ Low average waiting time for high-priority requests')
        }
        analysis.push('✗ Low-priority requests may starve')
        analysis.push('⚠ Requires priority assignment mechanism')
        break

      case 'SSTF':
        analysis.push('✓ Minimizes disk head movement')
        analysis.push('✓ Better throughput than FCFS')
        if (metrics.averageResponseTime < 1.5) {
          analysis.push('✓ Fast average response time')
        }
        analysis.push('✗ Possible starvation for distant requests')
        analysis.push('⚠ Only applicable to disk I/O')
        break

      case 'RoundRobin':
        analysis.push('✓ Fair time sharing among requests')
        analysis.push('✓ No starvation - all requests get chance')
        analysis.push('✗ Higher context switching overhead')
        if (metrics.throughput < 0.5) {
          analysis.push('✗ Lower throughput due to time slicing')
        }
        analysis.push('⚠ Time quantum selection is critical')
        break
    }

    return analysis
  }

  return (
    <div className="io-metrics">
      <h3>Performance Metrics</h3>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.completedRequests}/{metrics.totalRequests}</div>
          <div className="metric-label">Requests Completed</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.averageWaitingTime.toFixed(2)}s</div>
          <div className="metric-label">Avg Waiting Time</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.averageTurnaroundTime.toFixed(2)}s</div>
          <div className="metric-label">Avg Turnaround Time</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.averageResponseTime.toFixed(2)}s</div>
          <div className="metric-label">Avg Response Time</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.throughput.toFixed(2)}</div>
          <div className="metric-label">Throughput (req/s)</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.totalInterrupts}</div>
          <div className="metric-label">Total Interrupts</div>
        </div>
      </div>

      <div className="device-utilization">
        <h4>Device Utilization</h4>
        <div className="utilization-bars">
          {Object.entries(metrics.deviceUtilization).map(([device, util]) => (
            <div key={device} className="utilization-row">
              <span className="device-name">{device}</span>
              <div className="utilization-bar">
                <div
                  className="utilization-fill"
                  style={{ width: `${util}%` }}
                >
                  <span className="utilization-value">{util.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="algorithm-analysis">
        <h4>{algorithm} Algorithm Analysis</h4>
        <ul>
          {getAlgorithmAnalysis().map((point, index) => (
            <li
              key={index}
              className={
                point.startsWith('✓') ? 'good' :
                point.startsWith('✗') ? 'bad' :
                'neutral'
              }
            >
              {point}
            </li>
          ))}
        </ul>
      </div>

      {metrics.missedDeadlines > 0 && (
        <div className="deadline-warning">
          <strong>⚠ MISSED DEADLINES</strong>
          <p>{metrics.missedDeadlines} request(s) exceeded expected completion time.</p>
          <p><strong>Solution:</strong> Consider using priority scheduling or increasing device resources.</p>
        </div>
      )}
    </div>
  )
}

