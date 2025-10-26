'use client'

import { DemoScenario } from '../types'

interface Props {
  demo: DemoScenario
}

export default function CodeDisplay({ demo }: Props) {
  return (
    <div className="code-display">
      <h3>Code Example: {demo.name}</h3>
      
      <div className="code-container">
        <pre className="code-block">
          <code>{demo.code}</code>
        </pre>
      </div>

      <div className="execution-steps">
        <h4>Execution Steps:</h4>
        <ol>
          {demo.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="key-concepts">
        <h4>Key Concepts:</h4>
        <ul>
          {demo.concepts.map((concept, index) => (
            <li key={index}>{concept}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

