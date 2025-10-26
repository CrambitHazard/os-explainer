export type Algorithm = 'FIFO' | 'LRU' | 'Optimal'

export interface PageFrame {
  pageNumber: number | null
  timestamp?: number
  lastUsed?: number
}

export interface SimulationStep {
  referenceNumber: number
  reference: number
  frames: PageFrame[]
  isPageFault: boolean
  action: string
  replacedPage?: number
}

export interface Metrics {
  totalReferences: number
  pageFaults: number
  pageHits: number
  pageFaultRate: number
  pageHitRate: number
}

export interface SimulationResult {
  algorithm: Algorithm
  steps: SimulationStep[]
  metrics: Metrics
}

