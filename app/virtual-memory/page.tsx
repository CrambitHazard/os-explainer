'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { PageReplacementAlgorithm, SimulationStep, VirtualMemoryMetrics, FrameSizeComparison } from './types'
import { referencePatterns, memoryConfig } from './examples'
import { simulateDemandPaging } from './algorithms/demandPaging'
import VirtualMemoryVisualizer from './components/VirtualMemoryVisualizer'
import WorkingSetGraph from './components/WorkingSetGraph'
import FrameSizeComparisonChart from './components/FrameSizeComparison'
import MetricsDisplay from './components/MetricsDisplay'
import './virtual-memory.css'

export default function VirtualMemory() {
  const [algorithm, setAlgorithm] = useState<PageReplacementAlgorithm>('LRU')
  const [numFrames, setNumFrames] = useState(3)
  const [tlbSize, setTlbSize] = useState(memoryConfig.tlbSize)
  const [referenceString, setReferenceString] = useState<number[]>([])
  const [customInput, setCustomInput] = useState('')
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const [frameComparisons, setFrameComparisons] = useState<FrameSizeComparison[]>([])

  const loadPattern = (patternKey: string) => {
    const pattern = referencePatterns[patternKey as keyof typeof referencePatterns]
    setReferenceString(pattern.pattern)
    setCustomInput(pattern.pattern.join(', '))
    setNumFrames(Math.max(2, Math.min(pattern.optimalFrames - 1, 8)))
    reset()
  }

  const handleCustomInput = () => {
    const numbers = customInput
      .split(/[\s,]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 0)
    
    if (numbers.length > 0) {
      setReferenceString(numbers)
      reset()
    }
  }

  const runSimulation = () => {
    const simulatedSteps = simulateDemandPaging(referenceString, numFrames, algorithm, tlbSize)
    setSteps(simulatedSteps)
    setCurrentStep(0)
    setShowComparison(false)
  }

  const runFrameComparison = () => {
    const comparisons: FrameSizeComparison[] = []
    
    for (let frames = 1; frames <= 10; frames++) {
      const simSteps = simulateDemandPaging(referenceString, frames, algorithm, tlbSize)
      const pageFaults = simSteps.filter(s => s.pageFault).length
      const pageFaultRate = (pageFaults / referenceString.length) * 100

      comparisons.push({
        frameCount: frames,
        pageFaults,
        pageFaultRate,
      })
    }

    setFrameComparisons(comparisons)
    setShowComparison(true)
  }

  const calculateMetrics = (): VirtualMemoryMetrics => {
    if (steps.length === 0) {
      return {
        totalReferences: 0,
        pageFaults: 0,
        pageHits: 0,
        tlbHits: 0,
        tlbMisses: 0,
        pageFaultRate: 0,
        tlbHitRate: 0,
        effectiveAccessTime: 0,
        averageWorkingSetSize: 0,
        thrashing: false,
        swapCount: 0,
      }
    }

    const pageFaults = steps.filter(s => s.pageFault).length
    const pageHits = steps.length - pageFaults
    const tlbHits = steps.filter(s => s.tlbHit).length
    const tlbMisses = steps.length - tlbHits
    const swapCount = steps.filter(s => s.swapOut).length
    const avgWorkingSet = steps.reduce((sum, s) => sum + s.workingSet.size, 0) / steps.length

    const pageFaultRate = (pageFaults / steps.length) * 100
    const tlbHitRate = (tlbHits / steps.length) * 100

    // Calculate effective access time
    const eatWithTLBHit = memoryConfig.tlbAccessTime + memoryConfig.memoryAccessTime
    const eatWithTLBMiss = memoryConfig.tlbAccessTime + memoryConfig.memoryAccessTime
    const eatWithPageFault = memoryConfig.tlbAccessTime + memoryConfig.pageFaultTime + memoryConfig.memoryAccessTime

    const effectiveAccessTime = 
      (tlbHitRate / 100) * eatWithTLBHit +
      ((100 - tlbHitRate) / 100) * (
        ((100 - pageFaultRate) / 100) * eatWithTLBMiss +
        (pageFaultRate / 100) * eatWithPageFault
      )

    // Detect thrashing (page fault rate > 30%)
    const thrashing = pageFaultRate > 30

    return {
      totalReferences: steps.length,
      pageFaults,
      pageHits,
      tlbHits,
      tlbMisses,
      pageFaultRate,
      tlbHitRate,
      effectiveAccessTime,
      averageWorkingSetSize: avgWorkingSet,
      thrashing,
      swapCount,
    }
  }

  const handleStepChange = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }

  const reset = () => {
    setSteps([])
    setCurrentStep(0)
    setShowComparison(false)
    setFrameComparisons([])
  }

  const metrics = calculateMetrics()

  return (
    <>
      <ThemeToggle />
      <div className="vm-container">
        <div className="vm-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>Virtual Memory Simulation</h1>
          <p>Demonstrate demand paging, TLB, and working set concepts</p>
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-row">
            <div className="control-group">
              <label>Page Replacement Algorithm:</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value as PageReplacementAlgorithm)}
                className="algorithm-select"
              >
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU (Least Recently Used)</option>
                <option value="Clock">Clock (Second Chance)</option>
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

            <div className="control-group">
              <label>TLB Size:</label>
              <input
                type="number"
                min="2"
                max="8"
                value={tlbSize}
                onChange={(e) => setTlbSize(parseInt(e.target.value) || 4)}
                className="tlb-input"
              />
            </div>
          </div>
        </div>

        {/* Pattern Selection */}
        {referenceString.length === 0 && (
          <div className="pattern-selector">
            <h3>Load Reference Pattern:</h3>
            <div className="patterns-grid">
              {Object.entries(referencePatterns).map(([key, pattern]) => (
                <button 
                  key={key}
                  onClick={() => loadPattern(key)} 
                  className="pattern-card"
                >
                  <h4>{pattern.name}</h4>
                  <p>{pattern.description}</p>
                  <div className="pattern-preview">
                    {pattern.pattern.slice(0, 10).join(', ')}
                    {pattern.pattern.length > 10 && '...'}
                  </div>
                  <div className="pattern-stats">
                    <span>{pattern.pattern.length} references</span>
                    <span>Optimal: {pattern.optimalFrames} frames</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="custom-input-section">
              <h3>Or Enter Custom Reference String:</h3>
              <div className="custom-input-form">
                <input
                  type="text"
                  placeholder="Enter page numbers (e.g., 1, 2, 3, 4, 1, 2, 5)"
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

        {/* Simulation Setup */}
        {referenceString.length > 0 && steps.length === 0 && !showComparison && (
          <div className="simulation-setup">
            <div className="setup-info">
              <h3>Ready to Simulate</h3>
              <p>Reference String: <strong>{referenceString.join(', ')}</strong></p>
              <p>Frames: <strong>{numFrames}</strong> | TLB Size: <strong>{tlbSize}</strong> | Algorithm: <strong>{algorithm}</strong></p>
            </div>
            <div className="setup-buttons">
              <button onClick={runSimulation} className="btn-simulate">
                Run Simulation
              </button>
              <button onClick={runFrameComparison} className="btn-compare">
                Compare Frame Sizes
              </button>
              <button onClick={() => setReferenceString([])} className="btn-reset">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Simulation Visualization */}
        {steps.length > 0 && !showComparison && (
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
                max={steps.length - 1}
                value={currentStep}
                onChange={(e) => handleStepChange(parseInt(e.target.value))}
                className="step-slider"
              />
              <button 
                onClick={() => handleStepChange(currentStep + 1)} 
                className="btn-control"
                disabled={currentStep === steps.length - 1}
              >
                Next
              </button>
              <button 
                onClick={() => handleStepChange(steps.length - 1)} 
                className="btn-control"
                disabled={currentStep === steps.length - 1}
              >
                Last
              </button>
            </div>

            <VirtualMemoryVisualizer step={steps[currentStep]} />
            
            <WorkingSetGraph steps={steps.slice(0, currentStep + 1)} />
            
            <MetricsDisplay metrics={metrics} />

            <div className="action-buttons">
              <button onClick={runFrameComparison} className="btn-compare">
                Compare Frame Sizes
              </button>
              <button onClick={() => setReferenceString([])} className="btn-reset">
                Start New Simulation
              </button>
            </div>
          </div>
        )}

        {/* Frame Size Comparison */}
        {showComparison && frameComparisons.length > 0 && (
          <div className="comparison-area">
            <FrameSizeComparisonChart comparisons={frameComparisons} />
            <div className="action-buttons">
              <button onClick={() => {
                setShowComparison(false)
                runSimulation()
              }} className="btn-simulate">
                Back to Simulation
              </button>
              <button onClick={() => setReferenceString([])} className="btn-reset">
                Start New
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
