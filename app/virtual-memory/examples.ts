export const referencePatterns = {
  sequential: {
    name: 'Sequential Access',
    description: 'Sequential page access pattern',
    pattern: Array.from({ length: 20 }, (_, i) => i % 10),
    optimalFrames: 10,
  },
  
  looping: {
    name: 'Loop Pattern',
    description: 'Repeated loop through small set of pages',
    pattern: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 7, 8],
    optimalFrames: 4,
  },
  
  locality: {
    name: 'Temporal Locality',
    description: 'Good temporal locality, few distinct pages',
    pattern: [1, 2, 3, 4, 1, 1, 1, 2, 2, 3, 4, 1, 2, 3, 4, 5, 5, 5],
    optimalFrames: 5,
  },
  
  poor: {
    name: 'Poor Locality',
    description: 'Random access pattern, causes thrashing',
    pattern: [1, 8, 2, 9, 3, 10, 4, 11, 5, 12, 6, 13, 7, 14, 8, 15],
    optimalFrames: 15,
  },
  
  workingSet: {
    name: 'Working Set Transition',
    description: 'Demonstrates working set changes',
    pattern: [1, 2, 3, 1, 2, 3, 1, 2, 3, 5, 6, 7, 5, 6, 7, 5, 6, 7],
    optimalFrames: 3,
  },
  
  thrashing: {
    name: 'Thrashing Scenario',
    description: 'Demonstrates thrashing with insufficient frames',
    pattern: [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4],
    optimalFrames: 8,
  },
}

export const memoryConfig = {
  pageSize: 4, // KB
  memoryAccessTime: 100, // nanoseconds
  pageFaultTime: 8000, // nanoseconds
  tlbAccessTime: 20, // nanoseconds
  tlbSize: 4, // entries
}

