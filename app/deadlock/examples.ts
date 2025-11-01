export const ragExamples = {
  noDeadlock: {
    name: 'No Deadlock - Safe State',
    description: 'Resources can be allocated without forming cycles',
    processes: [
      { id: 0, name: 'P0', allocation: [0, 1, 0], maximum: [7, 5, 3], color: '#00ff41' },
      { id: 1, name: 'P1', allocation: [2, 0, 0], maximum: [3, 2, 2], color: '#2563eb' },
      { id: 2, name: 'P2', allocation: [3, 0, 2], maximum: [9, 0, 2], color: '#f59e0b' },
    ],
    resources: [
      { id: 0, name: 'R0', totalInstances: 10, available: 5 },
      { id: 1, name: 'R1', totalInstances: 5, available: 4 },
      { id: 2, name: 'R2', totalInstances: 7, available: 5 },
    ],
  },
  
  simpleDeadlock: {
    name: 'Simple Deadlock - Circular Wait',
    description: 'Two processes in circular wait for resources',
    processes: [
      { id: 0, name: 'P0', allocation: [1, 0], maximum: [2, 1], color: '#00ff41' },
      { id: 1, name: 'P1', allocation: [0, 1], maximum: [1, 2], color: '#2563eb' },
    ],
    resources: [
      { id: 0, name: 'R0', totalInstances: 1, available: 0 },
      { id: 1, name: 'R1', totalInstances: 1, available: 0 },
    ],
    requestEdges: [
      { from: 'P0', to: 'R1', type: 'request' },
      { from: 'P1', to: 'R0', type: 'request' },
    ],
  },

  complexDeadlock: {
    name: 'Complex Deadlock - Multiple Cycles',
    description: 'Multiple processes forming deadlock cycles',
    processes: [
      { id: 0, name: 'P0', allocation: [1, 0, 0], maximum: [2, 1, 1], color: '#00ff41' },
      { id: 1, name: 'P1', allocation: [0, 1, 0], maximum: [1, 2, 1], color: '#2563eb' },
      { id: 2, name: 'P2', allocation: [0, 0, 1], maximum: [1, 1, 2], color: '#f59e0b' },
    ],
    resources: [
      { id: 0, name: 'R0', totalInstances: 1, available: 0 },
      { id: 1, name: 'R1', totalInstances: 1, available: 0 },
      { id: 2, name: 'R2', totalInstances: 1, available: 0 },
    ],
    requestEdges: [
      { from: 'P0', to: 'R1', type: 'request' },
      { from: 'P1', to: 'R2', type: 'request' },
      { from: 'P2', to: 'R0', type: 'request' },
    ],
  },
}

export const bankerExamples = {
  safeState: {
    name: 'Safe State',
    description: 'System is in a safe state with valid safe sequence',
    processes: [
      { id: 0, name: 'P0', allocation: [0, 1, 0], maximum: [7, 5, 3], color: '#00ff41' },
      { id: 1, name: 'P1', allocation: [2, 0, 0], maximum: [3, 2, 2], color: '#2563eb' },
      { id: 2, name: 'P2', allocation: [3, 0, 2], maximum: [9, 0, 2], color: '#f59e0b' },
      { id: 3, name: 'P3', allocation: [2, 1, 1], maximum: [2, 2, 2], color: '#ef4444' },
      { id: 4, name: 'P4', allocation: [0, 0, 2], maximum: [4, 3, 3], color: '#8b5cf6' },
    ],
    resources: [
      { id: 0, name: 'A', totalInstances: 10 },
      { id: 1, name: 'B', totalInstances: 5 },
      { id: 2, name: 'C', totalInstances: 7 },
    ],
    available: [3, 3, 2],
  },

  unsafeState: {
    name: 'Unsafe State',
    description: 'System may lead to deadlock',
    processes: [
      { id: 0, name: 'P0', allocation: [0, 1, 0], maximum: [7, 5, 3], color: '#00ff41' },
      { id: 1, name: 'P1', allocation: [3, 0, 2], maximum: [3, 2, 2], color: '#2563eb' },
      { id: 2, name: 'P2', allocation: [3, 0, 2], maximum: [9, 0, 2], color: '#f59e0b' },
      { id: 3, name: 'P3', allocation: [2, 1, 1], maximum: [2, 2, 2], color: '#ef4444' },
      { id: 4, name: 'P4', allocation: [0, 0, 2], maximum: [4, 3, 3], color: '#8b5cf6' },
    ],
    resources: [
      { id: 0, name: 'A', totalInstances: 10 },
      { id: 1, name: 'B', totalInstances: 5 },
      { id: 2, name: 'C', totalInstances: 7 },
    ],
    available: [2, 3, 0],
  },

  requestScenario: {
    name: 'Resource Request Scenario',
    description: 'Test resource requests for safety',
    processes: [
      { id: 0, name: 'P0', allocation: [0, 1, 0], maximum: [7, 5, 3], color: '#00ff41' },
      { id: 1, name: 'P1', allocation: [2, 0, 0], maximum: [3, 2, 2], color: '#2563eb' },
      { id: 2, name: 'P2', allocation: [3, 0, 2], maximum: [9, 0, 2], color: '#f59e0b' },
      { id: 3, name: 'P3', allocation: [2, 1, 1], maximum: [2, 2, 2], color: '#ef4444' },
      { id: 4, name: 'P4', allocation: [0, 0, 2], maximum: [4, 3, 3], color: '#8b5cf6' },
    ],
    resources: [
      { id: 0, name: 'A', totalInstances: 10 },
      { id: 1, name: 'B', totalInstances: 5 },
      { id: 2, name: 'C', totalInstances: 7 },
    ],
    available: [3, 3, 2],
  },
}

