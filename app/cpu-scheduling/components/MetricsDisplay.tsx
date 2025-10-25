'use client'

import { Process, Metrics, Algorithm } from '../types'

interface Props {
  processes: Process[]
  metrics: Metrics
  algorithm: Algorithm
}

export default function MetricsDisplay({ processes, metrics, algorithm }: Props) {
  const getViability = () => {
    const analysis = []

    // Algorithm-specific analysis
    switch (algorithm) {
      case 'FCFS':
        analysis.push('✓ Simple and easy to implement')
        analysis.push('✓ No starvation - every process gets executed')
        analysis.push('✗ Can cause convoy effect (short processes wait for long ones)')
        if (metrics.avgWaitingTime > 10) {
          analysis.push('⚠ High average waiting time detected')
        }
        break

      case 'SJF':
        analysis.push('✓ Optimal average waiting time')
        analysis.push('✓ Minimizes average turnaround time')
        analysis.push('✗ Starvation possible for longer processes')
        analysis.push('✗ Requires burst time prediction')
        break

      case 'SRTF':
        analysis.push('✓ Better turnaround time than SJF')
        analysis.push('✓ More responsive to short processes')
        analysis.push('✗ High context switching overhead')
        analysis.push('✗ Starvation possible for longer processes')
        break

      case 'Priority':
        analysis.push('✓ Important processes get CPU first')
        analysis.push('✓ Good for real-time systems')
        analysis.push('✓ Non-preemptive - no context switching overhead')
        analysis.push('✗ Starvation possible for low-priority processes')
        analysis.push('⚠ Consider using priority aging to prevent starvation')
        break

      case 'Priority-Preemptive':
        analysis.push('✓ Higher priority processes can preempt running processes')
        analysis.push('✓ Very responsive for high-priority tasks')
        analysis.push('✓ Good for real-time systems with urgent tasks')
        analysis.push('✗ Higher context switching overhead')
        analysis.push('✗ Starvation possible for low-priority processes')
        analysis.push('⚠ Consider using priority aging to prevent starvation')
        break

      case 'RR':
        analysis.push('✓ Fair allocation of CPU time')
        analysis.push('✓ No starvation - every process gets a turn')
        analysis.push('✓ Good for time-sharing systems')
        analysis.push('⚠ Performance depends on time quantum selection')
        break
    }

    // General performance analysis
    if (metrics.avgWaitingTime < 5) {
      analysis.push('✓ Excellent average waiting time')
    } else if (metrics.avgWaitingTime > 15) {
      analysis.push('⚠ Poor average waiting time - consider different algorithm')
    }

    if (metrics.cpuUtilization > 95) {
      analysis.push('✓ Excellent CPU utilization')
    }

    return analysis
  }

  return (
    <div className="metrics-container">
      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Process Details</h4>
          <div className="process-table">
            <table>
              <thead>
                <tr>
                  <th>Process</th>
                  <th>AT</th>
                  <th>BT</th>
                  {(algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && <th>Priority</th>}
                  <th>CT</th>
                  <th>TAT</th>
                  <th>WT</th>
                  <th>RT</th>
                </tr>
              </thead>
              <tbody>
                {processes.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.arrivalTime}</td>
                    <td>{p.burstTime}</td>
                    {(algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && <td>{p.priority}</td>}
                    <td>{p.completionTime}</td>
                    <td>{p.turnaroundTime}</td>
                    <td>{p.waitingTime}</td>
                    <td>{p.responseTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-legend">
              <span>AT: Arrival Time</span>
              <span>BT: Burst Time</span>
              <span>CT: Completion Time</span>
              <span>TAT: Turnaround Time</span>
              <span>WT: Waiting Time</span>
              <span>RT: Response Time</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h4>Performance Metrics</h4>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Average Waiting Time:</span>
              <span className="metric-value">{metrics.avgWaitingTime.toFixed(2)} ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average Turnaround Time:</span>
              <span className="metric-value">{metrics.avgTurnaroundTime.toFixed(2)} ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average Response Time:</span>
              <span className="metric-value">{metrics.avgResponseTime.toFixed(2)} ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">CPU Utilization:</span>
              <span className="metric-value">{metrics.cpuUtilization.toFixed(2)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput:</span>
              <span className="metric-value">{metrics.throughput.toFixed(2)} processes/ms</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h4>Algorithm Viability Analysis</h4>
          <div className="viability-list">
            {getViability().map((point, index) => (
              <div key={index} className="viability-item">
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

