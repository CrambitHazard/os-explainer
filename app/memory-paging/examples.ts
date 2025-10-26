export const exampleReferenceStrings = {
  basic: {
    name: 'Basic Example',
    description: 'Simple reference string with 3 frames',
    string: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
    frames: 3,
  },
  
  belady: {
    name: 'Belady\'s Anomaly Example',
    description: 'Demonstrates Belady\'s anomaly with FIFO',
    string: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
    frames: 3,
  },
  
  locality: {
    name: 'Locality of Reference',
    description: 'Shows temporal locality in page references',
    string: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5, 1, 2, 1, 2],
    frames: 4,
  },
  
  sequential: {
    name: 'Sequential Access',
    description: 'Sequential page access pattern',
    string: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    frames: 3,
  },
  
  random: {
    name: 'Random Access',
    description: 'Random page access pattern',
    string: [3, 1, 4, 2, 5, 2, 1, 3, 5, 4, 1, 2, 3],
    frames: 4,
  },
  
  complex: {
    name: 'Complex Pattern',
    description: 'Complex access pattern with varying locality',
    string: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1],
    frames: 4,
  },
}

