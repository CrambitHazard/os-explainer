export type DetectionMethod = 'rag' | 'banker'

export interface Process {
  id: number
  name: string
  allocation: number[]
  maximum: number[]
  need: number[]
  finished: boolean
  color: string
}

export interface Resource {
  id: number
  name: string
  totalInstances: number
  available: number
  allocated: number
}

export interface Edge {
  from: string
  to: string
  type: 'request' | 'allocation'
}

export interface RAGState {
  processes: Process[]
  resources: Resource[]
  edges: Edge[]
  cycles: string[][]
  hasDeadlock: boolean
  log: LogEntry[]
}

export interface BankerState {
  processes: Process[]
  resources: Resource[]
  available: number[]
  safeSequence: string[]
  isSafe: boolean
  currentStep: number
  log: LogEntry[]
}

export interface LogEntry {
  step: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

export interface RequestResult {
  granted: boolean
  reason: string
  newState?: BankerState
}

