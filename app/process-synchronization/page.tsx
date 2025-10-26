'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
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
                ✓ Simulation Complete
              </div>
            )}
          </div>
        )}

        {/* Visualizations */}
        {currentState && (
          <div className="visualization-area">
            {mechanism === 'peterson' && petersonState && (
              <>
                <ThreadVisualizer threads={petersonState.threads} />
                <PetersonVisualizer state={petersonState} />
                <LogDisplay log={petersonState.log} />
              </>
            )}
            
            {mechanism === 'semaphore' && semaphoreState && (
              <>
                <ThreadVisualizer threads={semaphoreState.threads} />
                <SemaphoreVisualizer state={semaphoreState} />
                <LogDisplay log={semaphoreState.log} />
              </>
            )}
            
            {mechanism === 'monitor' && monitorState && (
              <>
                <ThreadVisualizer threads={monitorState.threads} />
                <MonitorVisualizer state={monitorState} />
                <LogDisplay log={monitorState.log} />
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
