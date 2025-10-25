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
                🚀 Run Simulation
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
            <GanttChart gantt={gantt} />
            <MetricsDisplay 
              processes={simulatedProcesses} 
              metrics={metrics!} 
              algorithm={algorithm}
            />
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
