'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { Algorithm, SimulationResult } from './types'
import { exampleReferenceStrings } from './examples'
import { fifo } from './algorithms/fifo'
import { lru } from './algorithms/lru'
import { optimal } from './algorithms/optimal'
import PageFrameVisualizer from './components/PageFrameVisualizer'
import ReferenceStringDisplay from './components/ReferenceStringDisplay'
import MetricsDisplay from './components/MetricsDisplay'
import ComparisonView from './components/ComparisonView'
import './paging.css'

export default function MemoryPaging() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('FIFO')
  const [referenceString, setReferenceString] = useState<number[]>([])
  const [numFrames, setNumFrames] = useState(3)
  const [customInput, setCustomInput] = useState('')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  const [comparisonResults, setComparisonResults] = useState<SimulationResult[]>([])

  const handleAlgorithmChange = (algo: Algorithm) => {
    setAlgorithm(algo)
    if (result) {
      runSimulation(referenceString, numFrames, algo)
    }
  }

  const loadExample = (exampleKey: string) => {
    const example = exampleReferenceStrings[exampleKey as keyof typeof exampleReferenceStrings]
    setReferenceString(example.string)
    setNumFrames(example.frames)
    setCustomInput(example.string.join(', '))
    setResult(null)
    setCompareMode(false)
    setComparisonResults([])
  }

  const handleCustomInput = () => {
    const numbers = customInput
      .split(/[\s,]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 0)
    
    if (numbers.length > 0) {
      setReferenceString(numbers)
      setResult(null)
      setCompareMode(false)
      setComparisonResults([])
    }
  }

  const runSimulation = (refString: number[], frames: number, algo?: Algorithm) => {
    const selectedAlgo = algo || algorithm
    let simulationResult: SimulationResult

    switch (selectedAlgo) {
      case 'FIFO':
        simulationResult = fifo(refString, frames)
        break
      case 'LRU':
        simulationResult = lru(refString, frames)
        break
      case 'Optimal':
        simulationResult = optimal(refString, frames)
        break
    }

    setResult(simulationResult)
    setCurrentStep(0)
  }

  const runComparison = () => {
    const fifoResult = fifo(referenceString, numFrames)
    const lruResult = lru(referenceString, numFrames)
    const optimalResult = optimal(referenceString, numFrames)

    setComparisonResults([fifoResult, lruResult, optimalResult])
    setCompareMode(true)
    setResult(null)
  }

  const handleStepChange = (step: number) => {
    if (result && step >= 0 && step < result.steps.length) {
      setCurrentStep(step)
    }
  }

  const reset = () => {
    setReferenceString([])
    setCustomInput('')
    setResult(null)
    setCurrentStep(0)
    setCompareMode(false)
    setComparisonResults([])
  }

  return (
    <>
      <ThemeToggle />
      <div className="paging-container">
        <div className="paging-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>Memory Management - Paging</h1>
          <p>Simulate page replacement algorithms: FIFO, LRU, and Optimal</p>
        </div>

        {algorithm && (
          <div className="explanation-section">
            <div className="card algorithm-info-card">
              <h2>
                {algorithm === 'FIFO' ? 'FIFO (First In, First Out)' :
                 algorithm === 'LRU' ? 'LRU (Least Recently Used)' :
                 'Optimal Page Replacement'}
              </h2>
              <div className="algorithm-badge">
                {algorithm === 'FIFO' ? 'Simple Queue-Based Strategy' :
                 algorithm === 'LRU' ? 'Temporal Locality-Based Strategy' :
                 'Theoretical Optimal Strategy'}
              </div>
              
              <div className="card-content">
                {algorithm === 'FIFO' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Replace the page that has been in memory the longest, regardless of access patterns. Maintains a simple queue where pages are removed in the order they were loaded.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li><strong>Time Complexity:</strong> O(1) for replacement decision</li>
                        <li><strong>Space Complexity:</strong> O(n) for queue maintenance</li>
                        <li><strong>Belady's Anomaly:</strong> Can occur - more frames may increase faults</li>
                        <li><strong>Implementation:</strong> Very simple, just a queue</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Best Used For</h4>
                      <p>Simple systems, embedded systems with limited processing power, or scenarios where access patterns are truly random.</p>
                    </div>
                  </div>
                )}
                {algorithm === 'LRU' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Replace the page that hasn't been accessed for the longest time. Based on temporal locality principle - recently used pages are likely to be used again soon.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li><strong>Time Complexity:</strong> O(1) with proper data structures</li>
                        <li><strong>Space Complexity:</strong> O(n) for tracking access history</li>
                        <li><strong>Locality:</strong> Excellent exploitation of temporal locality</li>
                        <li><strong>Implementation:</strong> Moderate complexity, various approximations available</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Implementation Methods</h4>
                      <p><strong>Counters:</strong> Track access times with timestamps</p>
                      <p><strong>Stack:</strong> Push accessed pages to top, replace from bottom</p>
                      <p><strong>Approximations:</strong> Clock algorithm, reference bits</p>
                    </div>
                  </div>
                )}
                {algorithm === 'Optimal' && (
                  <div className="algorithm-details">
                    <div className="detail-section">
                      <h4>How It Works</h4>
                      <p>Replace the page that will be accessed farthest in the future (or never again). Provides theoretical minimum page faults for any reference string.</p>
                    </div>
                    <div className="detail-section">
                      <h4>Key Characteristics</h4>
                      <ul>
                        <li><strong>Page Faults:</strong> Absolute minimum possible</li>
                        <li><strong>Benchmark:</strong> Gold standard for comparing other algorithms</li>
                        <li><strong>Practicality:</strong> Impossible to implement in real systems</li>
                        <li><strong>Analysis:</strong> Used for offline analysis of reference patterns</li>
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Theoretical Importance</h4>
                      <p>Serves as the theoretical upper bound for page replacement efficiency. Any practical algorithm should aim to approach optimal performance.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-row">
            <div className="control-group">
              <label>Algorithm:</label>
              <select 
                value={algorithm} 
                onChange={(e) => handleAlgorithmChange(e.target.value as Algorithm)}
                className="algorithm-select"
              >
                <option value="FIFO">FIFO (First In First Out)</option>
                <option value="LRU">LRU (Least Recently Used)</option>
                <option value="Optimal">Optimal (Theoretical Best)</option>
              </select>
            </div>

            <div className="control-group">
              <label>Number of Frames:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={numFrames}
                onChange={(e) => setNumFrames(parseInt(e.target.value) || 3)}
                className="frames-input"
              />
            </div>
          </div>
        </div>

        {/* Example Selection or Custom Input */}
        {referenceString.length === 0 && (
          <div className="input-section">
            <div className="examples-section">
              <h3>Load Example Reference String:</h3>
              <div className="examples-grid">
                {Object.entries(exampleReferenceStrings).map(([key, example]) => (
                  <button 
                    key={key}
                    onClick={() => loadExample(key)} 
                    className="example-card"
                  >
                    <h4>{example.name}</h4>
                    <p>{example.description}</p>
                    <div className="example-preview">
                      {example.string.slice(0, 10).join(', ')}
                      {example.string.length > 10 && '...'}
                    </div>
                    <div className="example-stats">
                      <span>{example.string.length} references</span>
                      <span>{example.frames} frames</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-input-section">
              <h3>Or Enter Custom Reference String:</h3>
              <div className="custom-input-form">
                <input
                  type="text"
                  placeholder="Enter page numbers separated by commas (e.g., 7, 0, 1, 2, 0, 3, 0, 4, 2, 3)"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="custom-input"
                />
                <button onClick={handleCustomInput} className="btn-load">
                  Load Custom String
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Controls */}
        {referenceString.length > 0 && !result && !compareMode && (
          <div className="simulation-setup">
            <div className="setup-info">
              <h3>Ready to Simulate</h3>
              <p>Reference String: <strong>{referenceString.join(', ')}</strong></p>
              <p>Frames: <strong>{numFrames}</strong> | Algorithm: <strong>{algorithm}</strong></p>
            </div>
            <div className="setup-buttons">
              <button onClick={() => runSimulation(referenceString, numFrames)} className="btn-simulate">
                Run {algorithm} Simulation
              </button>
              <button onClick={runComparison} className="btn-compare">
                Compare All Algorithms
              </button>
              <button onClick={reset} className="btn-reset">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Simulation Visualization */}
        {result && (
          <div className="simulation-area">
            <div className="step-controls">
              <button 
                onClick={() => handleStepChange(0)} 
                className="btn-control"
                disabled={currentStep === 0}
              >
                First
              </button>
              <button 
                onClick={() => handleStepChange(currentStep - 1)} 
                className="btn-control"
                disabled={currentStep === 0}
              >
                Previous
              </button>
              <input
                type="range"
                min="0"
                max={result.steps.length - 1}
                value={currentStep}
                onChange={(e) => handleStepChange(parseInt(e.target.value))}
                className="step-slider"
              />
              <button 
                onClick={() => handleStepChange(currentStep + 1)} 
                className="btn-control"
                disabled={currentStep === result.steps.length - 1}
              >
                Next
              </button>
              <button 
                onClick={() => handleStepChange(result.steps.length - 1)} 
                className="btn-control"
                disabled={currentStep === result.steps.length - 1}
              >
                Last
              </button>
            </div>

            {/* Reference String Analysis Card */}
            <div className="card reference-card">
              <h2>Reference String Analysis</h2>
              <div className="card-content">
                <div className="reference-explanation">
                  <h4>Understanding the Reference String</h4>
                  <p>This shows the sequence of page requests and the algorithm's response:</p>
                  <ul>
                    <li><strong>Page Numbers:</strong> The sequence of pages being accessed</li>
                    <li><strong>Current Step:</strong> Step {currentStep + 1} of {result.steps.length}</li>
                    <li><strong>Highlighted Page:</strong> The page currently being processed</li>
                    <li><strong>Page Faults:</strong> When a requested page isn't in memory</li>
                    <li><strong>Page Hits:</strong> When a requested page is already in memory</li>
                  </ul>
                </div>
                <ReferenceStringDisplay 
                  referenceString={referenceString}
                  currentStep={currentStep}
                  steps={result.steps}
                />
              </div>
            </div>

            {/* Page Frame Visualization Card */}
            <div className="card frames-card">
              <h2>Memory Frame Status</h2>
              <div className="card-content">
                <div className="frames-explanation">
                  <h4>Memory Frame Layout</h4>
                  <p>This visualization shows how pages are loaded and replaced in memory frames:</p>
                  <ul>
                    <li><strong>Frame Slots:</strong> {numFrames} available memory frames</li>
                    <li><strong>Page Numbers:</strong> Which pages currently occupy each frame</li>
                    <li><strong>Empty Slots:</strong> Frames not yet occupied by any page</li>
                    <li><strong>Replacement:</strong> Watch how {algorithm} decides which page to replace</li>
                    <li><strong>Step Navigation:</strong> Use controls above to step through the algorithm</li>
                  </ul>
                  {algorithm === 'FIFO' && <p><strong>FIFO Order:</strong> The leftmost page will be replaced first (oldest).</p>}
                  {algorithm === 'LRU' && <p><strong>LRU Order:</strong> The page with the oldest access time will be replaced.</p>}
                  {algorithm === 'Optimal' && <p><strong>Optimal Choice:</strong> The page used farthest in the future will be replaced.</p>}
                </div>
                <PageFrameVisualizer 
                  steps={result.steps}
                  currentStep={currentStep}
                />
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="card metrics-card">
              <h2>Algorithm Performance</h2>
              <div className="card-content">
                <div className="performance-explanation">
                  <h4>Performance Metrics Explained</h4>
                  <div className="metric-definitions">
                    <div className="metric-item">
                      <h5>Page Faults: {result.metrics.pageFaults}</h5>
                      <p>Number of times a requested page wasn't in memory. Lower is better.</p>
                    </div>
                    <div className="metric-item">
                      <h5>Page Hits: {result.metrics.pageHits}</h5>
                      <p>Number of times a requested page was already in memory. Higher is better.</p>
                    </div>
                    <div className="metric-item">
                      <h5>Hit Rate: {((result.metrics.pageHits / referenceString.length) * 100).toFixed(1)}%</h5>
                      <p>Percentage of page requests that were satisfied without loading from storage.</p>
                    </div>
                    <div className="metric-item">
                      <h5>Total References: {referenceString.length}</h5>
                      <p>Total number of page accesses in the reference string.</p>
                    </div>
                  </div>
                  
                  <div className="algorithm-analysis">
                    <h4>Algorithm Analysis</h4>
                    {algorithm === 'FIFO' && (
                      <p>FIFO achieved {result.metrics.pageFaults} page faults. This is typical for FIFO as it doesn't consider page usage patterns, just arrival order.</p>
                    )}
                    {algorithm === 'LRU' && (
                      <p>LRU achieved {result.metrics.pageFaults} page faults. LRU typically performs well by exploiting temporal locality in page references.</p>
                    )}
                    {algorithm === 'Optimal' && (
                      <p>Optimal achieved {result.metrics.pageFaults} page faults - this is the theoretical minimum for this reference string and frame count.</p>
                    )}
                  </div>
                </div>
                <MetricsDisplay 
                  metrics={result.metrics}
                  algorithm={result.algorithm}
                />
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={runComparison} className="btn-compare">
                Compare All Algorithms
              </button>
              <button onClick={reset} className="btn-reset">
                Start New Simulation
              </button>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {compareMode && comparisonResults.length > 0 && (
          <div className="comparison-area">
            {/* Algorithm Comparison Card */}
            <div className="card comparison-card">
              <h2>Algorithm Performance Comparison</h2>
              <div className="card-content">
                <div className="comparison-explanation">
                  <h4>Comparing All Three Algorithms</h4>
                  <p>This comparison shows how FIFO, LRU, and Optimal perform on the same reference string:</p>
                  <ul>
                    <li><strong>Page Faults:</strong> Lower numbers indicate better performance</li>
                    <li><strong>Hit Rate:</strong> Higher percentages show more efficient memory usage</li>
                    <li><strong>Reference String:</strong> {referenceString.join(', ')}</li>
                    <li><strong>Memory Frames:</strong> {numFrames} frames available</li>
                  </ul>
                  
                  <div className="comparison-insights">
                    <h4>Performance Insights</h4>
                    {comparisonResults.length === 3 && (
                      <>
                        <p><strong>Best Performer:</strong> {
                          comparisonResults.reduce((best, current) => 
                            current.metrics.pageFaults < best.metrics.pageFaults ? current : best
                          ).algorithm
                        } with {
                          Math.min(...comparisonResults.map(r => r.metrics.pageFaults))
                        } page faults</p>
                        
                        <p><strong>Optimal Gap:</strong> {
                          (() => {
                            const lruResult = comparisonResults.find(r => r.algorithm === 'LRU');
                            const optimalResult = comparisonResults.find(r => r.algorithm === 'Optimal');
                            if (lruResult && optimalResult) {
                              const gap = lruResult.metrics.pageFaults - optimalResult.metrics.pageFaults;
                              return `LRU had ${gap} more faults than optimal`;
                            }
                            return 'Algorithms performed similarly';
                          })()
                        }</p>
                      </>
                    )}
                  </div>
                </div>
                <ComparisonView results={comparisonResults} />
              </div>
            </div>
            
            <div className="action-buttons">
              <button onClick={reset} className="btn-reset">
                Start New Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
