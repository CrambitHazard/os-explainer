'use client'

import { useState } from 'react'
import { BankerState } from '../types'

interface Props {
  state: BankerState
  onRequest: (processId: number, request: number[]) => void
}

export default function RequestForm({ state, onRequest }: Props) {
  const [selectedProcess, setSelectedProcess] = useState(0)
  const [request, setRequest] = useState<number[]>(
    state.resources.map(() => 0)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRequest(selectedProcess, request)
  }

  const handleRequestChange = (index: number, value: string) => {
    const newRequest = [...request]
    newRequest[index] = parseInt(value) || 0
    setRequest(newRequest)
  }

  return (
    <div className="request-form">
      <h4>Request Resources</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Process:</label>
          <select
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(parseInt(e.target.value))}
          >
            {state.processes.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Request Vector:</label>
          <div className="request-inputs">
            {state.resources.map((resource, index) => (
              <div key={resource.id} className="resource-input">
                <label>{resource.name}:</label>
                <input
                  type="number"
                  min="0"
                  max={state.processes[selectedProcess].need[index]}
                  value={request[index]}
                  onChange={(e) => handleRequestChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="process-info">
          <div className="info-item">
            <span>Current Need:</span>
            <span className="value">[{state.processes[selectedProcess].need.join(', ')}]</span>
          </div>
          <div className="info-item">
            <span>Available:</span>
            <span className="value">[{state.available.join(', ')}]</span>
          </div>
        </div>

        <button type="submit" className="btn-request">
          Test Request
        </button>
      </form>
    </div>
  )
}

