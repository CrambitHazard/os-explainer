'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { Task, SubTask, OSLog, ChatMessage } from './types'
import OSScreen from './components/OSScreen'
import ChatInterface from './components/ChatInterface'
import TaskTracker from './components/TaskTracker'
import FileManager from './components/FileManager'
import ProcessManager from './components/ProcessManager'
import './os-simulator.css'

interface VirtualFile {
  name: string
  size: string
  type: 'file' | 'directory'
  inode: string
  created: string
}

interface VirtualProcess {
  pid: number
  name: string
  status: 'running' | 'sleeping' | 'zombie' | 'terminated'
  parentPid: number | null
  memory: string
  created: string
}

export default function FullOSSimulator() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<OSLog[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>([])
  const [virtualProcesses, setVirtualProcesses] = useState<VirtualProcess[]>([])

  const addLog = (type: 'info' | 'success' | 'error' | 'command', message: string, taskId?: string, subtaskId?: string) => {
    const log: OSLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      message,
      taskId,
      subtaskId,
    }
    setLogs(prev => [...prev, log])
  }

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, message])
  }

  const callOpenRouter = async (prompt: string, useMainModel: boolean): Promise<string> => {
    const modelEnvVar = useMainModel ? 'OPENROUTER_MODEL' : 'OPENROUTER_MODEL_2'
    const model = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'minimax/minimax-m2:free'
    const model2 = process.env.NEXT_PUBLIC_OPENROUTER_MODEL_2 || 'moonshotai/kimi-dev-72b:free'
    
    const selectedModel = useMainModel ? model : model2

    try {
      const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'API request failed')
      }

      const data = await response.json()
      let content = data.content
      
      // Clean up thinking tags from models like MiniMax
      content = content.replace(/◁think▷[\s\S]*?◁\/think▷/g, '').trim()
      
      return content
    } catch (error: any) {
      console.error('OpenRouter API error:', error)
      throw error
    }
  }

  const decomposeTask = async (userInput: string): Promise<SubTask[]> => {
    addLog('command', `Analyzing task: "${userInput}"`)
    
    const decompositionPrompt = `You are an OS task decomposer. Given a user task, break it down into specific, executable subtasks.

For each subtask, determine if it's:
- "long": Complex operations requiring deep analysis (e.g., algorithm design, complex logic, planning)
- "short": Simple, straightforward operations (e.g., creating a file, allocating memory, simple commands)

User Task: "${userInput}"

Respond in this EXACT JSON format:
{
  "subtasks": [
    {"description": "detailed step description", "type": "long"},
    {"description": "detailed step description", "type": "short"}
  ]
}

Be specific and actionable. Each subtask should be a clear OS operation.`

    try {
      const response = await callOpenRouter(decompositionPrompt, true)
      addLog('info', 'Task decomposition completed')
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      const subtasks: SubTask[] = parsed.subtasks.map((st: any, index: number) => ({
        id: `subtask-${Date.now()}-${index}`,
        description: st.description,
        type: st.type === 'long' ? 'long' : 'short',
        status: 'pending' as const,
      }))

      addLog('success', `Decomposed into ${subtasks.length} subtasks`)
      return subtasks
    } catch (error: any) {
      addLog('error', `Failed to decompose task: ${error.message}`)
      throw error
    }
  }

  const executeSubtask = async (subtask: SubTask): Promise<string> => {
    addLog('command', `Executing: ${subtask.description}`, undefined, subtask.id)
    
    const executionPrompt = `You are an OS simulator. Execute this specific operation and report the result.

Operation: ${subtask.description}

Simulate the OS operation and provide a brief result description (1-2 sentences) as if you performed it.
Focus on what happened, any resources affected, and success/failure.

Example responses:
- "Created file 'data.txt' with 1024 bytes allocated in inode #4521"
- "Forked process PID 1234 into child PID 1235, memory space copied"
- "Allocated 4KB memory block at address 0x7fff8000"

Provide ONLY the result description, no extra explanation.`

    try {
      const useMainModel = subtask.type === 'long'
      const modelType = useMainModel ? 'Deep Model' : 'Quick Model'
      addLog('info', `Using ${modelType} for ${subtask.type} task`, undefined, subtask.id)
      
      const result = await callOpenRouter(executionPrompt, useMainModel)
      addLog('success', `Completed: ${result.trim()}`, undefined, subtask.id)
      return result.trim()
    } catch (error: any) {
      addLog('error', `Failed to execute: ${error.message}`, undefined, subtask.id)
      throw error
    }
  }

  const processTask = async (userInput: string) => {
    setIsProcessing(true)
    
    const taskId = `task-${Date.now()}`
    const newTask: Task = {
      id: taskId,
      userInput,
      status: 'analyzing',
      subtasks: [],
      createdAt: Date.now(),
    }

    setTasks(prev => [...prev, newTask])
    addLog('info', `New task received: "${userInput}"`, taskId)

    try {
      // Step 1: Decompose task
      addMessage('system', 'Analyzing and decomposing your task...')
      const subtasks = await decomposeTask(userInput)
      
      newTask.subtasks = subtasks
      newTask.status = 'decomposed'
      setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))

      addMessage('assistant', `I've broken down your task into ${subtasks.length} subtasks. Executing them now...`)

      // Step 2: Execute subtasks one by one
      newTask.status = 'executing'
      setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))

      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i]
        
        // Update subtask status to processing
        subtask.status = 'processing'
        subtask.startTime = Date.now()
        setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))

        try {
          const result = await executeSubtask(subtask)
          subtask.result = result
          subtask.status = 'completed'
          subtask.endTime = Date.now()
          setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))
          
          // Parse result to update virtual file system and processes
          parseAndUpdateState(result)
        } catch (error: any) {
          subtask.error = error.message
          subtask.status = 'error'
          subtask.endTime = Date.now()
          setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))
        }
      }

      // Step 3: Complete task
      newTask.status = 'completed'
      newTask.completedAt = Date.now()
      setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))

      const successCount = subtasks.filter(st => st.status === 'completed').length
      addLog('success', `Task completed: ${successCount}/${subtasks.length} subtasks successful`, taskId)
      addMessage('assistant', `Task completed! Successfully executed ${successCount} out of ${subtasks.length} subtasks.`)

    } catch (error: any) {
      newTask.status = 'error'
      setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask } : t))
      addLog('error', `Task failed: ${error.message}`, taskId)
      addMessage('assistant', `Task failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const parseAndUpdateState = (result: string) => {
    const timestamp = new Date().toLocaleTimeString()
    
    // Parse file creation
    const fileMatch = result.match(/[Cc]reated file ['"]([^'"]+)['"].*?(\d+)\s*bytes.*?inode\s*#?(\d+)/i)
    if (fileMatch) {
      const newFile: VirtualFile = {
        name: fileMatch[1],
        size: fileMatch[2] === '0' ? '0 B' : `${fileMatch[2]} B`,
        type: 'file',
        inode: `#${fileMatch[3]}`,
        created: timestamp,
      }
      setVirtualFiles(prev => [...prev, newFile])
    }

    // Parse directory creation
    const dirMatch = result.match(/[Cc]reated directory ['"]([^'"]+)['"]/i)
    if (dirMatch) {
      const newDir: VirtualFile = {
        name: dirMatch[1],
        size: '4 KB',
        type: 'directory',
        inode: `#${Math.floor(Math.random() * 9000) + 1000}`,
        created: timestamp,
      }
      setVirtualFiles(prev => [...prev, newDir])
    }

    // Parse process creation (fork)
    const forkMatch = result.match(/[Ff]orked process PID\s*(\d+).*?child PID\s*(\d+)/i)
    if (forkMatch) {
      const parentPid = parseInt(forkMatch[1])
      const childPid = parseInt(forkMatch[2])
      
      const newProcess: VirtualProcess = {
        pid: childPid,
        name: 'child_process',
        status: 'running',
        parentPid: parentPid,
        memory: `${Math.floor(Math.random() * 8 + 2)} MB`,
        created: timestamp,
      }
      setVirtualProcesses(prev => [...prev, newProcess])
    }

    // Parse generic process creation
    const processMatch = result.match(/[Cc]reated process.*?PID\s*(\d+)/i)
    if (processMatch && !forkMatch) {
      const pid = parseInt(processMatch[1])
      const newProcess: VirtualProcess = {
        pid: pid,
        name: result.includes('exec') ? 'exec_process' : 'new_process',
        status: 'running',
        parentPid: null,
        memory: `${Math.floor(Math.random() * 12 + 4)} MB`,
        created: timestamp,
      }
      setVirtualProcesses(prev => [...prev, newProcess])
    }

    // Parse memory allocation
    const memMatch = result.match(/[Aa]llocated\s*(\d+[KMG]?B).*?address\s*(0x[0-9a-fA-F]+)/i)
    if (memMatch) {
      // Could track memory allocations if needed
    }
  }

  const handleSendMessage = (message: string) => {
    addMessage('user', message)
    processTask(message)
  }

  useEffect(() => {
    addLog('info', 'OS Simulator initialized')
    addLog('info', 'Ready to receive tasks')
    addMessage('system', 'Welcome! I\'m your AI-powered OS simulator. Describe any OS task, and I\'ll execute it for you.')
  }, [])

  return (
    <>
      <ThemeToggle />
      <div className="full-os-container">
        <div className="os-header-bar">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h1>AI-Powered Full OS Simulator</h1>
          <div className="header-badge">
            <span className="badge-dot"></span>
            Powered by OpenRouter
          </div>
        </div>

        <div className="os-main-layout">
          <div className="os-left-side">
            <OSScreen logs={logs} />
            <div className="managers-grid">
              <FileManager files={virtualFiles} />
              <ProcessManager processes={virtualProcesses} />
            </div>
            <TaskTracker tasks={tasks} />
          </div>

          <div className="os-right-side">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </>
  )
}

