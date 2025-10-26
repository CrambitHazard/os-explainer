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

            <ReferenceStringDisplay 
              referenceString={referenceString}
              currentStep={currentStep}
              steps={result.steps}
            />

            <PageFrameVisualizer 
              steps={result.steps}
              currentStep={currentStep}
            />

            <MetricsDisplay 
              metrics={result.metrics}
              algorithm={result.algorithm}
            />

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
            <ComparisonView results={comparisonResults} />
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
