'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import { SyncMechanism, PetersonState, SemaphoreState, MonitorState } from './types'
import { scenarios } from './examples'
import { initializePeterson, stepPeterson, isComplete as isPetersonComplete } from './simulators/petersonSimulator'
import { initializeSemaphore, stepSemaphore, isComplete as isSemaphoreComplete } from './simulators/semaphoreSimulator'
import { initializeMonitor, stepMonitor, isComplete as isMonitorComplete } from './simulators/monitorSimulator'
import ThreadVisualizer from './components/ThreadVisualizer'
import PetersonVisualizer from './components/PetersonVisualizer'
import SemaphoreVisualizer from './components/SemaphoreVisualizer'
import MonitorVisualizer from './components/MonitorVisualizer'
import LogDisplay from './components/LogDisplay'
import './synchronization.css'

export default function ProcessSynchronization() {
  const [mechanism, setMechanism] = useState<SyncMechanism>('peterson')
  const [petersonState, setPetersonState] = useState<PetersonState | null>(null)
  const [semaphoreState, setSemaphoreState] = useState<SemaphoreState | null>(null)
  const [monitorState, setMonitorState] = useState<MonitorState | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1000)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      handleStep()
    }, speed)

    return () => clearInterval(interval)
  }, [isRunning, mechanism, petersonState, semaphoreState, monitorState, speed])

  const handleMechanismChange = (newMechanism: SyncMechanism) => {
    setMechanism(newMechanism)
    resetSimulation()
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setPetersonState(null)
    setSemaphoreState(null)
    setMonitorState(null)
  }

  const loadExample = (exampleType: string) => {
    setIsRunning(false)

    if (mechanism === 'peterson') {
      setPetersonState(initializePeterson())
    } else if (mechanism === 'semaphore') {
      const config = scenarios.semaphore[exampleType as keyof typeof scenarios.semaphore]
      if (config && 'initialValue' in config && 'threadCount' in config) {
        setSemaphoreState(initializeSemaphore(config.initialValue, config.threadCount))
      }
    } else if (mechanism === 'monitor') {
      const config = scenarios.monitor[exampleType as keyof typeof scenarios.monitor]
      if (config && 'threadCount' in config) {
        setMonitorState(initializeMonitor(config.threadCount))
      }
    }
  }

  const handleStep = () => {
    if (mechanism === 'peterson' && petersonState) {
      if (!isPetersonComplete(petersonState)) {
        setPetersonState(stepPeterson(petersonState))
      } else {
        setIsRunning(false)
      }
    } else if (mechanism === 'semaphore' && semaphoreState) {
      if (!isSemaphoreComplete(semaphoreState)) {
        setSemaphoreState(stepSemaphore(semaphoreState))
      } else {
        setIsRunning(false)
      }
    } else if (mechanism === 'monitor' && monitorState) {
      if (!isMonitorComplete(monitorState)) {
        setMonitorState(stepMonitor(monitorState))
      } else {
        setIsRunning(false)
      }
    }
  }

  const toggleAutoRun = () => {
    setIsRunning(!isRunning)
  }

  const getCurrentState = () => {
    if (mechanism === 'peterson') return petersonState
    if (mechanism === 'semaphore') return semaphoreState
    if (mechanism === 'monitor') return monitorState
    return null
  }

  const isComplete = () => {
    if (mechanism === 'peterson' && petersonState) return isPetersonComplete(petersonState)
    if (mechanism === 'semaphore' && semaphoreState) return isSemaphoreComplete(semaphoreState)
    if (mechanism === 'monitor' && monitorState) return isMonitorComplete(monitorState)
    return false
  }

  const currentState = getCurrentState()

  return (
    <>
      <ThemeToggle />
      <div className="sync-container">
        <div className="sync-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>Process Synchronization</h1>
          <p>Visualize mutual exclusion and synchronization mechanisms</p>
        </div>

        {mechanism && (
          <div className="explanation-section">
            <div className="card mechanism-info-card">
              <h2>
                {mechanism === 'peterson' ? 'Peterson\'s Algorithm' :
                 mechanism === 'semaphore' ? 'Semaphores' :
                 'Monitors'}
              </h2>
              <div className="mechanism-badge">
                {mechanism === 'peterson' ? 'Software-Based Mutual Exclusion' :
                 mechanism === 'semaphore' ? 'Counting-Based Synchronization' :
                 'High-Level Synchronization Construct'}
              </div>
              
              <div className="card-content">
                {mechanism === 'peterson' && (
                  <div className="mechanism-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>A software-only solution for mutual exclusion between exactly two processes. Uses shared variables (flag[] and turn) to coordinate access to critical sections without hardware support.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Properties</h4>
                      <ul>
                        <li><strong>Mutual Exclusion:</strong> At most one process in critical section</li>
                        <li><strong>Progress:</strong> If no process is in critical section, one can enter</li>
                        <li><strong>Bounded Waiting:</strong> No process waits forever</li>
                        <li><strong>No Hardware Support:</strong> Pure software solution</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Algorithm Variables</h4>
                      <p><strong>flag[2]:</strong> Each process sets its flag to indicate intention to enter critical section</p>
                      <p><strong>turn:</strong> Resolves conflicts when both processes want access simultaneously</p>
                    </div>
                  </div>
                )}
                {mechanism === 'semaphore' && (
                  <div className="mechanism-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>A synchronization primitive with an integer counter representing available resources. Processes use wait() (P) to request and signal() (V) to release resources.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Properties</h4>
                      <ul>
                        <li><strong>Atomic Operations:</strong> Wait() and Signal() are indivisible</li>
                        <li><strong>FIFO Queuing:</strong> Waiting processes served in order</li>
                        <li><strong>Resource Counting:</strong> Tracks available resource instances</li>
                        <li><strong>Binary or Counting:</strong> Can be mutex (0/1) or resource manager</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Operations</h4>
                      <p><strong>wait() / P():</strong> Decrements counter, blocks if negative</p>
                      <p><strong>signal() / V():</strong> Increments counter, wakes waiting process</p>
                    </div>
                  </div>
                )}
                {mechanism === 'monitor' && (
                  <div className="mechanism-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>A high-level construct that encapsulates shared data and procedures. Provides automatic mutual exclusion with condition variables for complex coordination.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Properties</h4>
                      <ul>
                        <li><strong>Automatic Mutual Exclusion:</strong> Built into language/runtime</li>
                        <li><strong>Condition Variables:</strong> Wait for specific conditions</li>
                        <li><strong>Structured Approach:</strong> Encapsulates data and operations</li>
                        <li><strong>Exception Safety:</strong> Handles errors gracefully</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Monitor Operations</h4>
                      <p><strong>wait(condition):</strong> Suspend until condition becomes true</p>
                      <p><strong>signal(condition):</strong> Wake up processes waiting on condition</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mechanism Selection */}
        <div className="control-panel">
          <div className="control-group">
            <label>Select Synchronization Mechanism:</label>
            <select 
              value={mechanism} 
              onChange={(e) => handleMechanismChange(e.target.value as SyncMechanism)}
              className="mechanism-select"
            >
              <option value="peterson">Peterson's Algorithm</option>
              <option value="semaphore">Semaphores</option>
              <option value="monitor">Monitors</option>
            </select>
          </div>
        </div>

        {/* Example Selection */}
        {!currentState && (
          <div className="example-selector">
            <h3>Select a Scenario:</h3>
            <div className="example-grid">
              {mechanism === 'peterson' && (
                <>
                  {Object.entries(scenarios.peterson).map(([key, scenario]) => (
                    <button 
                      key={key}
                      onClick={() => loadExample(key)} 
                      className="example-card"
                    >
                      <h4>{scenario.name}</h4>
                      <p>{scenario.description}</p>
                    </button>
                  ))}
                </>
              )}
              {mechanism === 'semaphore' && (
                <>
                  {Object.entries(scenarios.semaphore).map(([key, scenario]) => (
                    <button 
                      key={key}
                      onClick={() => loadExample(key)} 
                      className="example-card"
                    >
                      <h4>{scenario.name}</h4>
                      <p>{scenario.description}</p>
                      {'initialValue' in scenario && (
                        <div className="scenario-params">
                          <span>Initial: {scenario.initialValue}</span>
                          <span>Threads: {scenario.threadCount}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </>
              )}
              {mechanism === 'monitor' && (
                <>
                  {Object.entries(scenarios.monitor).map(([key, scenario]) => (
                    <button 
                      key={key}
                      onClick={() => loadExample(key)} 
                      className="example-card"
                    >
                      <h4>{scenario.name}</h4>
                      <p>{scenario.description}</p>
                      {'threadCount' in scenario && (
                        <div className="scenario-params">
                          <span>Threads: {scenario.threadCount}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Simulation Controls */}
        {currentState && (
          <div className="simulation-controls">
            <button 
              onClick={handleStep} 
              className="btn-step"
              disabled={isRunning || isComplete()}
            >
              Step Forward
            </button>
            <button 
              onClick={toggleAutoRun} 
              className={isRunning ? 'btn-pause' : 'btn-run'}
              disabled={isComplete()}
            >
              {isRunning ? 'Pause' : 'Auto Run'}
            </button>
            <div className="speed-control">
              <label>Speed:</label>
              <input
                type="range"
                min="200"
                max="2000"
                step="200"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
              />
              <span>{(2000 - speed) / 200}x</span>
            </div>
            <button onClick={resetSimulation} className="btn-reset">
              Reset
            </button>
            {isComplete() && (
              <div className="completion-badge">
                <Icon name="check" size={16} /> Simulation Complete
              </div>
            )}
          </div>
        )}

        {/* Visualizations */}
        {currentState && (
          <div className="visualization-area">
            {/* Live Analysis Card */}
            <div className="card analysis-card">
              <h2>Live Synchronization Analysis</h2>
              <div className="card-content">
                {mechanism === 'peterson' && petersonState && (
                  <div className="analysis-content">
                    <p><strong>Current State:</strong> 
                    {petersonState.threads.some(t => t.inCriticalSection) ? (
                      <>Thread {petersonState.threads.find(t => t.inCriticalSection)?.id} is in the critical section. 
                      The other thread is {petersonState.threads.find(t => !t.inCriticalSection)?.wanting ? 'waiting politely, respecting the turn mechanism.' : 'not interested in entering right now.'}</>
                    ) : (
                      'Both threads are outside their critical sections. Watch how they coordinate when they want to enter.'
                    )}
                    </p>
                    <p><strong>Algorithm Variables:</strong> The flag[] array shows each thread's intention, while the turn variable resolves conflicts when both want access simultaneously.</p>
                  </div>
                )}
                
                {mechanism === 'semaphore' && semaphoreState && (
                  <div className="analysis-content">
                    <p><strong>Current State:</strong> 
                    Semaphore value is {semaphoreState.semaphoreValue}. 
                    {semaphoreState.semaphoreValue > 0 ? 
                      `${semaphoreState.semaphoreValue} thread(s) can still acquire resources.` : 
                      'Resource is fully utilized - threads must wait for someone to release.'}
                    </p>
                    <p><strong>Queue Status:</strong> 
                    {semaphoreState.waitingQueue.length > 0 ? 
                      `${semaphoreState.waitingQueue.length} threads waiting in FIFO queue. First one in line gets the next available resource.` :
                      'No queue currently - all threads can proceed or are working.'}</p>
                  </div>
                )}
                
                {mechanism === 'monitor' && monitorState && (
                  <div className="analysis-content">
                    <p><strong>Current State:</strong> 
                    {monitorState.threads.some(t => t.inMonitor) ? (
                      <>Thread {monitorState.threads.find(t => t.inMonitor)?.id} has exclusive access to the monitor. 
                      {monitorState.threads.filter(t => !t.inMonitor && t.state === 'waiting').length > 0 ? 
                        'Other threads are blocked at the monitor entrance.' : 
                        'Other threads are working outside the monitor.'}</>
                    ) : (
                      'Monitor is available - any thread can enter and gain exclusive access.'
                    )}
                    </p>
                    <p><strong>Coordination:</strong> The monitor automatically provides mutual exclusion - no manual locking needed! Condition variables handle complex wait/signal patterns.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thread Visualizer Card */}
            <div className="card thread-card">
              <h2>Thread Status Visualization</h2>
              <div className="card-content">
                <div className="thread-explanation">
                  <h4>Understanding Thread States</h4>
                  <ul>
                    <li><strong>Running:</strong> Thread is actively executing</li>
                    <li><strong>Waiting:</strong> Thread is blocked waiting for synchronization</li>
                    <li><strong>Ready:</strong> Thread is ready to run but not currently executing</li>
                    <li><strong>In Critical Section:</strong> Thread has exclusive access to shared resource</li>
                    {mechanism === 'monitor' && <li><strong>In Monitor:</strong> Thread is executing inside the monitor</li>}
                  </ul>
                </div>
                {mechanism === 'peterson' && petersonState && <ThreadVisualizer threads={petersonState.threads} />}
                {mechanism === 'semaphore' && semaphoreState && <ThreadVisualizer threads={semaphoreState.threads} />}
                {mechanism === 'monitor' && monitorState && <ThreadVisualizer threads={monitorState.threads} />}
              </div>
            </div>

            {/* Algorithm-Specific Visualizer Card */}
            <div className="card mechanism-viz-card">
              <h2>
                {mechanism === 'peterson' ? 'Peterson\'s Algorithm Variables' :
                 mechanism === 'semaphore' ? 'Semaphore State' :
                 'Monitor Structure'}
              </h2>
              <div className="card-content">
                {mechanism === 'peterson' && petersonState && (
                  <div className="peterson-explanation">
                    <h4>Algorithm Variables</h4>
                    <ul>
                      <li><strong>flag[0], flag[1]:</strong> Each thread's intention to enter critical section</li>
                      <li><strong>turn:</strong> Determines which thread has priority when both want access</li>
                      <li><strong>Critical Section:</strong> The protected code region only one thread can execute</li>
                    </ul>
                    <PetersonVisualizer state={petersonState} />
                  </div>
                )}
                
                {mechanism === 'semaphore' && semaphoreState && (
                  <div className="semaphore-explanation">
                    <h4>Semaphore Components</h4>
                    <ul>
                      <li><strong>Counter Value:</strong> Number of available resources (current: {semaphoreState.semaphoreValue})</li>
                      <li><strong>Waiting Queue:</strong> Threads blocked waiting for resources</li>
                      <li><strong>wait() Operation:</strong> Decrements counter, blocks if negative</li>
                      <li><strong>signal() Operation:</strong> Increments counter, wakes waiting thread</li>
                    </ul>
                    <SemaphoreVisualizer state={semaphoreState} />
                  </div>
                )}
                
                {mechanism === 'monitor' && monitorState && (
                  <div className="monitor-explanation">
                    <h4>Monitor Components</h4>
                    <ul>
                      <li><strong>Entry Queue:</strong> Threads waiting to enter the monitor</li>
                      <li><strong>Condition Variables:</strong> Allow threads to wait for specific conditions</li>
                      <li><strong>Mutual Exclusion:</strong> Automatically enforced by the monitor</li>
                      <li><strong>Procedures:</strong> Only one can execute at a time</li>
                    </ul>
                    <MonitorVisualizer state={monitorState} />
                  </div>
                )}
              </div>
            </div>

            {/* Execution Log Card */}
            <div className="card log-card">
              <h2>Execution Log</h2>
              <div className="card-content">
                <div className="log-explanation">
                  <h4>Reading the Execution Log</h4>
                  <p>This chronological log shows every synchronization event in the simulation:</p>
                  <ul>
                    <li><strong>Timestamps:</strong> When each operation occurred</li>
                    <li><strong>Thread Actions:</strong> Entry attempts, critical section access, exits</li>
                    <li><strong>Variable Changes:</strong> Updates to flags, turn, semaphore values</li>
                    <li><strong>Blocking/Unblocking:</strong> When threads wait and resume</li>
                  </ul>
                </div>
                {mechanism === 'peterson' && petersonState && <LogDisplay log={petersonState.log} />}
                {mechanism === 'semaphore' && semaphoreState && <LogDisplay log={semaphoreState.log} />}
                {mechanism === 'monitor' && monitorState && <LogDisplay log={monitorState.log} />}
              </div>
            </div>

            {/* Completion Analysis */}
            {isComplete() && (
              <div className="card completion-card">
                <h2>Synchronization Complete!</h2>
                <div className="card-content">
                  <div className="completion-insights">
                    {mechanism === 'peterson' && (
                      <p>Peterson's algorithm successfully coordinated both threads without deadlock or starvation. 
                      This elegant software solution proves that hardware support isn't always necessary for mutual exclusion.</p>
                    )}
                    {mechanism === 'semaphore' && (
                      <p>The semaphore effectively managed resource access, maintaining the invariant that only the allowed number of threads could proceed simultaneously. 
                      Notice how the FIFO queue ensured fairness.</p>
                    )}
                    {mechanism === 'monitor' && (
                      <p>The monitor provided clean, high-level synchronization with automatic mutual exclusion. 
                      Condition variables enabled sophisticated coordination patterns without low-level complexity.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
