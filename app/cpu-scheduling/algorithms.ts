import { Process, GanttItem } from './types'

export function fcfs(processes: Process[]): { gantt: GanttItem[], processes: Process[] } {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
  const gantt: GanttItem[] = []
  let currentTime = 0

  sorted.forEach(process => {
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime
    }

    const start = currentTime
    const end = currentTime + process.burstTime

    gantt.push({
      processName: process.name,
      start,
      end,
    })

    process.completionTime = end
    process.turnaroundTime = process.completionTime - process.arrivalTime
    process.waitingTime = process.turnaroundTime - process.burstTime
    process.responseTime = start - process.arrivalTime

    currentTime = end
  })

  return { gantt, processes: sorted }
}

export function sjf(processes: Process[]): { gantt: GanttItem[], processes: Process[] } {
  const remaining = [...processes].map(p => ({ ...p }))
  const gantt: GanttItem[] = []
  const completed: Process[] = []
  let currentTime = 0

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      currentTime = Math.min(...remaining.map(p => p.arrivalTime))
      continue
    }

    const shortest = available.reduce((min, p) => 
      p.burstTime < min.burstTime ? p : min
    )

    const start = currentTime
    const end = currentTime + shortest.burstTime

    gantt.push({
      processName: shortest.name,
      start,
      end,
    })

    shortest.completionTime = end
    shortest.turnaroundTime = shortest.completionTime - shortest.arrivalTime
    shortest.waitingTime = shortest.turnaroundTime - shortest.burstTime
    shortest.responseTime = start - shortest.arrivalTime

    currentTime = end
    completed.push(shortest)
    remaining.splice(remaining.indexOf(shortest), 1)
  }

  return { gantt, processes: completed }
}

export function srtf(processes: Process[]): { gantt: GanttItem[], processes: Process[] } {
  const remaining = [...processes].map(p => ({ 
    ...p, 
    remainingTime: p.burstTime,
    responseTime: -1 
  }))
  const gantt: GanttItem[] = []
  const completed: Process[] = []
  let currentTime = 0
  let lastProcess: string | null = null

  const maxTime = Math.max(...processes.map(p => p.arrivalTime + p.burstTime)) * 2

  while (remaining.length > 0 && currentTime < maxTime) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      currentTime++
      continue
    }

    const shortest = available.reduce((min, p) => 
      p.remainingTime! < min.remainingTime! ? p : min
    )

    if (shortest.responseTime === -1) {
      shortest.responseTime = currentTime - shortest.arrivalTime
    }

    if (lastProcess !== shortest.name) {
      gantt.push({
        processName: shortest.name,
        start: currentTime,
        end: currentTime + 1,
      })
      lastProcess = shortest.name
    } else {
      gantt[gantt.length - 1].end++
    }

    shortest.remainingTime!--
    currentTime++

    if (shortest.remainingTime === 0) {
      shortest.completionTime = currentTime
      shortest.turnaroundTime = shortest.completionTime - shortest.arrivalTime
      shortest.waitingTime = shortest.turnaroundTime - shortest.burstTime
      completed.push(shortest)
      remaining.splice(remaining.indexOf(shortest), 1)
      lastProcess = null
    }
  }

  return { gantt, processes: completed }
}

export function priority(processes: Process[]): { gantt: GanttItem[], processes: Process[] } {
  const remaining = [...processes].map(p => ({ ...p }))
  const gantt: GanttItem[] = []
  const completed: Process[] = []
  let currentTime = 0

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      currentTime = Math.min(...remaining.map(p => p.arrivalTime))
      continue
    }

    const highest = available.reduce((max, p) => 
      (p.priority || 0) < (max.priority || 0) ? p : max
    )

    const start = currentTime
    const end = currentTime + highest.burstTime

    gantt.push({
      processName: highest.name,
      start,
      end,
    })

    highest.completionTime = end
    highest.turnaroundTime = highest.completionTime - highest.arrivalTime
    highest.waitingTime = highest.turnaroundTime - highest.burstTime
    highest.responseTime = start - highest.arrivalTime

    currentTime = end
    completed.push(highest)
    remaining.splice(remaining.indexOf(highest), 1)
  }

  return { gantt, processes: completed }
}

export function priorityPreemptive(processes: Process[]): { gantt: GanttItem[], processes: Process[] } {
  const remaining = [...processes].map(p => ({ 
    ...p, 
    remainingTime: p.burstTime,
    responseTime: -1 
  }))
  const gantt: GanttItem[] = []
  const completed: Process[] = []
  let currentTime = 0
  let lastProcess: string | null = null

  const maxTime = Math.max(...processes.map(p => p.arrivalTime + p.burstTime)) * 2

  while (remaining.length > 0 && currentTime < maxTime) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      currentTime++
      continue
    }

    // Select process with highest priority (lowest priority number)
    const highest = available.reduce((max, p) => 
      (p.priority || 0) < (max.priority || 0) ? p : max
    )

    if (highest.responseTime === -1) {
      highest.responseTime = currentTime - highest.arrivalTime
    }

    if (lastProcess !== highest.name) {
      gantt.push({
        processName: highest.name,
        start: currentTime,
        end: currentTime + 1,
      })
      lastProcess = highest.name
    } else {
      gantt[gantt.length - 1].end++
    }

    highest.remainingTime!--
    currentTime++

    if (highest.remainingTime === 0) {
      highest.completionTime = currentTime
      highest.turnaroundTime = highest.completionTime - highest.arrivalTime
      highest.waitingTime = highest.turnaroundTime - highest.burstTime
      completed.push(highest)
      remaining.splice(remaining.indexOf(highest), 1)
      lastProcess = null
    }
  }

  return { gantt, processes: completed }
}

export function roundRobin(
  processes: Process[], 
  timeQuantum: number = 2
): { gantt: GanttItem[], processes: Process[] } {
  const queue = [...processes]
    .sort((a, b) => a.arrivalTime - b.arrivalTime)
    .map(p => ({ ...p, remainingTime: p.burstTime, responseTime: -1 }))
  
  const gantt: GanttItem[] = []
  const completed: Process[] = []
  let currentTime = 0
  const readyQueue: typeof queue = []

  while (queue.length > 0 || readyQueue.length > 0) {
    // Add newly arrived processes to ready queue
    while (queue.length > 0 && queue[0].arrivalTime <= currentTime) {
      readyQueue.push(queue.shift()!)
    }

    if (readyQueue.length === 0) {
      currentTime = queue[0]?.arrivalTime || currentTime
      continue
    }

    const process = readyQueue.shift()!
    
    if (process.responseTime === -1) {
      process.responseTime = currentTime - process.arrivalTime
    }

    const executeTime = Math.min(timeQuantum, process.remainingTime!)
    const start = currentTime
    const end = currentTime + executeTime

    gantt.push({
      processName: process.name,
      start,
      end,
    })

    process.remainingTime! -= executeTime
    currentTime = end

    // Add newly arrived processes before re-adding current process
    while (queue.length > 0 && queue[0].arrivalTime <= currentTime) {
      readyQueue.push(queue.shift()!)
    }

    if (process.remainingTime! > 0) {
      readyQueue.push(process)
    } else {
      process.completionTime = currentTime
      process.turnaroundTime = process.completionTime - process.arrivalTime
      process.waitingTime = process.turnaroundTime - process.burstTime
      completed.push(process)
    }
  }

  return { gantt, processes: completed }
}

