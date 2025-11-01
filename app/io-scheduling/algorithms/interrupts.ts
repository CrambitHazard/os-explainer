import { Interrupt, IORequest, Device } from '../types'

export function handleInterrupts(
  interrupts: Interrupt[],
  currentTime: number,
  devices: Device[]
): {
  handledInterrupt: Interrupt | null
  interruptedRequests: IORequest[]
  description: string
} {
  // Find interrupts that should trigger at this time
  const pendingInterrupts = interrupts.filter(
    int => !int.handled && Math.abs(int.arrivalTime - currentTime) < 0.01
  )

  if (pendingInterrupts.length === 0) {
    return { handledInterrupt: null, interruptedRequests: [], description: '' }
  }

  // Get highest priority interrupt
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const interrupt = pendingInterrupts.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )[0]

  // Interrupt current operations if priority is high enough
  const interruptedRequests: IORequest[] = []
  
  if (interrupt.priority === 'critical' || interrupt.priority === 'high') {
    devices.forEach(device => {
      if (device.currentRequest && device.busy) {
        device.currentRequest.status = 'interrupted'
        interruptedRequests.push(device.currentRequest)
        // Return to queue
        device.queue.unshift(device.currentRequest)
        device.currentRequest = null
        device.busy = false
      }
    })
  }

  interrupt.handled = true

  const description = interruptedRequests.length > 0
    ? `${interrupt.priority.toUpperCase()} priority interrupt "${interrupt.type}" from ${interrupt.source}. Interrupted ${interruptedRequests.length} operation(s).`
    : `${interrupt.priority.toUpperCase()} priority interrupt "${interrupt.type}" from ${interrupt.source}. No operations interrupted.`

  return { handledInterrupt: interrupt, interruptedRequests, description }
}

export function canProcessInterrupt(interrupt: Interrupt, currentTime: number): boolean {
  return !interrupt.handled && interrupt.arrivalTime <= currentTime
}

export function getInterruptDescription(interrupt: Interrupt): string {
  const priorityEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '📢',
    low: '📌',
  }

  return `${priorityEmoji[interrupt.priority]} ${interrupt.type} from ${interrupt.source}`
}

