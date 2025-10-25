import { Process } from './types'

export const exampleCases: Record<string, Process[]> = {
  basic: [
    { id: '1', name: 'P1', arrivalTime: 0, burstTime: 4, priority: 2 },
    { id: '2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: '3', name: 'P3', arrivalTime: 2, burstTime: 1, priority: 3 },
    { id: '4', name: 'P4', arrivalTime: 3, burstTime: 2, priority: 2 },
  ],
  
  medium: [
    { id: '1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
    { id: '2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: '3', name: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
    { id: '4', name: 'P4', arrivalTime: 3, burstTime: 6, priority: 2 },
    { id: '5', name: 'P5', arrivalTime: 4, burstTime: 4, priority: 5 },
  ],
  
  complex: [
    { id: '1', name: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 },
    { id: '2', name: 'P2', arrivalTime: 1, burstTime: 1, priority: 1 },
    { id: '3', name: 'P3', arrivalTime: 2, burstTime: 2, priority: 4 },
    { id: '4', name: 'P4', arrivalTime: 3, burstTime: 1, priority: 5 },
    { id: '5', name: 'P5', arrivalTime: 4, burstTime: 5, priority: 2 },
    { id: '6', name: 'P6', arrivalTime: 5, burstTime: 3, priority: 6 },
    { id: '7', name: 'P7', arrivalTime: 6, burstTime: 7, priority: 3 },
  ],
}

