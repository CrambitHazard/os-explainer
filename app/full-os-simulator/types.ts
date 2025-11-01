export type TaskType = 'long' | 'short'

export interface SubTask {
  id: string
  description: string
  type: TaskType
  status: 'pending' | 'processing' | 'completed' | 'error'
  result?: string
  error?: string
  startTime?: number
  endTime?: number
}

export interface Task {
  id: string
  userInput: string
  status: 'analyzing' | 'decomposed' | 'executing' | 'completed' | 'error'
  subtasks: SubTask[]
  createdAt: number
  completedAt?: number
}

export interface OSLog {
  id: string
  timestamp: number
  type: 'info' | 'success' | 'error' | 'command'
  message: string
  taskId?: string
  subtaskId?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

