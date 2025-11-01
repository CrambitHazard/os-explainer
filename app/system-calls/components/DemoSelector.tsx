'use client'

import { demoScenarios } from '../examples'

interface Props {
  onSelectDemo: (demoKey: string) => void
}

export default function DemoSelector({ onSelectDemo }: Props) {
  return (
    <div className="demo-selector">
      <h3>Select a Demo:</h3>
      <div className="demos-grid">
        {Object.entries(demoScenarios).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => onSelectDemo(key)}
            className="demo-card"
          >
            <h4>{demo.name}</h4>
            <p>{demo.description}</p>
            <div className="demo-concepts">
              {demo.concepts.slice(0, 2).map((concept, index) => (
                <span key={index} className="concept-badge">
                  {concept}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

