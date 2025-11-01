'use client'

import { Process } from '../types'
import Icon from '../../components/Icon'

interface Props {
  processes: Process[]
  highlightPid?: number
}

interface TreeNode {
  process: Process
  children: TreeNode[]
  level: number
}

export default function ProcessTree({ processes, highlightPid }: Props) {
  const buildTree = (parentPid: number | null, level: number = 0): TreeNode[] => {
    return processes
      .filter(p => p.parentPid === parentPid)
      .map(process => ({
        process,
        children: buildTree(process.pid, level + 1),
        level,
      }))
  }

  const renderNode = (node: TreeNode, isLast: boolean, prefix: string = ''): JSX.Element => {
    const { process, children, level } = node
    const isHighlighted = process.pid === highlightPid
    
    const getStateIcon = (state: string): JSX.Element => {
      const iconMap: { [key: string]: string } = {
        running: 'play',
        ready: 'pause',
        waiting: 'hourglass',
        terminated: 'check',
        zombie: 'ghost',
      }
      return <Icon name={iconMap[state] || 'pause'} size={14} />
    }

    return (
      <div key={process.pid} className="tree-node">
        <div className={`process-node ${process.state} ${isHighlighted ? 'highlighted' : ''}`}>
          <span className="tree-branch">{prefix}{isLast ? '└─' : '├─'}</span>
          <div 
            className="process-box"
            style={{ borderColor: process.color }}
          >
            <span className="state-icon">{getStateIcon(process.state)}</span>
            <div className="process-info">
              <span className="process-name">{process.name}</span>
              <span className="process-pid">PID: {process.pid}</span>
            </div>
            {process.execProgram && (
              <span className="exec-badge">exec: {process.execProgram}</span>
            )}
            {process.returnCode !== undefined && (
              <span className="return-code">exit({process.returnCode})</span>
            )}
          </div>
        </div>
        {children.length > 0 && (
          <div className="children">
            {children.map((child, index) =>
              renderNode(
                child,
                index === children.length - 1,
                prefix + (isLast ? '    ' : '│   ')
              )
            )}
          </div>
        )}
      </div>
    )
  }

  const rootNodes = buildTree(null)

  return (
    <div className="process-tree">
      <h3>Process Tree</h3>
      <div className="tree-container">
        {rootNodes.map((node, index) =>
          renderNode(node, index === rootNodes.length - 1)
        )}
      </div>
      <div className="state-legend">
        <div className="legend-item">
          <span><Icon name="play" size={14} /> Running</span>
          <span><Icon name="pause" size={14} /> Ready</span>
          <span><Icon name="hourglass" size={14} /> Waiting</span>
          <span><Icon name="check" size={14} /> Terminated</span>
          <span><Icon name="ghost" size={14} /> Zombie</span>
        </div>
      </div>
    </div>
  )
}

