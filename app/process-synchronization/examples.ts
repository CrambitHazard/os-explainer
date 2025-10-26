export const petersonExample = {
  thread1: [
    'Request entry',
    'Set flag[0] = true',
    'Set turn = 1',
    'Wait while flag[1] && turn == 1',
    'Enter critical section',
    'Execute critical work',
    'Exit critical section',
    'Set flag[0] = false',
  ],
  thread2: [
    'Request entry',
    'Set flag[1] = true',
    'Set turn = 0',
    'Wait while flag[0] && turn == 0',
    'Enter critical section',
    'Execute critical work',
    'Exit critical section',
    'Set flag[1] = false',
  ],
}

export const semaphoreExample = {
  producer: [
    'Produce item',
    'Wait on semaphore',
    'Enter critical section',
    'Add item to buffer',
    'Exit critical section',
    'Signal semaphore',
  ],
  consumer: [
    'Wait on semaphore',
    'Enter critical section',
    'Remove item from buffer',
    'Exit critical section',
    'Signal semaphore',
    'Consume item',
  ],
}

export const monitorExample = {
  thread: [
    'Call monitor method',
    'Acquire lock',
    'Check condition',
    'Wait if needed',
    'Execute in critical section',
    'Signal waiting threads',
    'Release lock',
  ],
}

export const scenarios = {
  peterson: {
    basic: {
      name: 'Basic Two-Thread Mutex',
      description: 'Two threads competing for critical section access',
      delay: 1000,
    },
    simultaneous: {
      name: 'Simultaneous Entry Attempt',
      description: 'Both threads try to enter at the same time',
      delay: 800,
    },
  },
  semaphore: {
    mutex: {
      name: 'Binary Semaphore (Mutex)',
      description: 'Semaphore initialized to 1 for mutual exclusion',
      initialValue: 1,
      threadCount: 3,
    },
    counting: {
      name: 'Counting Semaphore',
      description: 'Semaphore initialized to 3 for resource pool',
      initialValue: 3,
      threadCount: 5,
    },
    producerConsumer: {
      name: 'Producer-Consumer',
      description: 'Classic producer-consumer problem with bounded buffer',
      initialValue: 5,
      threadCount: 4,
    },
  },
  monitor: {
    basic: {
      name: 'Basic Monitor',
      description: 'Multiple threads accessing shared resource via monitor',
      threadCount: 3,
    },
    conditionVariable: {
      name: 'Monitor with Condition Variables',
      description: 'Threads waiting on conditions and signaling',
      threadCount: 4,
    },
  },
}

