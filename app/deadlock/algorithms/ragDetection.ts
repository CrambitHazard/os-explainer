import { RAGState, Edge, Process, Resource } from '../types'

export function detectCycles(state: RAGState): string[][] {
  const cycles: string[][] = []
  const graph = buildAdjacencyList(state.edges)
  const visited = new Set<string>()
  const recStack = new Set<string>()

  // Get all nodes (processes and resources)
  const nodes = new Set<string>()
  state.edges.forEach(edge => {
    nodes.add(edge.from)
    nodes.add(edge.to)
  })

  function dfs(node: string, path: string[]): boolean {
    visited.add(node)
    recStack.add(node)
    path.push(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path])) {
          return true
        }
      } else if (recStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor)
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart)
          cycle.push(neighbor)
          cycles.push(cycle)
        }
        return true
      }
    }

    recStack.delete(node)
    return false
  }

  // Check each node
  for (const node of nodes) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  return cycles
}

function buildAdjacencyList(edges: Edge[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  
  edges.forEach(edge => {
    if (!graph.has(edge.from)) {
      graph.set(edge.from, [])
    }
    graph.get(edge.from)!.push(edge.to)
  })

  return graph
}

export function buildEdgesFromState(
  processes: Process[],
  resources: Resource[]
): Edge[] {
  const edges: Edge[] = []

  // Add allocation edges (Resource -> Process)
  processes.forEach(process => {
    process.allocation.forEach((allocated, resIndex) => {
      if (allocated > 0) {
        for (let i = 0; i < allocated; i++) {
          edges.push({
            from: `R${resIndex}`,
            to: process.name,
            type: 'allocation',
          })
        }
      }
    })
  })

  // Add request edges (Process -> Resource) based on need
  processes.forEach(process => {
    process.need.forEach((needed, resIndex) => {
      if (needed > 0 && resources[resIndex].available === 0) {
        // Only add request edge if resource is not available
        edges.push({
          from: process.name,
          to: `R${resIndex}`,
          type: 'request',
        })
      }
    })
  })

  return edges
}

export function analyzeDeadlock(cycles: string[][]): {
  hasDeadlock: boolean
  analysis: string[]
} {
  const analysis: string[] = []

  if (cycles.length === 0) {
    analysis.push('✓ No cycles detected in resource allocation graph')
    analysis.push('✓ System is free from deadlock')
    return { hasDeadlock: false, analysis }
  }

  analysis.push(`✗ Detected ${cycles.length} cycle(s) in the resource allocation graph`)
  
  cycles.forEach((cycle, index) => {
    analysis.push(`Cycle ${index + 1}: ${cycle.join(' → ')}`)
  })

  // Check if cycles involve processes waiting for each other
  const involvedProcesses = new Set<string>()
  cycles.forEach(cycle => {
    cycle.forEach(node => {
      if (node.startsWith('P')) {
        involvedProcesses.add(node)
      }
    })
  })

  if (involvedProcesses.size >= 2) {
    analysis.push('✗ Circular wait condition detected')
    analysis.push(`✗ Processes in deadlock: ${Array.from(involvedProcesses).join(', ')}`)
    return { hasDeadlock: true, analysis }
  }

  return { hasDeadlock: false, analysis }
}

