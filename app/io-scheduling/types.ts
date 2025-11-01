export type DeviceType = 'disk' | 'printer' | 'keyboard' | 'network'
export type IOSchedulingAlgorithm = 'FCFS' | 'Priority' | 'SSTF' | 'RoundRobin'
export type InterruptPriority = 'critical' | 'high' | 'medium' | 'low'
export type RequestStatus = 'waiting' | 'processing' | 'completed' | 'interrupted'

export interface IORequest {
  id: string
  processName: string
  deviceType: DeviceType
  requestType: string // 'read' | 'write' | 'print' | 'send'
  dataSize: number // in KB
  arrivalTime: number
  priority: InterruptPriority
  diskLocation?: number // for disk I/O (track number)
  startTime?: number
  completionTime?: number
  waitingTime?: number
  turnaroundTime?: number
  status: RequestStatus
  color: string
}

export interface Device {
  id: string
  type: DeviceType
  name: string
  busy: boolean
  currentRequest: IORequest | null
  queue: IORequest[]
  totalRequests: number
  completedRequests: number
  currentTrack?: number // for disk devices
  transferRate: number // KB/s
}

export interface Interrupt {
  id: string
  type: string
  priority: InterruptPriority
  source: string
  arrivalTime: number
  handlingTime: number
  handled: boolean
  color: string
}

export interface SimulationStep {
  time: number
  action: string
  description: string
  devices: Device[]
  activeInterrupts: Interrupt[]
  requestsInProgress: IORequest[]
  completedRequests: IORequest[]
}

export interface IOMetrics {
  totalRequests: number
  completedRequests: number
  averageWaitingTime: number
  averageTurnaroundTime: number
  deviceUtilization: { [key: string]: number }
  throughput: number
  totalInterrupts: number
  averageResponseTime: number
  missedDeadlines: number
}

export interface DMATransfer {
  id: string
  deviceId: string
  memoryAddress: string
  size: number
  progress: number
  active: boolean
}

