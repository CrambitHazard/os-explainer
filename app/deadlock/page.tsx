'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
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
      setRequestResult(`success: ${result.reason}`)
    } else {
      setRequestResult(`error: ${result.reason}`)
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

        {method && (
          <div className="explanation-section">
            <div className="card method-info-card">
              <h2>
                {method === 'rag' ? 'Resource Allocation Graph (RAG)' : 'Banker\'s Algorithm'}
              </h2>
              <div className="method-badge">
                {method === 'rag' ? 'Deadlock Detection Strategy' : 'Deadlock Avoidance Strategy'}
              </div>
              
              <div className="card-content">
                {method === 'rag' && (
                  <div className="method-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>A visual representation showing processes, resources, and their relationships through directed edges. Detects deadlocks by finding cycles in the graph structure using depth-first search.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Detection Process</h4>
                      <ul>
                        <li>Build resource allocation graph from current system state</li>
                        <li>Run depth-first search to detect cycles</li>
                        <li>If cycles exist, deadlock is present</li>
                        <li>Identify processes involved in the deadlock</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Graph Components</h4>
                      <p><strong>Allocation Edges:</strong> From resources to processes (who owns what)</p>
                      <p><strong>Request Edges:</strong> From processes to resources (who wants what)</p>
                      <p><strong>Cycles:</strong> Indicate circular waiting - the hallmark of deadlock</p>
                    </div>
                  </div>
                )}
                {method === 'banker' && (
                  <div className="method-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>A conservative algorithm that prevents deadlocks by ensuring the system always remains in a "safe state" where all processes can complete execution given available resources.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Safety Algorithm</h4>
                      <ul>
                        <li>Find a process that can complete with available resources</li>
                        <li>Assume it completes and releases all resources</li>
                        <li>Repeat until all processes can complete (safe) or none can (unsafe)</li>
                        <li>Only grant requests that leave system in safe state</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Key Matrices</h4>
                      <p><strong>Allocation:</strong> Resources currently allocated to each process</p>
                      <p><strong>Max:</strong> Maximum resources each process may need</p>
                      <p><strong>Need:</strong> Remaining resources each process requires (Max - Allocation)</p>
                      <p><strong>Available:</strong> Resources currently available in the system</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

            {/* RAG Analysis Card */}
            <div className="card analysis-card">
              <h2>Deadlock Analysis Results</h2>
              <div className="card-content">
                <div className="analysis-content">
                  <p><strong>Detection Status:</strong> {ragState.hasDeadlock ? 'Deadlock Detected!' : 'No Deadlock Found'}</p>
                  {ragState.hasDeadlock && (
                    <p><strong>Cycles Found:</strong> {ragState.cycles.length} circular wait condition(s) detected in the resource allocation graph.</p>
                  )}
                  {ragState.cycles.length > 0 && (
                    <p><strong>Affected Processes:</strong> The deadlock involves processes that are waiting for resources held by each other, creating an unresolvable circular dependency.</p>
                  )}
                </div>
              </div>
            </div>

            {/* RAG Visualization Card */}
            <div className="card rag-viz-card">
              <h2>Resource Allocation Graph</h2>
              <div className="card-content">
                <div className="rag-explanation">
                  <h4>Reading the Graph</h4>
                  <ul>
                    <li><strong>Rectangles:</strong> Represent resources in the system</li>
                    <li><strong>Circles:</strong> Represent processes in the system</li>
                    <li><strong>Solid Arrows:</strong> Allocation edges (resource → process) showing ownership</li>
                    <li><strong>Dashed Arrows:</strong> Request edges (process → resource) showing waiting</li>
                    <li><strong>Cycles:</strong> Circular paths indicate deadlock conditions</li>
                  </ul>
                </div>
                <RAGVisualizer state={ragState} />
              </div>
            </div>

            {/* Detection Log Card */}
            <div className="card log-card">
              <h2>Detection Analysis Log</h2>
              <div className="card-content">
                <div className="log-explanation">
                  <h4>Understanding the Analysis</h4>
                  <p>This log shows the step-by-step deadlock detection process:</p>
                  <ul>
                    <li><strong>Graph Construction:</strong> Building edges from current allocations and requests</li>
                    <li><strong>Cycle Detection:</strong> Using depth-first search to find circular dependencies</li>
                    <li><strong>Result Analysis:</strong> Determining if deadlock exists and which processes are involved</li>
                  </ul>
                </div>
                <LogDisplay log={ragState.log} />
              </div>
            </div>
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
              <div className={`request-result ${requestResult.startsWith('success') ? 'success' : 'error'}`}>
                {requestResult.startsWith('success') ? (
                  <><Icon name="check" size={16} /> {requestResult.replace('success: ', '')}</>
                ) : (
                  <><Icon name="cross" size={16} /> {requestResult.replace('error: ', '')}</>
                )}
              </div>
            )}

            {/* Safety Analysis Card */}
            <div className="card analysis-card">
              <h2>Safety Analysis Results</h2>
              <div className="card-content">
                <div className="analysis-content">
                  <p><strong>System State:</strong> {bankerState.isSafe ? 'Safe State' : 'Unsafe State'}</p>
                  {bankerState.isSafe && bankerState.safeSequence.length > 0 && (
                    <p><strong>Safe Sequence:</strong> P{bankerState.safeSequence.join(' → P')} - This execution order guarantees all processes can complete.</p>
                  )}
                  <p><strong>Available Resources:</strong> {bankerState.available.join(', ')} units currently available for allocation.</p>
                </div>
              </div>
            </div>

            {/* Banker State Visualization Card */}
            <div className="card banker-viz-card">
              <h2>System Resource State</h2>
              <div className="card-content">
                <div className="banker-explanation">
                  <h4>Understanding the Matrices</h4>
                  <ul>
                    <li><strong>Allocation Matrix:</strong> Resources currently allocated to each process</li>
                    <li><strong>Max Matrix:</strong> Maximum resources each process may request</li>
                    <li><strong>Need Matrix:</strong> Remaining resources each process requires (Max - Allocation)</li>
                    <li><strong>Available Vector:</strong> Resources currently available in the system</li>
                    <li><strong>Safe Sequence:</strong> Order in which processes can execute safely</li>
                  </ul>
                </div>
                <BankerVisualizer state={bankerState} />
              </div>
            </div>

            {/* Resource Request Card */}
            {bankerState.isSafe && (
              <div className="card request-card">
                <h2>Test Resource Requests</h2>
                <div className="card-content">
                  <div className="request-explanation">
                    <h4>Making Resource Requests</h4>
                    <p>Test how the Banker's Algorithm handles resource requests:</p>
                    <ul>
                      <li>Select a process and specify resource amounts to request</li>
                      <li>The algorithm will check if granting the request keeps the system safe</li>
                      <li>If safe, the request is granted and matrices are updated</li>
                      <li>If unsafe, the request is denied to prevent potential deadlock</li>
                    </ul>
                  </div>
                  <RequestForm state={bankerState} onRequest={handleResourceRequest} />
                </div>
              </div>
            )}

            {/* Execution Log Card */}
            <div className="card log-card">
              <h2>Safety Algorithm Log</h2>
              <div className="card-content">
                <div className="log-explanation">
                  <h4>Following the Safety Check</h4>
                  <p>This log shows the safety algorithm execution:</p>
                  <ul>
                    <li><strong>Process Selection:</strong> Finding processes that can complete with available resources</li>
                    <li><strong>Resource Release:</strong> Simulating completion and resource return</li>
                    <li><strong>State Updates:</strong> Updating available resources after each completion</li>
                    <li><strong>Sequence Building:</strong> Constructing the safe execution sequence</li>
                  </ul>
                </div>
                <LogDisplay log={bankerState.log} />
              </div>
            </div>
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
