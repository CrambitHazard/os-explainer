export type AllocationMethod = 'contiguous' | 'linked' | 'indexed'

export interface FileEntry {
  id: string
  name: string
  size: number // in blocks
  color: string
  startBlock?: number // for contiguous
  blocks?: number[] // for linked and indexed
  indexBlock?: number // for indexed allocation
  nextPointers?: Map<number, number> // for linked: block -> next block
}

export interface DiskBlock {
  blockNumber: number
  allocated: boolean
  fileId: string | null
  fileName: string | null
  isIndexBlock: boolean
  nextBlock?: number | null // for linked allocation
  pointsTo?: number[] // for indexed allocation (if this is an index block)
}

export interface AllocationResult {
  success: boolean
  file?: FileEntry
  message: string
  blocksAllocated?: number[]
  fragmentation?: number
}

export interface DiskMetrics {
  totalBlocks: number
  usedBlocks: number
  freeBlocks: number
  utilization: number
  externalFragmentation: number
  internalFragmentation: number
  numberOfFiles: number
  largestFreeSpace: number
  averageSeekTime: number
}

export interface SimulationStep {
  action: 'allocate' | 'delete' | 'access'
  fileName: string
  success: boolean
  message: string
  blocksAffected: number[]
  diskState: DiskBlock[]
  metrics: DiskMetrics
}

