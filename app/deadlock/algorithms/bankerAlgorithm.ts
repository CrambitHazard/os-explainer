import { BankerState, Process, RequestResult } from '../types'

export function runSafetyAlgorithm(state: BankerState): BankerState {
  const newState = JSON.parse(JSON.stringify(state)) as BankerState
  const work = [...newState.available]
  const finish = newState.processes.map(() => false)
  const safeSequence: string[] = []
  let found = true

  newState.log = []
  addLog(newState, `Starting safety algorithm...`, 'info')
  addLog(newState, `Available resources: [${work.join(', ')}]`, 'info')

  let step = 0
  while (found && safeSequence.length < newState.processes.length) {
    found = false
    step++

    for (let i = 0; i < newState.processes.length; i++) {
      const process = newState.processes[i]
      
      if (finish[i]) continue

      // Check if Need[i] <= Work
      const canFinish = process.need.every((need, j) => need <= work[j])

      if (canFinish) {
        addLog(newState, `Step ${step}: ${process.name} can finish (Need: [${process.need.join(', ')}] <= Work: [${work.join(', ')}])`, 'success')
        
        // Add allocation back to work
        process.allocation.forEach((alloc, j) => {
          work[j] += alloc
        })

        finish[i] = true
        process.finished = true
        safeSequence.push(process.name)
        found = true

        addLog(newState, `${process.name} releases resources. Work = [${work.join(', ')}]`, 'info')
        break
      }
    }

    if (!found && safeSequence.length < newState.processes.length) {
      addLog(newState, `No process can proceed with available resources`, 'error')
    }
  }

  newState.safeSequence = safeSequence
  newState.isSafe = safeSequence.length === newState.processes.length

  if (newState.isSafe) {
    addLog(newState, `✓ System is in SAFE state`, 'success')
    addLog(newState, `Safe sequence: ${safeSequence.join(' → ')}`, 'success')
  } else {
    addLog(newState, `✗ System is in UNSAFE state (potential deadlock)`, 'error')
    const unfinished = newState.processes.filter((_, i) => !finish[i]).map(p => p.name)
    addLog(newState, `Processes that cannot complete: ${unfinished.join(', ')}`, 'error')
  }

  return newState
}

export function requestResources(
  state: BankerState,
  processId: number,
  request: number[]
): RequestResult {
  const process = state.processes[processId]

  // Check if request exceeds need
  for (let i = 0; i < request.length; i++) {
    if (request[i] > process.need[i]) {
      return {
        granted: false,
        reason: `Request [${request.join(', ')}] exceeds maximum need [${process.need.join(', ')}]`,
      }
    }
  }

  // Check if request exceeds available
  for (let i = 0; i < request.length; i++) {
    if (request[i] > state.available[i]) {
      return {
        granted: false,
        reason: `Request [${request.join(', ')}] exceeds available resources [${state.available.join(', ')}]`,
      }
    }
  }

  // Pretend to allocate and check safety
  const testState = JSON.parse(JSON.stringify(state)) as BankerState
  const testProcess = testState.processes[processId]

  for (let i = 0; i < request.length; i++) {
    testState.available[i] -= request[i]
    testProcess.allocation[i] += request[i]
    testProcess.need[i] -= request[i]
  }

  const resultState = runSafetyAlgorithm(testState)

  if (resultState.isSafe) {
    return {
      granted: true,
      reason: `Request granted. System remains in safe state. Safe sequence: ${resultState.safeSequence.join(' → ')}`,
      newState: resultState,
    }
  } else {
    return {
      granted: false,
      reason: `Request denied. Would lead to unsafe state (potential deadlock)`,
    }
  }
}

function addLog(state: BankerState, message: string, type: 'info' | 'success' | 'warning' | 'error') {
  state.log.push({
    step: state.currentStep++,
    message,
    type,
    timestamp: Date.now(),
  })
}

export function calculateNeed(processes: Process[]): Process[] {
  return processes.map(p => ({
    ...p,
    need: p.maximum.map((max, i) => max - p.allocation[i]),
  }))
}

