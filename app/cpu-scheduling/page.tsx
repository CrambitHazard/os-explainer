'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { Process, GanttItem, Metrics, Algorithm } from './types'
import { fcfs, sjf, srtf, priority, priorityPreemptive, roundRobin } from './algorithms'
import { exampleCases } from './examples'
import GanttChart from './components/GanttChart'
import ProcessForm from './components/ProcessForm'
import MetricsDisplay from './components/MetricsDisplay'
import './scheduling.css'

export default function CPUScheduling() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS')
  const [inputMode, setInputMode] = useState<'none' | 'example' | 'custom'>('none')
  const [processes, setProcesses] = useState<Process[]>([])
  const [gantt, setGantt] = useState<GanttItem[]>([])
  const [simulatedProcesses, setSimulatedProcesses] = useState<Process[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [showResults, setShowResults] = useState(false)

  const handleAlgorithmChange = (algo: Algorithm) => {
    setAlgorithm(algo)
    resetSimulation()
  }

  const resetSimulation = () => {
    setInputMode('none')
    setProcesses([])
    setGantt([])
    setSimulatedProcesses([])
    setMetrics(null)
    setShowResults(false)
  }

  const loadExample = (exampleType: string) => {
    setProcesses(exampleCases[exampleType])
    setInputMode('example')
    setShowResults(false)
  }

  const addProcess = (process: Process) => {
    setProcesses([...processes, process])
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id))
  }

  const runSimulation = () => {
    if (processes.length === 0) return

    let result: { gantt: GanttItem[], processes: Process[] }

    switch (algorithm) {
      case 'FCFS':
        result = fcfs(processes)
        break
      case 'SJF':
        result = sjf(processes)
        break
      case 'SRTF':
        result = srtf(processes)
        break
      case 'Priority':
        result = priority(processes)
        break
      case 'Priority-Preemptive':
        result = priorityPreemptive(processes)
        break
      case 'RR':
        result = roundRobin(processes, timeQuantum)
        break
      default:
        result = fcfs(processes)
    }

    setGantt(result.gantt)
    setSimulatedProcesses(result.processes)

    // Calculate metrics
    const totalWaiting = result.processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0)
    const totalTurnaround = result.processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0)
    const totalResponse = result.processes.reduce((sum, p) => sum + (p.responseTime || 0), 0)
    const maxTime = Math.max(...result.gantt.map(g => g.end))
    const totalBurst = processes.reduce((sum, p) => sum + p.burstTime, 0)

    setMetrics({
      avgWaitingTime: totalWaiting / result.processes.length,
      avgTurnaroundTime: totalTurnaround / result.processes.length,
      avgResponseTime: totalResponse / result.processes.length,
      cpuUtilization: (totalBurst / maxTime) * 100,
      throughput: result.processes.length / maxTime,
    })

    setShowResults(true)
  }

  return (
    <>
      <ThemeToggle />
      <div className="scheduling-container">
        <div className="scheduling-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>CPU Scheduling Simulator</h1>
          <p>Visualize and compare different CPU scheduling algorithms</p>
        </div>

        {/* Algorithm Selection */}
        <div className="control-panel">
          <div className="control-group">
            <label>Select Algorithm:</label>
            <select 
              value={algorithm} 
              onChange={(e) => handleAlgorithmChange(e.target.value as Algorithm)}
              className="algorithm-select"
            >
              <option value="FCFS">FCFS - First Come First Serve (Non-Preemptive)</option>
              <option value="SJF">SJF - Shortest Job First (Non-Preemptive)</option>
              <option value="SRTF">SRTF - Shortest Remaining Time First (Preemptive)</option>
              <option value="Priority">Priority Scheduling (Non-Preemptive)</option>
              <option value="Priority-Preemptive">Priority Scheduling (Preemptive)</option>
              <option value="RR">Round Robin (Preemptive)</option>
            </select>
          </div>

          {algorithm === 'RR' && (
            <div className="control-group">
              <label>Time Quantum:</label>
              <input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(parseInt(e.target.value) || 2)}
                min="1"
                max="10"
                className="time-quantum-input"
              />
            </div>
          )}
        </div>

        {/* Algorithm Explanation Card */}
        {algorithm && (
          <div className="explanation-section">
            <div className="card algorithm-info-card">
              <h2>
                {algorithm === 'FCFS' ? 'First Come First Serve (FCFS)' : 
                 algorithm === 'SJF' ? 'Shortest Job First (SJF)' :
                 algorithm === 'SRTF' ? 'Shortest Remaining Time First (SRTF)' :
                 algorithm === 'Priority' ? 'Priority Scheduling (Non-Preemptive)' :
                 algorithm === 'Priority-Preemptive' ? 'Priority Scheduling (Preemptive)' :
                 'Round Robin (RR)'}
              </h2>
              <div className="algorithm-badge">
                {algorithm === 'FCFS' || algorithm === 'SJF' || algorithm === 'Priority' ? 'Non-Preemptive' : 'Preemptive'} Algorithm
              </div>
              
              <div className="card-content">
                {algorithm === 'FCFS' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Processes are executed in the exact order they arrive, like customers in a queue. The scheduler maintains a simple FIFO queue, taking the next process when the CPU becomes available.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li>Simple to implement and understand</li>
                        <li>Fair ordering based on arrival time</li>
                        <li>No process can be interrupted once started</li>
                        <li>Can suffer from "convoy effect" with long processes</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Best Used For</h4>
                      <p>Batch processing systems where fairness matters more than efficiency, or scenarios with similar-sized jobs.</p>
                    </div>
                  </div>
                )}
                {algorithm === 'SJF' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Always selects the process with the shortest burst time for execution. Examines all available processes and picks the one requiring the least CPU time.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li>Mathematically optimal for minimizing average waiting time</li>
                        <li>Requires advance knowledge of execution times</li>
                        <li>Non-preemptive - processes run to completion</li>
                        <li>Can cause starvation of longer processes</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Best Used For</h4>
                      <p>Batch systems where job execution times are known in advance and optimizing throughput is important.</p>
                    </div>
                  </div>
                )}
                {algorithm === 'SRTF' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>The preemptive version of SJF that continuously evaluates which process has the shortest remaining time. Can interrupt running processes when shorter ones arrive.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li>Provides optimal average waiting time</li>
                        <li>Requires constant monitoring and comparison</li>
                        <li>Can preempt currently running processes</li>
                        <li>May cause excessive context switching</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Best Used For</h4>
                      <p>Interactive systems where responsiveness is crucial, especially with mixed workloads of short and long processes.</p>
                    </div>
                  </div>
                )}
                {algorithm === 'Priority' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Each process has a priority value (lower numbers = higher priority). The scheduler always selects the highest priority process available for execution.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li>Processes scheduled based on importance levels</li>
                        <li>Non-preemptive - runs to completion once started</li>
                        <li>Good control over process execution order</li>
                        <li>Can lead to starvation of low-priority processes</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Priority Note</h4>
                      <p><strong>Lower numbers = Higher priority</strong> (e.g., priority 1 is higher than priority 5)</p>
                    </div>
                  </div>
                )}
                {algorithm === 'Priority-Preemptive' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Similar to priority scheduling but allows higher priority processes to immediately interrupt lower priority ones. Ensures the highest priority process always runs when available.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li>Immediate preemption for higher priorities</li>
                        <li>Guarantees responsiveness for critical processes</li>
                        <li>Can cause significant context switching overhead</li>
                        <li>Risk of complete starvation for low priorities</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Best Used For</h4>
                      <p>Real-time systems handling emergency scenarios where critical processes need immediate CPU access.</p>
                    </div>
                  </div>
                )}
                {algorithm === 'RR' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Each process gets equal access to the CPU for a fixed time quantum ({timeQuantum} time units). Processes execute in a circular queue fashion, ensuring fairness.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li>Democratic time sharing among all processes</li>
                        <li>Prevents starvation completely</li>
                        <li>Time quantum choice is critical for performance</li>
                        <li>Good balance between fairness and efficiency</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Current Time Quantum</h4>
                      <p><strong>{timeQuantum} time units</strong> - This determines how long each process runs before being preempted.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input Mode Selection */}
        {inputMode === 'none' && (
          <div className="input-mode-selector">
            <h3>How would you like to add processes?</h3>
            <div className="mode-buttons">
              <button 
                onClick={() => setInputMode('example')} 
                className="mode-btn"
              >
                Load Example Case
              </button>
              <button 
                onClick={() => setInputMode('custom')} 
                className="mode-btn"
              >
                Add Custom Processes
              </button>
            </div>
          </div>
        )}

        {/* Example Cases */}
        {inputMode === 'example' && processes.length === 0 && (
          <div className="example-selector">
            <h3>Select an Example Case:</h3>
            <div className="example-buttons">
              <button onClick={() => loadExample('basic')} className="example-btn">
                Basic (4 processes)
              </button>
              <button onClick={() => loadExample('medium')} className="example-btn">
                Medium (5 processes)
              </button>
              <button onClick={() => loadExample('complex')} className="example-btn">
                Complex (7 processes)
              </button>
            </div>
          </div>
        )}

        {/* Custom Process Input */}
        {inputMode === 'custom' && (
          <div className="custom-input">
            <h3>Add Processes:</h3>
            <ProcessForm onAddProcess={addProcess} algorithm={algorithm} />
          </div>
        )}

        {/* Process List */}
        {processes.length > 0 && !showResults && (
          <div className="process-list">
            <h3>Current Processes:</h3>
            <table className="process-table">
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  {(algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && <th>Priority</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.arrivalTime}</td>
                    <td>{p.burstTime}</td>
                    {(algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && <td>{p.priority}</td>}
                    <td>
                      <button 
                        onClick={() => removeProcess(p.id)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="action-buttons">
              {inputMode === 'custom' && (
                <button onClick={() => setInputMode('custom')} className="btn-secondary">
                  Add More Processes
                </button>
              )}
              <button onClick={runSimulation} className="btn-simulate">
                Run Simulation
              </button>
              <button onClick={resetSimulation} className="btn-reset">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="results-section">
            {/* Simulation Analysis Card */}
            <div className="card analysis-card">
              <h2>Simulation Analysis: {algorithm} Results</h2>
              <div className="card-content">
                {algorithm === 'FCFS' && (
                  <div className="analysis-content">
                    <p><strong>What happened:</strong> Processes executed in strict arrival order. 
                    {gantt.some((g, i, arr) => i > 0 && g.start > arr[i-1].end) ? 
                      ' Notice the gaps in execution - this happens when no processes have arrived yet.' :
                      ' All processes were queued and executed sequentially without gaps.'}</p>
                    <p><strong>Key observation:</strong> 
                    {processes.some(p => p.burstTime > 10) ? 
                      ' Long processes created a convoy effect, making shorter processes wait longer than necessary.' :
                      ' With similar burst times, FCFS performed reasonably well.'}</p>
                  </div>
                )}
                {algorithm === 'SJF' && (
                  <div className="analysis-content">
                    <p><strong>What happened:</strong> The scheduler always picked the process with the shortest remaining work. 
                    This minimized total waiting time but required knowing all burst times upfront.</p>
                    <p><strong>Key observation:</strong> 
                    {processes.some(p => p.burstTime > processes.reduce((sum, q) => sum + q.burstTime, 0) / processes.length * 2) ? 
                      ' Long processes were delayed significantly - this is the "starvation" problem of SJF.' :
                      ' With relatively uniform burst times, SJF achieved near-optimal performance.'}</p>
                  </div>
                )}
                {algorithm === 'SRTF' && (
                  <div className="analysis-content">
                    <p><strong>What happened:</strong> The scheduler continuously re-evaluated which process had the least work remaining, 
                    switching between processes as new ones arrived.</p>
                    <p><strong>Key observation:</strong> 
                    {gantt.filter((g, i, arr) => arr.findIndex(x => x.process === g.process) !== i).length > 0 ? 
                      ' You can see context switches where processes were preempted by shorter ones arriving later.' :
                      ' No preemption occurred - arrival times didn\'t create opportunities for better scheduling.'}</p>
                  </div>
                )}
                {algorithm === 'Priority' && (
                  <div className="analysis-content">
                    <p><strong>What happened:</strong> Processes executed based on their priority levels (lower numbers = higher priority). 
                    Once started, each process ran to completion without interruption.</p>
                    <p><strong>Key observation:</strong> 
                    {processes.some(p => (p.priority || 0) > 5) ? 
                      ' Low-priority processes had to wait for all higher-priority ones to finish first.' :
                      ' Priority differences were minimal, so execution was more like FCFS.'}</p>
                  </div>
                )}
                {algorithm === 'Priority-Preemptive' && (
                  <div className="analysis-content">
                    <p><strong>What happened:</strong> Higher priority processes could interrupt lower priority ones immediately upon arrival. 
                    The system constantly maintained the highest priority process in execution.</p>
                    <p><strong>Key observation:</strong> 
                    {gantt.filter((g, i, arr) => arr.findIndex(x => x.process === g.process) !== i).length > 0 ? 
                      ' Preemption occurred when higher priority processes arrived, causing context switches.' :
                      ' No preemption was needed - priority levels and arrival times didn\'t create conflicts.'}</p>
                  </div>
                )}
                {algorithm === 'RR' && (
                  <div className="analysis-content">
                    <p><strong>What happened:</strong> Each process got exactly {timeQuantum} time units before being rotated out. 
                    This created a fair, democratic sharing of CPU time.</p>
                    <p><strong>Key observation:</strong> 
                    {gantt.length > processes.length ? 
                      ` Time quantum of ${timeQuantum} created ${gantt.length - processes.length} context switches. ${timeQuantum > 3 ? 'Consider smaller quantum for better responsiveness.' : timeQuantum < 2 ? 'Very small quantum increases overhead from frequent switching.' : 'Good balance between fairness and efficiency.'}` :
                      ' All processes completed within their first time quantum - consider reducing quantum size.'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gantt Chart Card */}
            <div className="card gantt-card">
              <h2>Execution Timeline (Gantt Chart)</h2>
              <div className="card-content">
                <div className="chart-explanation">
                  <h4>How to Read This Chart</h4>
                  <ul>
                    <li><strong>Horizontal Axis:</strong> Time units from 0 to {Math.max(...gantt.map(g => g.end))}</li>
                    <li><strong>Colored Blocks:</strong> Each color represents a different process executing</li>
                    <li><strong>Block Width:</strong> Shows how long each process ran continuously</li>
                    <li><strong>Gaps:</strong> White spaces indicate CPU idle time (no process ready)</li>
                    <li><strong>Process Switches:</strong> Color changes show when the CPU switches between processes</li>
                  </ul>
                  {gantt.filter((g, i, arr) => arr.findIndex(x => x.process === g.process) !== i).length > 0 && (
                    <p><strong>Context Switches Detected:</strong> This algorithm caused {gantt.filter((g, i, arr) => arr.findIndex(x => x.process === g.process) !== i).length} preemptions where processes were interrupted.</p>
                  )}
                </div>
                <GanttChart gantt={gantt} />
              </div>
            </div>

            {/* Process Results Card */}
            <div className="card process-results-card">
              <h2>Individual Process Results</h2>
              <div className="card-content">
                <div className="process-explanation">
                  <h4>Understanding Process Metrics</h4>
                  <ul>
                    <li><strong>Arrival Time:</strong> When the process first became ready to execute</li>
                    <li><strong>Burst Time:</strong> Total CPU time required by the process</li>
                    <li><strong>Start Time:</strong> When the process first got CPU access</li>
                    <li><strong>Finish Time:</strong> When the process completed execution</li>
                    <li><strong>Waiting Time:</strong> Time spent in ready queue (Finish - Arrival - Burst)</li>
                    <li><strong>Turnaround Time:</strong> Total time from arrival to completion (Finish - Arrival)</li>
                    <li><strong>Response Time:</strong> Time from arrival to first CPU access (Start - Arrival)</li>
                    {(algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && (
                      <li><strong>Priority:</strong> Process importance level (lower number = higher priority)</li>
                    )}
                  </ul>
                </div>
                <MetricsDisplay 
                  processes={simulatedProcesses} 
                  metrics={metrics!} 
                  algorithm={algorithm}
                />
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="card performance-card">
              <h2>Overall Performance Metrics</h2>
              <div className="card-content">
                <div className="metrics-explanation">
                  <h4>What These Numbers Mean</h4>
                  <div className="metric-definitions">
                    <div className="metric-def">
                      <h5>Average Waiting Time: {metrics!.avgWaitingTime.toFixed(2)} time units</h5>
                      <p>Average time processes spent waiting in the ready queue. Lower is better.</p>
                      <span className={`performance-badge ${metrics!.avgWaitingTime < 5 ? 'excellent' : metrics!.avgWaitingTime < 10 ? 'good' : 'poor'}`}>
                        {metrics!.avgWaitingTime < 5 ? 'Excellent' : metrics!.avgWaitingTime < 10 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    
                    <div className="metric-def">
                      <h5>Average Turnaround Time: {metrics!.avgTurnaroundTime.toFixed(2)} time units</h5>
                      <p>Average total time from process arrival to completion. Includes both waiting and execution time.</p>
                    </div>
                    
                    <div className="metric-def">
                      <h5>Average Response Time: {metrics!.avgResponseTime.toFixed(2)} time units</h5>
                      <p>Average time from process arrival to first CPU access. Critical for interactive systems.</p>
                    </div>
                    
                    <div className="metric-def">
                      <h5>CPU Utilization: {metrics!.cpuUtilization.toFixed(1)}%</h5>
                      <p>Percentage of time the CPU was actively executing processes (not idle).</p>
                      <span className={`performance-badge ${metrics!.cpuUtilization > 95 ? 'excellent' : metrics!.cpuUtilization > 80 ? 'good' : 'poor'}`}>
                        {metrics!.cpuUtilization > 95 ? 'Excellent' : metrics!.cpuUtilization > 80 ? 'Good' : 'Inefficient'}
                      </span>
                    </div>
                    
                    <div className="metric-def">
                      <h5>Throughput: {metrics!.throughput.toFixed(2)} processes/time unit</h5>
                      <p>Rate of process completion. Higher values indicate better system productivity.</p>
                    </div>
                  </div>
                  
                  <div className="algorithm-specific-insights">
                    <h4>Algorithm-Specific Insights</h4>
                    {algorithm === 'SJF' || algorithm === 'SRTF' ? (
                      <p>These metrics should be close to optimal for your process mix since SJF/SRTF minimize average waiting time.</p>
                    ) : algorithm === 'FCFS' ? (
                      <p>FCFS often has higher waiting times, especially with mixed burst times, but provides good fairness.</p>
                    ) : algorithm === 'RR' ? (
                      <p>With quantum {timeQuantum}, these metrics represent the fairness vs efficiency tradeoff of Round Robin.</p>
                    ) : (
                      <p>Priority scheduling performance varies widely based on the priority distribution of your processes.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={resetSimulation} className="btn-reset">
                Start New Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
