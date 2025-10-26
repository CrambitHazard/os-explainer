'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { DetectionMethod, RAGState, BankerState, Process, Resource } from './types'
import { ragExamples, bankerExamples } from './examples'
import { detectCycles, buildEdgesFromState, analyzeDeadlock } from './algorithms/ragDetection'
import { runSafetyAlgorithm, requestResources, calculateNeed } from './algorithms/bankerAlgorithm'
import RAGVisualizer from './components/RAGVisualizer'
import BankerVisualizer from './components/BankerVisualizer'
import RequestForm from './components/RequestForm'
import LogDisplay from './components/LogDisplay'
import './deadlock.css'

export default function Deadlock() {
  const [method, setMethod] = useState<DetectionMethod>('rag')
  const [ragState, setRagState] = useState<RAGState | null>(null)
  const [bankerState, setBankerState] = useState<BankerState | null>(null)
  const [requestResult, setRequestResult] = useState<string | null>(null)

  const handleMethodChange = (newMethod: DetectionMethod) => {
    setMethod(newMethod)
    resetSimulation()
  }

  const resetSimulation = () => {
    setRagState(null)
    setBankerState(null)
    setRequestResult(null)
  }

  const loadRAGExample = (exampleKey: string) => {
    const example = ragExamples[exampleKey as keyof typeof ragExamples]
    
    const processes: Process[] = example.processes.map(p => ({
      ...p,
      need: p.maximum.map((max, i) => max - p.allocation[i]),
      finished: false,
    }))

    const resources: Resource[] = example.resources.map(r => ({
      ...r,
      allocated: processes.reduce((sum, p) => sum + (p.allocation[r.id] || 0), 0),
    }))

    // Build edges
    let edges = buildEdgesFromState(processes, resources)
    
    // Add manual request edges for specific examples
    if ('requestEdges' in example) {
      edges = [...edges, ...(example.requestEdges as any)]
    }

    const cycles = detectCycles({ processes, resources, edges, cycles: [], hasDeadlock: false, log: [] })
    const analysis = analyzeDeadlock(cycles)

    setRagState({
      processes,
      resources,
      edges,
      cycles,
      hasDeadlock: analysis.hasDeadlock,
      log: analysis.analysis.map((msg, i) => ({
        step: i,
        message: msg,
        type: msg.startsWith('✓') ? 'success' : msg.startsWith('✗') ? 'error' : 'info',
        timestamp: Date.now(),
      })),
    })
  }

  const loadBankerExample = (exampleKey: string) => {
    const example = bankerExamples[exampleKey as keyof typeof bankerExamples]
    
    const processes: Process[] = calculateNeed(example.processes.map(p => ({
      ...p,
      need: [],
      finished: false,
    })))

    const resources: Resource[] = example.resources.map((r, i) => ({
      ...r,
      available: example.available[i],
      allocated: processes.reduce((sum, p) => sum + p.allocation[i], 0),
    }))

    const initialState: BankerState = {
      processes,
      resources,
      available: [...example.available],
      safeSequence: [],
      isSafe: false,
      currentStep: 0,
      log: [],
    }

    const resultState = runSafetyAlgorithm(initialState)
    setBankerState(resultState)
    setRequestResult(null)
  }

  const handleResourceRequest = (processId: number, request: number[]) => {
    if (!bankerState) return

    const result = requestResources(bankerState, processId, request)
    
    if (result.granted && result.newState) {
      setBankerState(result.newState)
      setRequestResult(`✓ ${result.reason}`)
    } else {
      setRequestResult(`✗ ${result.reason}`)
    }

    // Clear message after 5 seconds
    setTimeout(() => setRequestResult(null), 5000)
  }

  return (
    <>
      <ThemeToggle />
      <div className="deadlock-container">
        <div className="deadlock-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>Deadlock Detection & Avoidance</h1>
          <p>Visualize resource allocation graphs and Banker's Algorithm</p>
        </div>

        {/* Method Selection */}
        <div className="control-panel">
          <div className="control-group">
            <label>Select Method:</label>
            <select 
              value={method} 
              onChange={(e) => handleMethodChange(e.target.value as DetectionMethod)}
              className="method-select"
            >
              <option value="rag">Resource Allocation Graph (Cycle Detection)</option>
              <option value="banker">Banker's Algorithm (Deadlock Avoidance)</option>
            </select>
          </div>
        </div>

        {/* Example Selection */}
        {!ragState && !bankerState && (
          <div className="example-selector">
            <h3>Select a Scenario:</h3>
            <div className="example-grid">
              {method === 'rag' && (
                <>
                  {Object.entries(ragExamples).map(([key, example]) => (
                    <button 
                      key={key}
                      onClick={() => loadRAGExample(key)} 
                      className="example-card"
                    >
                      <h4>{example.name}</h4>
                      <p>{example.description}</p>
                      <div className="scenario-stats">
                        <span>{example.processes.length} Processes</span>
                        <span>{example.resources.length} Resources</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {method === 'banker' && (
                <>
                  {Object.entries(bankerExamples).map(([key, example]) => (
                    <button 
                      key={key}
                      onClick={() => loadBankerExample(key)} 
                      className="example-card"
                    >
                      <h4>{example.name}</h4>
                      <p>{example.description}</p>
                      <div className="scenario-stats">
                        <span>{example.processes.length} Processes</span>
                        <span>{example.resources.length} Resources</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* RAG Visualization */}
        {ragState && (
          <div className="visualization-area">
            <div className="control-buttons">
              <button onClick={resetSimulation} className="btn-reset">
                Load New Scenario
              </button>
            </div>
            <RAGVisualizer state={ragState} />
            <LogDisplay log={ragState.log} />
          </div>
        )}

        {/* Banker's Algorithm Visualization */}
        {bankerState && (
          <div className="visualization-area">
            <div className="control-buttons">
              <button onClick={resetSimulation} className="btn-reset">
                Load New Scenario
              </button>
            </div>

            {requestResult && (
              <div className={`request-result ${requestResult.startsWith('✓') ? 'success' : 'error'}`}>
                {requestResult}
              </div>
            )}

            <BankerVisualizer state={bankerState} />
            
            {bankerState.isSafe && (
              <RequestForm state={bankerState} onRequest={handleResourceRequest} />
            )}
            
            <LogDisplay log={bankerState.log} />
          </div>
        )}

        {/* Information Panel */}
        {!ragState && !bankerState && (
          <div className="info-panel">
            <div className="info-section">
              <h3>Resource Allocation Graph</h3>
              <ul>
                <li>Visual representation of processes and resources</li>
                <li>Shows allocation and request edges</li>
                <li>Detects cycles using DFS algorithm</li>
                <li>Circular wait indicates potential deadlock</li>
              </ul>
            </div>
            
            <div className="info-section">
              <h3>Banker's Algorithm</h3>
              <ul>
                <li>Deadlock avoidance technique</li>
                <li>Checks if system is in safe state</li>
                <li>Simulates resource allocation before granting</li>
                <li>Finds safe sequence if one exists</li>
                <li>Test resource requests for safety</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
