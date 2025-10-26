import { SemaphoreState, Thread, LogEntry } from '../types'

const COLORS = ['#00ff41', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function initializeSemaphore(initialValue: number, threadCount: number): SemaphoreState {
  const threads: Thread[] = []
  
  for (let i = 0; i < threadCount; i++) {
    threads.push({
      id: i,
      name: `Thread ${i}`,
      state: 'ready',
      operations: [
        'Wait (P operation)',
        'Enter critical section',
        'Execute work',
        'Exit critical section',
        'Signal (V operation)',
      ],
      currentOperation: 0,
      color: COLORS[i % COLORS.length],
    })
  }

  return {
    value: initialValue,
    maxValue: initialValue,
    waitQueue: [],
    threads,
    currentStep: 0,
    log: [],
  }
}

export function stepSemaphore(state: SemaphoreState): SemaphoreState {
  const newState = JSON.parse(JSON.stringify(state)) as SemaphoreState
  let stepExecuted = false

  // Try to process threads in wait queue first
  if (newState.waitQueue.length > 0 && newState.value > 0) {
    const thread = newState.waitQueue.shift()!
    const actualThread = newState.threads.find(t => t.id === thread.id)!
    actualThread.state = 'ready'
    newState.value--
    addLog(newState, actualThread.name, 'Unblock', `Removed from wait queue, semaphore=${newState.value}`)
    stepExecuted = true
  }

  if (!stepExecuted) {
    // Process active threads
    for (const thread of newState.threads) {
      if (thread.state === 'completed') continue
      if (thread.currentOperation >= thread.operations.length) {
        thread.state = 'completed'
        continue
      }

      const operation = thread.operations[thread.currentOperation]

      if (operation.includes('Wait')) {
        if (newState.value > 0) {
          newState.value--
          thread.state = 'running'
          addLog(newState, thread.name, 'Wait (P)', `Acquired semaphore, value=${newState.value}`)
          thread.currentOperation++
        } else {
          thread.state = 'waiting'
          if (!newState.waitQueue.find(t => t.id === thread.id)) {
            newState.waitQueue.push(thread)
            addLog(newState, thread.name, 'Block', `Added to wait queue, semaphore=${newState.value}`)
          }
        }
        stepExecuted = true
        break
      } else if (operation.includes('Enter critical section')) {
        thread.state = 'critical'
        addLog(newState, thread.name, 'Enter CS', 'Entered critical section')
        thread.currentOperation++
        stepExecuted = true
        break
      } else if (operation.includes('Execute work')) {
        addLog(newState, thread.name, 'Execute', 'Working in critical section')
        thread.currentOperation++
        stepExecuted = true
        break
      } else if (operation.includes('Exit critical section')) {
        thread.state = 'ready'
        addLog(newState, thread.name, 'Exit CS', 'Exited critical section')
        thread.currentOperation++
        stepExecuted = true
        break
      } else if (operation.includes('Signal')) {
        newState.value++
        thread.state = 'completed'
        addLog(newState, thread.name, 'Signal (V)', `Released semaphore, value=${newState.value}`)
        thread.currentOperation++
        stepExecuted = true
        break
      }

      if (stepExecuted) break
    }
  }

  newState.currentStep++
  return newState
}

function addLog(state: SemaphoreState, threadName: string, action: string, details: string) {
  state.log.push({
    step: state.currentStep,
    threadName,
    action,
    details,
    timestamp: Date.now(),
  })
}

export function isComplete(state: SemaphoreState): boolean {
  return state.threads.every(t => t.state === 'completed') && state.waitQueue.length === 0
}

