import { IORequest, Device, IOSchedulingAlgorithm } from '../types'

export function scheduleNextRequest(
  device: Device,
  algorithm: IOSchedulingAlgorithm
): IORequest | null {
  if (device.queue.length === 0) return null

  switch (algorithm) {
    case 'FCFS':
      return scheduleFCFS(device)
    case 'Priority':
      return schedulePriority(device)
    case 'SSTF':
      return scheduleSSTF(device)
    case 'RoundRobin':
      return scheduleRoundRobin(device)
    default:
      return device.queue[0]
  }
}

function scheduleFCFS(device: Device): IORequest {
  // First Come First Serve - simple queue
  return device.queue[0]
}

function schedulePriority(device: Device): IORequest {
  // Highest priority first
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  
  let highestPriority = device.queue[0]
  let highestPriorityIndex = 0

  device.queue.forEach((request, index) => {
    if (priorityOrder[request.priority] < priorityOrder[highestPriority.priority]) {
      highestPriority = request
      highestPriorityIndex = index
    }
  })

  // Move to front
  device.queue.splice(highestPriorityIndex, 1)
  device.queue.unshift(highestPriority)
  
  return device.queue[0]
}

function scheduleSSTF(device: Device): IORequest {
  // Shortest Seek Time First (for disk devices)
  if (device.type !== 'disk' || device.currentTrack === undefined) {
    return device.queue[0]
  }

  let closest = device.queue[0]
  let closestDistance = Math.abs((closest.diskLocation || 0) - device.currentTrack)
  let closestIndex = 0

  device.queue.forEach((request, index) => {
    if (request.diskLocation !== undefined) {
      const distance = Math.abs(request.diskLocation - device.currentTrack!)
      if (distance < closestDistance) {
        closest = request
        closestDistance = distance
        closestIndex = index
      }
    }
  })

  // Move to front
  device.queue.splice(closestIndex, 1)
  device.queue.unshift(closest)
  
  return device.queue[0]
}

function scheduleRoundRobin(device: Device): IORequest {
  // Simple round robin - just return first and rotate
  return device.queue[0]
}

export function calculateServiceTime(request: IORequest, device: Device): number {
  // Base service time = data size / transfer rate
  let serviceTime = request.dataSize / device.transferRate

  // Add seek time for disk I/O
  if (device.type === 'disk' && request.diskLocation !== undefined && device.currentTrack !== undefined) {
    const seekDistance = Math.abs(request.diskLocation - device.currentTrack)
    const seekTime = seekDistance * 0.01 // 10ms per track
    serviceTime += seekTime
  }

  return serviceTime
}

export function shouldPreempt(
  currentRequest: IORequest,
  newRequest: IORequest,
  algorithm: IOSchedulingAlgorithm
): boolean {
  if (algorithm !== 'Priority') return false

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return priorityOrder[newRequest.priority] < priorityOrder[currentRequest.priority]
}

