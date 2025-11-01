import { IORequest, Interrupt, DeviceType, InterruptPriority } from './types'

export const deviceTypes = {
  disk: {
    name: 'Hard Disk',
    icon: '💾',
    transferRate: 100, // KB/s
    color: '#00ff41',
  },
  printer: {
    name: 'Printer',
    icon: '🖨️',
    transferRate: 50,
    color: '#00d4ff',
  },
  keyboard: {
    name: 'Keyboard',
    icon: '⌨️',
    transferRate: 1,
    color: '#ff00ff',
  },
  network: {
    name: 'Network Card',
    icon: '🌐',
    transferRate: 200,
    color: '#ffaa00',
  },
}

export const scenarios = {
  basic: {
    name: 'Basic I/O Operations',
    description: 'Simple queue of I/O requests with FCFS scheduling',
    requests: [
      { processName: 'Process A', deviceType: 'disk' as DeviceType, dataSize: 100, priority: 'medium' as InterruptPriority, diskLocation: 20 },
      { processName: 'Process B', deviceType: 'printer' as DeviceType, dataSize: 50, priority: 'low' as InterruptPriority },
      { processName: 'Process C', deviceType: 'disk' as DeviceType, dataSize: 150, priority: 'medium' as InterruptPriority, diskLocation: 45 },
    ],
    interrupts: [],
  },
  
  interrupts: {
    name: 'Interrupt Handling',
    description: 'Demonstrates interrupt priorities and handling',
    requests: [
      { processName: 'Process A', deviceType: 'disk' as DeviceType, dataSize: 200, priority: 'low' as InterruptPriority, diskLocation: 30 },
      { processName: 'Process B', deviceType: 'network' as DeviceType, dataSize: 100, priority: 'medium' as InterruptPriority },
    ],
    interrupts: [
      { type: 'Timer', priority: 'critical' as InterruptPriority, source: 'System Timer', arrivalTime: 1.5, handlingTime: 0.2 },
      { type: 'I/O Complete', priority: 'high' as InterruptPriority, source: 'Disk', arrivalTime: 3.0, handlingTime: 0.3 },
      { type: 'Keyboard Input', priority: 'medium' as InterruptPriority, source: 'Keyboard', arrivalTime: 2.5, handlingTime: 0.1 },
    ],
  },
  
  priority: {
    name: 'Priority-Based Scheduling',
    description: 'High-priority requests preempt lower priority ones',
    requests: [
      { processName: 'Background Task', deviceType: 'disk' as DeviceType, dataSize: 300, priority: 'low' as InterruptPriority, diskLocation: 10 },
      { processName: 'Critical Update', deviceType: 'disk' as DeviceType, dataSize: 50, priority: 'critical' as InterruptPriority, diskLocation: 60 },
      { processName: 'User Request', deviceType: 'printer' as DeviceType, dataSize: 100, priority: 'high' as InterruptPriority },
      { processName: 'System Log', deviceType: 'disk' as DeviceType, dataSize: 20, priority: 'low' as InterruptPriority, diskLocation: 35 },
    ],
    interrupts: [],
  },
  
  disk: {
    name: 'Disk I/O Optimization',
    description: 'SSTF algorithm minimizes disk head movement',
    requests: [
      { processName: 'Read A', deviceType: 'disk' as DeviceType, dataSize: 64, priority: 'medium' as InterruptPriority, diskLocation: 25 },
      { processName: 'Read B', deviceType: 'disk' as DeviceType, dataSize: 64, priority: 'medium' as InterruptPriority, diskLocation: 70 },
      { processName: 'Read C', deviceType: 'disk' as DeviceType, dataSize: 64, priority: 'medium' as InterruptPriority, diskLocation: 40 },
      { processName: 'Read D', deviceType: 'disk' as DeviceType, dataSize: 64, priority: 'medium' as InterruptPriority, diskLocation: 15 },
      { processName: 'Read E', deviceType: 'disk' as DeviceType, dataSize: 64, priority: 'medium' as InterruptPriority, diskLocation: 55 },
    ],
    interrupts: [],
  },
  
  mixed: {
    name: 'Mixed Workload',
    description: 'Multiple device types with varying priorities',
    requests: [
      { processName: 'DB Query', deviceType: 'disk' as DeviceType, dataSize: 200, priority: 'high' as InterruptPriority, diskLocation: 30 },
      { processName: 'Print Job', deviceType: 'printer' as DeviceType, dataSize: 150, priority: 'low' as InterruptPriority },
      { processName: 'Network Sync', deviceType: 'network' as DeviceType, dataSize: 500, priority: 'medium' as InterruptPriority },
      { processName: 'File Save', deviceType: 'disk' as DeviceType, dataSize: 100, priority: 'medium' as InterruptPriority, diskLocation: 50 },
      { processName: 'Email Send', deviceType: 'network' as DeviceType, dataSize: 50, priority: 'low' as InterruptPriority },
    ],
    interrupts: [
      { type: 'Timer', priority: 'critical' as InterruptPriority, source: 'System Timer', arrivalTime: 2.0, handlingTime: 0.15 },
      { type: 'Page Fault', priority: 'high' as InterruptPriority, source: 'MMU', arrivalTime: 4.5, handlingTime: 0.5 },
    ],
  },
}

export const requestColors = [
  '#00ff41', '#00d4ff', '#ff00ff', '#ffaa00',
  '#ff6b6b', '#51cf66', '#ffd43b', '#a78bfa',
]

export const interruptColors = {
  critical: '#ff0000',
  high: '#ff6b6b',
  medium: '#ffaa00',
  low: '#00ff41',
}

