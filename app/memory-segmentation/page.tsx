'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { AllocationStrategy, MemoryBlock, Segment, MemoryState, SimulationStep, Metrics } from './types'
import { segmentExamples } from './examples'
import { allocateSegment, deallocateSegment, compactMemory } from './algorithms/allocation'
import MemoryVisualizer from './components/MemoryVisualizer'
import SegmentQueue from './components/SegmentQueue'
import MetricsDisplay from './components/MetricsDisplay'
import ActivityLog from './components/ActivityLog'
import './segmentation.css'

export default function MemorySegmentation() {
  const [strategy, setStrategy] = useState<AllocationStrategy>('FirstFit')
  const [memorySize, setMemorySize] = useState(1000)
  const [blocks, setBlocks] = useState<MemoryBlock[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [allocatedSegments, setAllocatedSegments] = useState<Segment[]>([])
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [stepCounter, setStepCounter] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeMemory = (size: number) => {
    const initialBlock: MemoryBlock = {
      start: 0,
      size,
      segment: null,
      isFree: true,
    }
    setBlocks([initialBlock])
    setAllocatedSegments([])
    setSteps([])
    setStepCounter(0)
    setIsInitialized(true)
  }

  const loadExample = (exampleKey: string) => {
    const example = segmentExamples[exampleKey as keyof typeof segmentExamples]
    setMemorySize(example.memorySize)
    setSegments(example.segments)
    initializeMemory(example.memorySize)
  }

  const handleAllocate = (segment: Segment) => {
    const { newBlocks, result } = allocateSegment(blocks, segment, strategy)
    
    const newStep = stepCounter + 1
    setStepCounter(newStep)

    if (result.success && result.allocatedBlock) {
      const allocatedSegment = {
        ...segment,
        allocatedAt: result.allocatedBlock.start,
      }
      setAllocatedSegments([...allocatedSegments, allocatedSegment])
    }

    setBlocks(newBlocks)
    
    const memoryState = calculateMemoryState(newBlocks, memorySize)
    setSteps([...steps, {
      stepNumber: newStep,
      action: result.success ? 'Allocation' : 'Allocation Failed',
      segment,
      result,
      memoryState,
    }])
  }

  const handleDeallocate = (segmentId: string) => {
    const segment = allocatedSegments.find(s => s.id === segmentId)
    if (!segment) return

    const newBlocks = deallocateSegment(blocks, segmentId)
    setBlocks(newBlocks)
    setAllocatedSegments(allocatedSegments.filter(s => s.id !== segmentId))

    const newStep = stepCounter + 1
    setStepCounter(newStep)

    const memoryState = calculateMemoryState(newBlocks, memorySize)
    setSteps([...steps, {
      stepNumber: newStep,
      action: 'Deallocation',
      segment,
      result: {
        success: true,
        segment,
        message: `Deallocated ${segment.name} and merged adjacent free blocks`,
      },
      memoryState,
    }])
  }

  const handleCompact = () => {
    const newBlocks = compactMemory(blocks, memorySize)
    setBlocks(newBlocks)

    const newStep = stepCounter + 1
    setStepCounter(newStep)

    const memoryState = calculateMemoryState(newBlocks, memorySize)
    setSteps([...steps, {
      stepNumber: newStep,
      action: 'Compaction',
      segment: null,
      result: {
        success: true,
        segment: null as any,
        message: 'Memory compacted - all free space consolidated',
      },
      memoryState,
    }])
  }

  const handleAutoAllocate = () => {
    const remaining = segments.filter(
      s => !allocatedSegments.find(a => a.id === s.id)
    )
    
    remaining.forEach(segment => {
      setTimeout(() => handleAllocate(segment), 0)
    })
  }

  const reset = () => {
    setBlocks([])
    setSegments([])
    setAllocatedSegments([])
    setSteps([])
    setStepCounter(0)
    setIsInitialized(false)
  }

  const calculateMemoryState = (currentBlocks: MemoryBlock[], total: number): MemoryState => {
    const usedSpace = currentBlocks
      .filter(b => !b.isFree)
      .reduce((sum, b) => sum + b.size, 0)
    
    const freeSpace = total - usedSpace
    const freeBlocks = currentBlocks.filter(b => b.isFree)
    const largestFreeBlock = freeBlocks.length > 0 
      ? Math.max(...freeBlocks.map(b => b.size))
      : 0
    
    const fragmentation = freeSpace > 0 && largestFreeBlock > 0
      ? ((freeSpace - largestFreeBlock) / freeSpace) * 100
      : 0

    return {
      totalMemory: total,
      blocks: currentBlocks,
      allocatedSegments,
      freeSpace,
      usedSpace,
      fragmentation,
      largestFreeBlock,
    }
  }

  const calculateMetrics = (): Metrics => {
    const memoryState = calculateMemoryState(blocks, memorySize)
    const freeBlocks = blocks.filter(b => b.isFree)
    const successfulAllocations = steps.filter(s => s.action === 'Allocation' && s.result?.success).length
    const failedAllocations = steps.filter(s => s.action === 'Allocation Failed').length

    return {
      totalMemory: memorySize,
      usedMemory: memoryState.usedSpace,
      freeMemory: memoryState.freeSpace,
      utilizationRate: (memoryState.usedSpace / memorySize) * 100,
      externalFragmentation: memoryState.fragmentation,
      numberOfHoles: freeBlocks.length,
      largestHole: memoryState.largestFreeBlock,
      averageHoleSize: freeBlocks.length > 0
        ? freeBlocks.reduce((sum, b) => sum + b.size, 0) / freeBlocks.length
        : 0,
      successfulAllocations,
      failedAllocations,
    }
  }

  const currentMemoryState = isInitialized ? calculateMemoryState(blocks, memorySize) : null
  const metrics = isInitialized ? calculateMetrics() : null

  return (
    <>
      <ThemeToggle />
      <div className="segmentation-container">
        <div className="segmentation-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>Memory Management - Segmentation</h1>
          <p>Simulate dynamic partitioning with First-Fit, Best-Fit, and Worst-Fit</p>
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-row">
            <div className="control-group">
              <label>Allocation Strategy:</label>
              <select 
                value={strategy} 
                onChange={(e) => setStrategy(e.target.value as AllocationStrategy)}
                className="strategy-select"
              >
                <option value="FirstFit">First-Fit</option>
                <option value="BestFit">Best-Fit</option>
                <option value="WorstFit">Worst-Fit</option>
              </select>
            </div>

            <div className="control-group">
              <label>Memory Size (KB):</label>
              <input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={memorySize}
                onChange={(e) => setMemorySize(parseInt(e.target.value) || 1000)}
                className="memory-input"
                disabled={isInitialized}
              />
            </div>
          </div>
        </div>

        {/* Example Selection */}
        {!isInitialized && (
          <div className="example-selector">
            <h3>Load Example Scenario:</h3>
            <div className="example-grid">
              {Object.entries(segmentExamples).map(([key, example]) => (
                <button 
                  key={key}
                  onClick={() => loadExample(key)} 
                  className="example-card"
                >
                  <h4>{example.name}</h4>
                  <p>{example.description}</p>
                  <div className="example-stats">
                    <span>{example.segments.length} segments</span>
                    <span>{example.memorySize} KB memory</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Simulation Area */}
        {isInitialized && currentMemoryState && (
          <div className="simulation-area">
            <div className="control-buttons">
              <button 
                onClick={handleAutoAllocate}
                className="btn-auto"
                disabled={segments.length === allocatedSegments.length}
              >
                Auto Allocate All
              </button>
              <button 
                onClick={handleCompact}
                className="btn-compact"
                disabled={blocks.filter(b => b.isFree).length <= 1}
              >
                Compact Memory
              </button>
              <button onClick={reset} className="btn-reset">
                Reset
              </button>
            </div>

            <div className="main-layout">
              <div className="left-panel">
                <MemoryVisualizer memoryState={currentMemoryState} />
              </div>

              <div className="right-panel">
                <SegmentQueue 
                  segments={segments}
                  allocatedSegments={allocatedSegments}
                  onAllocate={handleAllocate}
                  onDeallocate={handleDeallocate}
                />
              </div>
            </div>

            {metrics && <MetricsDisplay metrics={metrics} strategy={strategy} />}
            
            <ActivityLog steps={steps} />
          </div>
        )}
      </div>
    </>
  )
}
