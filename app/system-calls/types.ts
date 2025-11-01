export type SystemCallType = 
  | 'fork' 
  | 'exec' 
  | 'wait' 
  | 'exit'
  | 'open'
  | 'read'
  | 'write'
  | 'close'
  | 'pipe'
  | 'signal'
  | 'malloc'
  | 'free'

export type ProcessState = 'running' | 'waiting' | 'ready' | 'terminated' | 'zombie'

export interface Process {
  pid: number
  parentPid: number | null
  name: string
  state: ProcessState
  createdAt: number
  terminatedAt?: number
  returnCode?: number
  children: number[]
  waitingFor?: number
  execProgram?: string
  fileDescriptors: FileDescriptor[]
  memoryAllocations: MemoryBlock[]
  color: string
}

export interface FileDescriptor {
  fd: number
  fileName: string
  mode: 'read' | 'write' | 'readwrite'
  position: number
  isOpen: boolean
}

export interface MemoryBlock {
  address: string
  size: number
  allocated: boolean
}

export interface SystemCall {
  id: string
  type: SystemCallType
  pid: number
  timestamp: number
  parameters: any
  returnValue?: any
  success: boolean
  description: string
}

export interface PipeConnection {
  id: string
  readEnd: number // fd
  writeEnd: number // fd
  processPid: number
  data: string[]
}

export interface Signal {
  id: string
  type: string
  fromPid: number
  toPid: number
  timestamp: number
  handled: boolean
}

export interface SimulationStep {
  time: number
  action: string
  processes: Process[]
  systemCall?: SystemCall
  description: string
}

export interface DemoScenario {
  name: string
  description: string
  code: string
  steps: string[]
  concepts: string[]
}

