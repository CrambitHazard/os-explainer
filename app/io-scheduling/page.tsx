'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import { 
  IORequest, Device, Interrupt, IOMetrics, IOSchedulingAlgorithm, 
  DeviceType, InterruptPriority 
} from './types'
import { scenarios, deviceTypes, requestColors, interruptColors } from './examples'
import { scheduleNextRequest, calculateServiceTime, shouldPreempt } from './algorithms/scheduling'
import { handleInterrupts } from './algorithms/interrupts'
import DeviceVisualizer from './components/DeviceVisualizer'
import InterruptHandler from './components/InterruptHandler'
import RequestTimeline from './components/RequestTimeline'
import MetricsDisplay from './components/MetricsDisplay'
import './io-scheduling.css'

export default function IOScheduling() {
  const [algorithm, setAlgorithm] = useState<IOSchedulingAlgorithm>('FCFS')
  const [devices, setDevices] = useState<Device[]>([])
  const [requests, setRequests] = useState<IORequest[]>([])
  const [interrupts, setInterrupts] = useState<Interrupt[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  
  // Custom request form
  const [processName, setProcessName] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType>('disk')
  const [dataSize, setDataSize] = useState(100)
  const [priority, setPriority] = useState<InterruptPriority>('medium')
  const [diskLocation, setDiskLocation] = useState(50)

  const initializeDevices = () => {
    const initialDevices: Device[] = [
      {
        id: 'disk-1',
        type: 'disk',
        name: 'Hard Disk Drive',
        busy: false,
        currentRequest: null,
        queue: [],
        totalRequests: 0,
        completedRequests: 0,
        currentTrack: 0,
        transferRate: deviceTypes.disk.transferRate,
      },
      {
        id: 'printer-1',
        type: 'printer',
        name: 'Network Printer',
        busy: false,
        currentRequest: null,
        queue: [],
        totalRequests: 0,
        completedRequests: 0,
        transferRate: deviceTypes.printer.transferRate,
      },
      {
        id: 'network-1',
        type: 'network',
        name: 'Network Interface',
        busy: false,
        currentRequest: null,
        queue: [],
        totalRequests: 0,
        completedRequests: 0,
        transferRate: deviceTypes.network.transferRate,
      },
    ]
    setDevices(initialDevices)
  }

  const loadScenario = (scenarioKey: string) => {
    const scenario = scenarios[scenarioKey as keyof typeof scenarios]
    if (!scenario) return

    initializeDevices()
    setCurrentTime(0)
    setIsRunning(false)

    // Create requests
    const newRequests: IORequest[] = scenario.requests.map((req, index) => ({
      id: `req-${Date.now()}-${index}`,
      processName: req.processName,
      deviceType: req.deviceType,
      requestType: req.deviceType === 'disk' ? 'read' : req.deviceType === 'printer' ? 'print' : 'send',
      dataSize: req.dataSize,
      arrivalTime: 0,
      priority: req.priority,
      diskLocation: req.diskLocation,
      status: 'waiting',
      color: requestColors[index % requestColors.length],
    }))

    setRequests(newRequests)

    // Create interrupts
    const newInterrupts: Interrupt[] = scenario.interrupts.map((int, index) => ({
      id: `int-${Date.now()}-${index}`,
      type: int.type,
      priority: int.priority,
      source: int.source,
      arrivalTime: int.arrivalTime,
      handlingTime: int.handlingTime,
      handled: false,
      color: interruptColors[int.priority],
    }))

    setInterrupts(newInterrupts)
  }

  const addCustomRequest = () => {
    if (!processName.trim()) {
      alert('Please enter a process name')
      return
    }

    const newRequest: IORequest = {
      id: `req-${Date.now()}`,
      processName,
      deviceType,
      requestType: deviceType === 'disk' ? 'read' : deviceType === 'printer' ? 'print' : 'send',
      dataSize,
      arrivalTime: currentTime,
      priority,
      diskLocation: deviceType === 'disk' ? diskLocation : undefined,
      status: 'waiting',
      color: requestColors[requests.length % requestColors.length],
    }

    setRequests(prev => [...prev, newRequest])
    setProcessName('')
  }

  const simulationStep = () => {
    setDevices(prevDevices => {
      const newDevices = prevDevices.map(device => ({ ...device }))
      const newRequests = [...requests]
      const newInterrupts = [...interrupts]

      // Handle interrupts
      const interruptResult = handleInterrupts(newInterrupts, currentTime, newDevices)
      
      // Assign new requests to device queues
      newRequests.forEach(request => {
        if (request.status === 'waiting' && request.arrivalTime <= currentTime) {
          const device = newDevices.find(d => d.type === request.deviceType)
          if (device && !device.queue.some(r => r.id === request.id)) {
            device.queue.push(request)
            device.totalRequests++
          }
        }
      })

      // Process each device
      newDevices.forEach(device => {
        if (device.currentRequest) {
          const serviceTime = calculateServiceTime(device.currentRequest, device)
          const elapsed = currentTime - (device.currentRequest.startTime || currentTime)

          if (elapsed >= serviceTime) {
            // Request completed
            device.currentRequest.completionTime = currentTime
            device.currentRequest.turnaroundTime = currentTime - device.currentRequest.arrivalTime
            device.currentRequest.waitingTime = (device.currentRequest.startTime || 0) - device.currentRequest.arrivalTime
            device.currentRequest.status = 'completed'
            device.completedRequests++
            device.busy = false
            
            // Update disk track if applicable
            if (device.type === 'disk' && device.currentRequest.diskLocation !== undefined) {
              device.currentTrack = device.currentRequest.diskLocation
            }
            
            device.currentRequest = null
          }
        }

        // Schedule next request if device is idle
        if (!device.busy && device.queue.length > 0) {
          const nextRequest = scheduleNextRequest(device, algorithm)
          if (nextRequest) {
            device.queue = device.queue.filter(r => r.id !== nextRequest.id)
            nextRequest.startTime = currentTime
            nextRequest.status = 'processing'
            device.currentRequest = nextRequest
            device.busy = true
          }
        }
      })

      return newDevices
    })

    setCurrentTime(prev => prev + 0.1)
  }

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        simulationStep()
      }, 100 / simulationSpeed)

      return () => clearInterval(interval)
    }
  }, [isRunning, currentTime, simulationSpeed, algorithm])

  useEffect(() => {
    if (devices.length === 0) {
      initializeDevices()
    }
  }, [])

  const calculateMetrics = (): IOMetrics => {
    const completedRequests = requests.filter(r => r.status === 'completed')
    const totalRequests = requests.length

    const avgWaitingTime = completedRequests.length > 0
      ? completedRequests.reduce((sum, r) => sum + (r.waitingTime || 0), 0) / completedRequests.length
      : 0

    const avgTurnaroundTime = completedRequests.length > 0
      ? completedRequests.reduce((sum, r) => sum + (r.turnaroundTime || 0), 0) / completedRequests.length
      : 0

    const avgResponseTime = completedRequests.length > 0
      ? completedRequests.reduce((sum, r) => sum + ((r.startTime || 0) - r.arrivalTime), 0) / completedRequests.length
      : 0

    const deviceUtilization: { [key: string]: number } = {}
    devices.forEach(device => {
      const util = device.totalRequests > 0
        ? (device.completedRequests / device.totalRequests) * 100
        : 0
      deviceUtilization[device.name] = util
    })

    const throughput = currentTime > 0 ? completedRequests.length / currentTime : 0

    return {
      totalRequests,
      completedRequests: completedRequests.length,
      averageWaitingTime: avgWaitingTime,
      averageTurnaroundTime: avgTurnaroundTime,
      deviceUtilization,
      throughput,
      totalInterrupts: interrupts.filter(i => i.handled).length,
      averageResponseTime: avgResponseTime,
      missedDeadlines: 0,
    }
  }

  const reset = () => {
    initializeDevices()
    setRequests([])
    setInterrupts([])
    setCurrentTime(0)
    setIsRunning(false)
  }

  const allCompleted = requests.length > 0 && requests.every(r => r.status === 'completed')

  const metrics = calculateMetrics()

  return (
    <>
      <ThemeToggle />
      <div className="io-container">
        <div className="io-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>I/O & Device Scheduling</h1>
          <p>Simulate device queue management and interrupt handling</p>
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-row">
            <div className="control-group">
              <label>Scheduling Algorithm:</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as IOSchedulingAlgorithm)}
                className="algorithm-select"
              >
                <option value="FCFS">FCFS - First Come First Serve</option>
                <option value="Priority">Priority-Based Scheduling</option>
                <option value="SSTF">SSTF - Shortest Seek Time First (Disk)</option>
                <option value="RoundRobin">Round Robin</option>
              </select>
            </div>

            <div className="control-group">
              <label>Simulation Speed:</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="speed-slider"
              />
              <span className="speed-value">{simulationSpeed}x</span>
            </div>
          </div>

          <div className="simulation-controls">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`btn-control ${isRunning ? 'pause' : 'play'}`}
              disabled={requests.length === 0}
            >
              {isRunning ? <><Icon name="pause" size={16} /> Pause</> : <><Icon name="play" size={16} /> Start</>} Simulation
            </button>
            <button onClick={reset} className="btn-reset">
              <Icon name="reload" size={16} /> Reset
            </button>
            <div className="time-display">
              Time: <strong>{currentTime.toFixed(1)}s</strong>
            </div>
          </div>
        </div>

        {/* Scenario Selection */}
        {requests.length === 0 && (
          <div className="scenario-selector">
            <h3>Load Scenario:</h3>
            <div className="scenarios-grid">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => loadScenario(key)}
                  className="scenario-card"
                >
                  <h4>{scenario.name}</h4>
                  <p>{scenario.description}</p>
                  <div className="scenario-stats">
                    <span>{scenario.requests.length} requests</span>
                    <span>{scenario.interrupts.length} interrupts</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="custom-request-section">
              <h3>Or Add Custom Request:</h3>
              <div className="custom-form">
                <input
                  type="text"
                  placeholder="Process name"
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  className="process-input"
                />
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                  className="device-select"
                >
                  <option value="disk">Disk</option>
                  <option value="printer">Printer</option>
                  <option value="network">Network</option>
                </select>
                <input
                  type="number"
                  placeholder="Data size (KB)"
                  value={dataSize}
                  onChange={(e) => setDataSize(parseInt(e.target.value) || 100)}
                  className="size-input"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as InterruptPriority)}
                  className="priority-select"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                {deviceType === 'disk' && (
                  <input
                    type="number"
                    placeholder="Track location"
                    value={diskLocation}
                    onChange={(e) => setDiskLocation(parseInt(e.target.value) || 50)}
                    className="track-input"
                  />
                )}
                <button onClick={addCustomRequest} className="btn-add">
                  Add Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Area */}
        {requests.length > 0 && (
          <div className="simulation-area">
            <div className="main-grid">
              <div className="left-column">
                <DeviceVisualizer devices={devices} />
                <InterruptHandler interrupts={interrupts} currentTime={currentTime} />
              </div>
              <div className="right-column">
                <RequestTimeline requests={requests} currentTime={currentTime} />
                {allCompleted && <MetricsDisplay metrics={metrics} algorithm={algorithm} />}
              </div>
            </div>

            {!allCompleted && (
              <div className="quick-actions">
                <button onClick={addCustomRequest} className="btn-add-during">
                  + Add Request During Simulation
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
