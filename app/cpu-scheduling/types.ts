export interface Process {
  id: string
  name: string
  arrivalTime: number
  burstTime: number
  priority?: number
  remainingTime?: number
  completionTime?: number
  turnaroundTime?: number
  waitingTime?: number
  responseTime?: number
}

export interface GanttItem {
  processName: string
  start: number
  end: number
}

export interface Metrics {
  avgWaitingTime: number
  avgTurnaroundTime: number
  avgResponseTime: number
  cpuUtilization: number
  throughput: number
}

export type Algorithm = 'FCFS' | 'SJF' | 'SRTF' | 'Priority' | 'Priority-Preemptive' | 'RR'

