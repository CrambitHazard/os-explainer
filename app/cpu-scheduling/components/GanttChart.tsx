'use client'

import { GanttItem } from '../types'

interface Props {
  gantt: GanttItem[]
}

const COLORS = [
  '#00ff41', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
]

export default function GanttChart({ gantt }: Props) {
  if (gantt.length === 0) return null

  const maxTime = Math.max(...gantt.map(item => item.end))
  const processNames = [...new Set(gantt.map(item => item.processName))]
  const processColors = Object.fromEntries(
    processNames.map((name, i) => [name, COLORS[i % COLORS.length]])
  )

  return (
    <div className="gantt-container">
      <h3>Gantt Chart</h3>
      <div className="gantt-chart">
        <div className="gantt-timeline">
          {gantt.map((item, index) => {
            const width = ((item.end - item.start) / maxTime) * 100
            return (
              <div
                key={index}
                className="gantt-block"
                style={{
                  width: `${width}%`,
                  background: processColors[item.processName],
                }}
              >
                <span className="gantt-label">{item.processName}</span>
                <span className="gantt-time">{item.end - item.start}</span>
              </div>
            )
          })}
        </div>
        <div className="gantt-axis">
          {gantt.map((item, index) => {
            const width = ((item.end - item.start) / maxTime) * 100
            return (
              <div
                key={index}
                className="gantt-marker"
                style={{ width: `${width}%` }}
              >
                {index === 0 && <span className="time-start">{item.start}</span>}
                <span className="time-end">{item.end}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="legend">
        <h4>Process Legend:</h4>
        <div className="legend-items">
          {processNames.map(name => (
            <div key={name} className="legend-item">
              <div 
                className="legend-color" 
                style={{ background: processColors[name] }}
              />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

