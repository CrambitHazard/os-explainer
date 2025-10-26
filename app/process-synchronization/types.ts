export type SyncMechanism = 'peterson' | 'semaphore' | 'monitor'

export type ThreadState = 'waiting' | 'ready' | 'running' | 'critical' | 'completed'

export interface Thread {
  id: number
  name: string
  state: ThreadState
  operations: string[]
  currentOperation: number
  color: string
}

export interface PetersonState {
  flag: [boolean, boolean]
  turn: number
  threads: [Thread, Thread]
  currentStep: number
  log: LogEntry[]
}

export interface SemaphoreState {
  value: number
  maxValue: number
  waitQueue: Thread[]
  threads: Thread[]
  currentStep: number
  log: LogEntry[]
}

export interface MonitorState {
  locked: boolean
  owner: Thread | null
  waitQueue: Thread[]
  conditionQueue: Thread[]
  threads: Thread[]
  currentStep: number
  log: LogEntry[]
}

export interface LogEntry {
  step: number
  threadName: string
  action: string
  details: string
  timestamp: number
}

