export type PageReplacementAlgorithm = 'FIFO' | 'LRU' | 'Clock'

export interface Page {
  pageNumber: number
  frameNumber: number | null
  loaded: boolean
  modified: boolean
  referenced: boolean
  loadTime: number
  lastAccessTime: number
}

export interface Frame {
  frameNumber: number
  pageNumber: number | null
  locked: boolean
}

export interface PageTableEntry {
  valid: boolean
  frameNumber: number | null
  modified: boolean
  referenced: boolean
}

export interface TLBEntry {
  pageNumber: number
  frameNumber: number
  timestamp: number
}

export interface SimulationStep {
  stepNumber: number
  pageReference: number
  tlbHit: boolean
  pageHit: boolean
  pageFault: boolean
  victim?: number
  swapOut?: boolean
  action: string
  frames: Frame[]
  workingSet: Set<number>
}

export interface VirtualMemoryMetrics {
  totalReferences: number
  pageFaults: number
  pageHits: number
  tlbHits: number
  tlbMisses: number
  pageFaultRate: number
  tlbHitRate: number
  effectiveAccessTime: number
  averageWorkingSetSize: number
  thrashing: boolean
  swapCount: number
}

export interface WorkingSetData {
  time: number
  size: number
}

export interface FrameSizeComparison {
  frameCount: number
  pageFaults: number
  pageFaultRate: number
}

