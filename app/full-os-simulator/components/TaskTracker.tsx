'use client'

import { Task, SubTask } from '../types'
import Icon from '../../components/Icon'

interface Props {
  tasks: Task[]
}

export default function TaskTracker({ tasks }: Props) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'processing': return 'status-processing'
      case 'error': return 'status-error'
      default: return 'status-pending'
    }
  }

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'completed': return <Icon name="check" size={14} />
      case 'processing': return <Icon name="reload" size={14} />
      case 'error': return <Icon name="cross" size={14} />
      default: return <Icon name="pause" size={14} />
    }
  }

  return (
    <div className="task-tracker">
      <h3>Task Execution Tracker</h3>
      
      {tasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks yet. Send a message to get started!</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <span className={`task-status ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className="task-time">
                  {new Date(task.createdAt).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="task-input">
                <strong>Task:</strong> {task.userInput}
              </div>

              {task.subtasks.length > 0 && (
                <div className="subtasks-container">
                  <div className="subtasks-header">
                    Subtasks ({task.subtasks.filter(st => st.status === 'completed').length}/{task.subtasks.length} completed):
                  </div>
                  <div className="subtasks-list">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className={`subtask-item ${getStatusColor(subtask.status)}`}>
                        <span className="subtask-icon">{getStatusIcon(subtask.status)}</span>
                        <div className="subtask-content">
                          <div className="subtask-desc">{subtask.description}</div>
                          <div className="subtask-meta">
                            <span className={`subtask-type ${subtask.type}`}>
                              {subtask.type === 'long' ? <><Icon name="ai-powered" size={12} /> Deep</> : <><Icon name="signal" size={12} /> Quick</>}
                            </span>
                            {subtask.status === 'processing' && (
                              <span className="subtask-spinner">Processing...</span>
                            )}
                            {subtask.result && (
                              <span className="subtask-result"><Icon name="check" size={12} /> {subtask.result}</span>
                            )}
                            {subtask.error && (
                              <span className="subtask-error"><Icon name="cross" size={12} /> {subtask.error}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

