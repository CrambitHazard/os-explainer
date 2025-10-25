'use client'

import { useState } from 'react'
import { Process, Algorithm } from '../types'

interface Props {
  onAddProcess: (process: Process) => void
  algorithm: Algorithm
}

export default function ProcessForm({ onAddProcess, algorithm }: Props) {
  const [name, setName] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [burstTime, setBurstTime] = useState('')
  const [priority, setPriority] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !arrivalTime || !burstTime) return
    if ((algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && !priority) return

    const process: Process = {
      id: Date.now().toString(),
      name,
      arrivalTime: parseInt(arrivalTime),
      burstTime: parseInt(burstTime),
      priority: (algorithm === 'Priority' || algorithm === 'Priority-Preemptive') ? parseInt(priority) : undefined,
    }

    onAddProcess(process)
    
    // Reset form
    setName('')
    setArrivalTime('')
    setBurstTime('')
    setPriority('')
  }

  return (
    <form onSubmit={handleSubmit} className="process-form">
      <div className="form-row">
        <input
          type="text"
          placeholder="Process Name (e.g., P1)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Arrival Time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          min="0"
          required
        />
        <input
          type="number"
          placeholder="Burst Time"
          value={burstTime}
          onChange={(e) => setBurstTime(e.target.value)}
          min="1"
          required
        />
        {(algorithm === 'Priority' || algorithm === 'Priority-Preemptive') && (
          <input
            type="number"
            placeholder="Priority (lower = higher priority)"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            min="1"
            required
          />
        )}
        <button type="submit" className="btn-add">Add Process</button>
      </div>
    </form>
  )
}

