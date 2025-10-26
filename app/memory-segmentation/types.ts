export type AllocationStrategy = 'FirstFit' | 'BestFit' | 'WorstFit'

export interface Segment {
  id: string
  name: string
  size: number
  color: string
  allocatedAt?: number
}

export interface MemoryBlock {
  start: number
  size: number
  segment: Segment | null
  isFree: boolean
}

export interface AllocationResult {
  success: boolean
  segment: Segment
  allocatedBlock?: MemoryBlock
  message: string
}

export interface MemoryState {
  totalMemory: number
  blocks: MemoryBlock[]
  allocatedSegments: Segment[]
  freeSpace: number
  usedSpace: number
  fragmentation: number
  largestFreeBlock: number
}

export interface SimulationStep {
  stepNumber: number
  action: string
  segment: Segment | null
  result: AllocationResult | null
  memoryState: MemoryState
}

export interface Metrics {
  totalMemory: number
  usedMemory: number
  freeMemory: number
  utilizationRate: number
  externalFragmentation: number
  numberOfHoles: number
  largestHole: number
  averageHoleSize: number
  successfulAllocations: number
  failedAllocations: number
}

