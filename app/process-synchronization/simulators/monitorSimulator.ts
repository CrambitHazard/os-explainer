import { MonitorState, Thread, LogEntry } from '../types'

const COLORS = ['#00ff41', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6']

export function initializeMonitor(threadCount: number): MonitorState {
  const threads: Thread[] = []
  
  for (let i = 0; i < threadCount; i++) {
    threads.push({
      id: i,
      name: `Thread ${i}`,
      state: 'ready',
      operations: [
        'Call monitor method',
        'Acquire lock',
        'Check condition',
        'Execute in critical section',
        'Signal waiting threads',
        'Release lock',
      ],
      currentOperation: 0,
      color: COLORS[i % COLORS.length],
    })
  }

  return {
    locked: false,
    owner: null,
    waitQueue: [],
    conditionQueue: [],
    threads,
    currentStep: 0,
    log: [],
  }
}

export function stepMonitor(state: MonitorState): MonitorState {
  const newState = JSON.parse(JSON.stringify(state)) as MonitorState
  let stepExecuted = false

  // Wake up threads from condition queue if monitor is free
  if (!newState.locked && newState.conditionQueue.length > 0) {
    const thread = newState.conditionQueue.shift()!
    const actualThread = newState.threads.find(t => t.id === thread.id)!
    newState.waitQueue.push(actualThread)
    addLog(newState, actualThread.name, 'Wake Up', 'Moved from condition queue to wait queue')
    stepExecuted = true
  }

  // Process wait queue
  if (!newState.locked && newState.waitQueue.length > 0 && !stepExecuted) {
    const thread = newState.waitQueue.shift()!
    const actualThread = newState.threads.find(t => t.id === thread.id)!
    newState.locked = true
    newState.owner = actualThread
    actualThread.state = 'running'
    addLog(newState, actualThread.name, 'Acquire', 'Acquired monitor lock')
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

      if (operation.includes('Call monitor method')) {
        addLog(newState, thread.name, 'Call', 'Attempting to call monitor method')
        thread.currentOperation++
        stepExecuted = true
        break
      } else if (operation.includes('Acquire lock')) {
        if (!newState.locked) {
          newState.locked = true
          newState.owner = thread
          thread.state = 'running'
          addLog(newState, thread.name, 'Acquire', 'Acquired monitor lock')
          thread.currentOperation++
        } else {
          thread.state = 'waiting'
          if (!newState.waitQueue.find(t => t.id === thread.id)) {
            newState.waitQueue.push(thread)
            addLog(newState, thread.name, 'Block', 'Added to wait queue')
          }
        }
        stepExecuted = true
        break
      } else if (operation.includes('Check condition')) {
        // Simulate condition check - sometimes wait
        const shouldWait = Math.random() > 0.6 && thread.currentOperation === 2
        if (shouldWait) {
          thread.state = 'waiting'
          newState.conditionQueue.push(thread)
          newState.locked = false
          newState.owner = null
          addLog(newState, thread.name, 'Wait', 'Condition false, moved to condition queue')
          thread.currentOperation = 2 // Stay at check condition
        } else {
          addLog(newState, thread.name, 'Check', 'Condition satisfied, proceeding')
          thread.currentOperation++
        }
        stepExecuted = true
        break
      } else if (operation.includes('Execute in critical section')) {
        thread.state = 'critical'
        addLog(newState, thread.name, 'Execute', 'Executing in monitor')
        thread.currentOperation++
        stepExecuted = true
        break
      } else if (operation.includes('Signal waiting threads')) {
        if (newState.conditionQueue.length > 0) {
          addLog(newState, thread.name, 'Signal', 'Signaling condition variable')
        } else {
          addLog(newState, thread.name, 'Signal', 'No threads waiting on condition')
        }
        thread.currentOperation++
        stepExecuted = true
        break
      } else if (operation.includes('Release lock')) {
        newState.locked = false
        newState.owner = null
        thread.state = 'completed'
        addLog(newState, thread.name, 'Release', 'Released monitor lock')
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

function addLog(state: MonitorState, threadName: string, action: string, details: string) {
  state.log.push({
    step: state.currentStep,
    threadName,
    action,
    details,
    timestamp: Date.now(),
  })
}

export function isComplete(state: MonitorState): boolean {
  return state.threads.every(t => t.state === 'completed') && 
         state.waitQueue.length === 0 && 
         state.conditionQueue.length === 0
}

