import { Process, SystemCall, ProcessState } from '../types'
import { processColors } from '../examples'

let nextPid = 1000
let callIdCounter = 0

export function createInitialProcess(): Process {
  return {
    pid: nextPid++,
    parentPid: null,
    name: 'main',
    state: 'running',
    createdAt: 0,
    children: [],
    fileDescriptors: [
      { fd: 0, fileName: 'stdin', mode: 'read', position: 0, isOpen: true },
      { fd: 1, fileName: 'stdout', mode: 'write', position: 0, isOpen: true },
      { fd: 2, fileName: 'stderr', mode: 'write', position: 0, isOpen: true },
    ],
    memoryAllocations: [],
    color: processColors[0],
  }
}

export function simulateFork(
  parent: Process,
  currentTime: number,
  allProcesses: Process[]
): { child: Process; systemCall: SystemCall } {
  const child: Process = {
    pid: nextPid++,
    parentPid: parent.pid,
    name: `${parent.name}_child`,
    state: 'ready',
    createdAt: currentTime,
    children: [],
    fileDescriptors: parent.fileDescriptors.map(fd => ({ ...fd })),
    memoryAllocations: parent.memoryAllocations.map(mem => ({ ...mem })),
    color: processColors[allProcesses.length % processColors.length],
  }

  parent.children.push(child.pid)

  const systemCall: SystemCall = {
    id: `call-${callIdCounter++}`,
    type: 'fork',
    pid: parent.pid,
    timestamp: currentTime,
    parameters: {},
    returnValue: { parent: child.pid, child: 0 },
    success: true,
    description: `fork() created child process ${child.pid}`,
  }

  return { child, systemCall }
}

export function simulateExec(
  process: Process,
  program: string,
  currentTime: number
): SystemCall {
  process.execProgram = program
  process.name = program
  // File descriptors remain open
  // Memory is replaced (clear allocations)
  process.memoryAllocations = []

  return {
    id: `call-${callIdCounter++}`,
    type: 'exec',
    pid: process.pid,
    timestamp: currentTime,
    parameters: { program },
    returnValue: null,
    success: true,
    description: `exec() replaced process image with "${program}"`,
  }
}

export function simulateWait(
  parent: Process,
  childPid: number | null,
  currentTime: number
): SystemCall {
  parent.state = 'waiting'
  parent.waitingFor = childPid || undefined

  return {
    id: `call-${callIdCounter++}`,
    type: 'wait',
    pid: parent.pid,
    timestamp: currentTime,
    parameters: { childPid },
    returnValue: null,
    success: true,
    description: `wait() - process ${parent.pid} waiting for child${childPid ? ` ${childPid}` : ''}`,
  }
}

export function simulateExit(
  process: Process,
  returnCode: number,
  currentTime: number,
  allProcesses: Process[]
): SystemCall {
  process.state = 'terminated'
  process.terminatedAt = currentTime
  process.returnCode = returnCode

  // Check if parent is waiting
  const parent = allProcesses.find(p => p.pid === process.parentPid)
  if (parent && parent.state === 'waiting') {
    if (!parent.waitingFor || parent.waitingFor === process.pid) {
      parent.state = 'ready'
      parent.waitingFor = undefined
    }
  } else if (parent) {
    // Parent not waiting - becomes zombie
    process.state = 'zombie'
  }

  return {
    id: `call-${callIdCounter++}`,
    type: 'exit',
    pid: process.pid,
    timestamp: currentTime,
    parameters: { returnCode },
    returnValue: returnCode,
    success: true,
    description: `exit(${returnCode}) - process ${process.pid} terminated`,
  }
}

export function simulateOpen(
  process: Process,
  fileName: string,
  mode: 'read' | 'write' | 'readwrite',
  currentTime: number
): SystemCall {
  const nextFd = Math.max(...process.fileDescriptors.map(f => f.fd), 2) + 1
  
  process.fileDescriptors.push({
    fd: nextFd,
    fileName,
    mode,
    position: 0,
    isOpen: true,
  })

  return {
    id: `call-${callIdCounter++}`,
    type: 'open',
    pid: process.pid,
    timestamp: currentTime,
    parameters: { fileName, mode },
    returnValue: nextFd,
    success: true,
    description: `open("${fileName}", ${mode}) = ${nextFd}`,
  }
}

export function simulateClose(
  process: Process,
  fd: number,
  currentTime: number
): SystemCall {
  const fileDesc = process.fileDescriptors.find(f => f.fd === fd)
  
  if (fileDesc) {
    fileDesc.isOpen = false
  }

  return {
    id: `call-${callIdCounter++}`,
    type: 'close',
    pid: process.pid,
    timestamp: currentTime,
    parameters: { fd },
    returnValue: 0,
    success: !!fileDesc,
    description: `close(${fd})${fileDesc ? ` - closed ${fileDesc.fileName}` : ' - invalid fd'}`,
  }
}

export function simulateMalloc(
  process: Process,
  size: number,
  currentTime: number
): SystemCall {
  const address = `0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`
  
  process.memoryAllocations.push({
    address,
    size,
    allocated: true,
  })

  return {
    id: `call-${callIdCounter++}`,
    type: 'malloc',
    pid: process.pid,
    timestamp: currentTime,
    parameters: { size },
    returnValue: address,
    success: true,
    description: `malloc(${size}) = ${address}`,
  }
}

export function simulateFree(
  process: Process,
  address: string,
  currentTime: number
): SystemCall {
  const block = process.memoryAllocations.find(m => m.address === address)
  
  if (block) {
    block.allocated = false
  }

  return {
    id: `call-${callIdCounter++}`,
    type: 'free',
    pid: process.pid,
    timestamp: currentTime,
    parameters: { address },
    returnValue: null,
    success: !!block,
    description: `free(${address})${block ? ` - freed ${block.size} bytes` : ' - invalid address'}`,
  }
}

