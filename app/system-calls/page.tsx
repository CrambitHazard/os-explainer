'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { Process, SystemCall } from './types'
import { demoScenarios } from './examples'
import {
  createInitialProcess,
  simulateFork,
  simulateExec,
  simulateWait,
  simulateExit,
  simulateOpen,
  simulateClose,
  simulateMalloc,
  simulateFree,
} from './simulators/processSimulator'
import ProcessTree from './components/ProcessTree'
import SystemCallTrace from './components/SystemCallTrace'
import ProcessDetails from './components/ProcessDetails'
import DemoSelector from './components/DemoSelector'
import CodeDisplay from './components/CodeDisplay'
import './system-calls.css'

export default function SystemCalls() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [systemCalls, setSystemCalls] = useState<SystemCall[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [currentDemo, setCurrentDemo] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const initialize = () => {
    const initialProcess = createInitialProcess()
    setProcesses([initialProcess])
    setSystemCalls([])
    setCurrentTime(0)
    setSelectedPid(initialProcess.pid)
    setStepIndex(0)
  }

  const runDemo = (demoKey: string) => {
    setCurrentDemo(demoKey)
    initialize()
    setStepIndex(0)
  }

  const executeNextStep = () => {
    if (!currentDemo) return

    const demo = demoScenarios[currentDemo]
    const time = currentTime + 0.5

    const runningProcess = processes.find(p => p.state === 'running') || processes[0]
    if (!runningProcess) return

    switch (currentDemo) {
      case 'fork':
        executeForkDemo(runningProcess, time)
        break
      case 'exec':
        executeExecDemo(runningProcess, time)
        break
      case 'forkexec':
        executeForkExecDemo(runningProcess, time)
        break
      case 'wait':
        executeWaitDemo(runningProcess, time)
        break
      case 'pipe':
        executePipeDemo(runningProcess, time)
        break
      case 'fileio':
        executeFileIODemo(runningProcess, time)
        break
    }

    setCurrentTime(time)
    setStepIndex(prev => prev + 1)
  }

  const executeForkDemo = (parent: Process, time: number) => {
    if (stepIndex === 0) {
      // First step: fork
      const { child, systemCall } = simulateFork(parent, time, processes)
      setProcesses(prev => [...prev, child])
      setSystemCalls(prev => [...prev, systemCall])
      setSelectedPid(child.pid)
    } else if (stepIndex === 1) {
      // Second step: child continues
      const child = processes.find(p => p.parentPid === parent.pid)
      if (child) {
        child.state = 'running'
        setProcesses([...processes])
      }
    }
  }

  const executeExecDemo = (process: Process, time: number) => {
    if (stepIndex === 0) {
      const systemCall = simulateExec(process, '/bin/ls', time)
      setProcesses([...processes])
      setSystemCalls(prev => [...prev, systemCall])
    }
  }

  const executeForkExecDemo = (parent: Process, time: number) => {
    if (stepIndex === 0) {
      // Fork
      const { child, systemCall } = simulateFork(parent, time, processes)
      setProcesses(prev => [...prev, child])
      setSystemCalls(prev => [...prev, systemCall])
      setSelectedPid(child.pid)
    } else if (stepIndex === 1) {
      // Child execs
      const child = processes.find(p => p.parentPid === parent.pid)
      if (child) {
        const systemCall = simulateExec(child, 'echo', time)
        child.state = 'running'
        setProcesses([...processes])
        setSystemCalls(prev => [...prev, systemCall])
      }
    } else if (stepIndex === 2) {
      // Parent waits
      const systemCall = simulateWait(parent, null, time)
      setProcesses([...processes])
      setSystemCalls(prev => [...prev, systemCall])
    } else if (stepIndex === 3) {
      // Child exits
      const child = processes.find(p => p.parentPid === parent.pid)
      if (child) {
        const systemCall = simulateExit(child, 0, time, processes)
        setProcesses([...processes])
        setSystemCalls(prev => [...prev, systemCall])
      }
    }
  }

  const executeWaitDemo = (parent: Process, time: number) => {
    if (stepIndex === 0) {
      // Fork
      const { child, systemCall } = simulateFork(parent, time, processes)
      setProcesses(prev => [...prev, child])
      setSystemCalls(prev => [...prev, systemCall])
    } else if (stepIndex === 1) {
      // Parent waits
      const child = processes.find(p => p.parentPid === parent.pid)
      if (child) {
        const systemCall = simulateWait(parent, child.pid, time)
        setProcesses([...processes])
        setSystemCalls(prev => [...prev, systemCall])
      }
    } else if (stepIndex === 2) {
      // Child works and exits
      const child = processes.find(p => p.parentPid === parent.pid)
      if (child) {
        child.state = 'running'
        setProcesses([...processes])
      }
    } else if (stepIndex === 3) {
      // Child exits
      const child = processes.find(p => p.parentPid === parent.pid)
      if (child) {
        const systemCall = simulateExit(child, 42, time, processes)
        setProcesses([...processes])
        setSystemCalls(prev => [...prev, systemCall])
      }
    }
  }

  const executePipeDemo = (parent: Process, time: number) => {
    if (stepIndex === 0) {
      // Create pipe
      const systemCall = simulateOpen(parent, 'pipe[0]', 'read', time)
      setSystemCalls(prev => [...prev, systemCall])
      setProcesses([...processes])
    } else if (stepIndex === 1) {
      const systemCall = simulateOpen(parent, 'pipe[1]', 'write', time)
      setSystemCalls(prev => [...prev, systemCall])
      setProcesses([...processes])
    } else if (stepIndex === 2) {
      // Fork
      const { child, systemCall } = simulateFork(parent, time, processes)
      setProcesses(prev => [...prev, child])
      setSystemCalls(prev => [...prev, systemCall])
    }
  }

  const executeFileIODemo = (process: Process, time: number) => {
    if (stepIndex === 0) {
      const systemCall = simulateOpen(process, 'file.txt', 'readwrite', time)
      setSystemCalls(prev => [...prev, systemCall])
      setProcesses([...processes])
    } else if (stepIndex === 1) {
      const fd = process.fileDescriptors.find(f => f.fileName === 'file.txt')?.fd
      if (fd) {
        const systemCall = simulateClose(process, fd, time)
        setSystemCalls(prev => [...prev, systemCall])
        setProcesses([...processes])
      }
    }
  }

  // Manual system calls
  const manualFork = () => {
    const parent = processes.find(p => p.pid === selectedPid)
    if (!parent) return

    const time = currentTime + 0.5
    const { child, systemCall } = simulateFork(parent, time, processes)
    setProcesses(prev => [...prev, child])
    setSystemCalls(prev => [...prev, systemCall])
    setCurrentTime(time)
    setSelectedPid(child.pid)
  }

  const manualExec = (program: string) => {
    const process = processes.find(p => p.pid === selectedPid)
    if (!process) return

    const time = currentTime + 0.5
    const systemCall = simulateExec(process, program, time)
    setProcesses([...processes])
    setSystemCalls(prev => [...prev, systemCall])
    setCurrentTime(time)
  }

  const manualWait = () => {
    const process = processes.find(p => p.pid === selectedPid)
    if (!process) return

    const time = currentTime + 0.5
    const systemCall = simulateWait(process, null, time)
    setProcesses([...processes])
    setSystemCalls(prev => [...prev, systemCall])
    setCurrentTime(time)
  }

  const manualExit = (code: number) => {
    const process = processes.find(p => p.pid === selectedPid)
    if (!process) return

    const time = currentTime + 0.5
    const systemCall = simulateExit(process, code, time, processes)
    setProcesses([...processes])
    setSystemCalls(prev => [...prev, systemCall])
    setCurrentTime(time)
  }

  const manualMalloc = (size: number) => {
    const process = processes.find(p => p.pid === selectedPid)
    if (!process) return

    const time = currentTime + 0.5
    const systemCall = simulateMalloc(process, size, time)
    setProcesses([...processes])
    setSystemCalls(prev => [...prev, systemCall])
    setCurrentTime(time)
  }

  const selectedProcess = processes.find(p => p.pid === selectedPid) || null

  if (processes.length === 0) {
    initialize()
  }

  return (
    <>
      <ThemeToggle />
      <div className="sc-container">
        <div className="sc-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>System Calls & OS Services</h1>
          <p>Interactive demonstrations of fork(), exec(), wait(), and more</p>
        </div>

        {!currentDemo && <DemoSelector onSelectDemo={runDemo} />}

        {currentDemo && (
          <>
            <div className="demo-controls">
              <button onClick={() => setCurrentDemo(null)} className="btn-back">
                ← Change Demo
              </button>
              <div className="time-display">Time: {currentTime.toFixed(1)}s</div>
              <button onClick={executeNextStep} className="btn-step">
                ▶ Next Step
              </button>
              <button onClick={() => runDemo(currentDemo)} className="btn-reset">
                🔄 Reset Demo
              </button>
            </div>

            <div className="demo-content">
              <div className="left-panel">
                <CodeDisplay demo={demoScenarios[currentDemo]} />
              </div>

              <div className="right-panel">
                <ProcessTree
                  processes={processes}
                  highlightPid={selectedPid || undefined}
                />
                <SystemCallTrace calls={systemCalls} maxDisplay={10} />
              </div>
            </div>

            <div className="bottom-panel">
              <ProcessDetails process={selectedProcess} />
              
              <div className="manual-controls">
                <h3>Manual System Calls</h3>
                <p className="manual-hint">Select a process from the tree and execute system calls manually:</p>
                <div className="manual-buttons">
                  <button onClick={manualFork} className="btn-syscall">
                    fork()
                  </button>
                  <button onClick={() => manualExec('program')} className="btn-syscall">
                    exec()
                  </button>
                  <button onClick={manualWait} className="btn-syscall">
                    wait()
                  </button>
                  <button onClick={() => manualExit(0)} className="btn-syscall">
                    exit(0)
                  </button>
                  <button onClick={() => manualMalloc(1024)} className="btn-syscall">
                    malloc(1024)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
