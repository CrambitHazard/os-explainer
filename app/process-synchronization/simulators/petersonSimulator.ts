import { PetersonState, Thread, LogEntry } from '../types'
import { petersonExample } from '../examples'

const COLORS = ['#00ff41', '#2563eb', '#f59e0b', '#ef4444']

export function initializePeterson(): PetersonState {
  const thread1: Thread = {
    id: 0,
    name: 'Thread 0',
    state: 'ready',
    operations: petersonExample.thread1,
    currentOperation: 0,
    color: COLORS[0],
  }

  const thread2: Thread = {
    id: 1,
    name: 'Thread 1',
    state: 'ready',
    operations: petersonExample.thread2,
    currentOperation: 0,
    color: COLORS[1],
  }

  return {
    flag: [false, false],
    turn: 0,
    threads: [thread1, thread2],
    currentStep: 0,
    log: [],
  }
}

export function stepPeterson(state: PetersonState): PetersonState {
  const newState = JSON.parse(JSON.stringify(state)) as PetersonState
  const { threads, flag, turn } = newState
  let stepExecuted = false

  // Check each thread
  for (let i = 0; i < 2; i++) {
    const thread = threads[i]
    
    if (thread.state === 'completed') continue
    if (thread.currentOperation >= thread.operations.length) {
      thread.state = 'completed'
      continue
    }

    const operation = thread.operations[thread.currentOperation]

    // Execute operation based on current step
    if (operation.includes('Request entry')) {
      thread.state = 'ready'
      addLog(newState, thread.name, 'Request', 'Requesting entry to critical section')
      thread.currentOperation++
      stepExecuted = true
      break
    } else if (operation.includes(`Set flag[${i}] = true`)) {
      newState.flag[i] = true
      addLog(newState, thread.name, 'Set Flag', `flag[${i}] = true`)
      thread.currentOperation++
      stepExecuted = true
      break
    } else if (operation.includes('Set turn =')) {
      const otherThread = i === 0 ? 1 : 0
      newState.turn = otherThread
      addLog(newState, thread.name, 'Set Turn', `turn = ${otherThread}`)
      thread.currentOperation++
      stepExecuted = true
      break
    } else if (operation.includes('Wait while')) {
      const otherThread = i === 0 ? 1 : 0
      // Check if we need to wait
      if (flag[otherThread] && turn === otherThread) {
        thread.state = 'waiting'
        addLog(newState, thread.name, 'Waiting', `Blocked: flag[${otherThread}]=${flag[otherThread]}, turn=${turn}`)
      } else {
        addLog(newState, thread.name, 'Pass Wait', `Proceeding: condition false`)
        thread.currentOperation++
      }
      stepExecuted = true
      break
    } else if (operation.includes('Enter critical section')) {
      thread.state = 'critical'
      addLog(newState, thread.name, 'Enter CS', 'Entered critical section')
      thread.currentOperation++
      stepExecuted = true
      break
    } else if (operation.includes('Execute critical work')) {
      addLog(newState, thread.name, 'Execute', 'Executing in critical section')
      thread.currentOperation++
      stepExecuted = true
      break
    } else if (operation.includes('Exit critical section')) {
      thread.state = 'ready'
      addLog(newState, thread.name, 'Exit CS', 'Exited critical section')
      thread.currentOperation++
      stepExecuted = true
      break
    } else if (operation.includes(`Set flag[${i}] = false`)) {
      newState.flag[i] = false
      addLog(newState, thread.name, 'Clear Flag', `flag[${i}] = false`)
      thread.state = 'completed'
      thread.currentOperation++
      stepExecuted = true
      break
    }

    if (stepExecuted) break
  }

  newState.currentStep++
  return newState
}

function addLog(state: PetersonState, threadName: string, action: string, details: string) {
  state.log.push({
    step: state.currentStep,
    threadName,
    action,
    details,
    timestamp: Date.now(),
  })
}

export function isComplete(state: PetersonState): boolean {
  return state.threads.every(t => t.state === 'completed')
}

