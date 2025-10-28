'use client'

import { useState } from 'react'
import { ChatMessage } from '../types'
import Icon from '../../components/Icon'

interface Props {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isProcessing: boolean
}

export default function ChatInterface({ messages, onSendMessage, isProcessing }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>AI Task Controller</h3>
        <div className="chat-status">
          {isProcessing ? (
            <><span className="status-indicator processing"></span> Processing...</>
          ) : (
            <><span className="status-indicator ready"></span> Ready</>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="empty-icon">🤖</div>
            <h4>Welcome to AI-Powered OS Simulator!</h4>
            <p>Describe what you want the OS to do, and I'll break it down into executable subtasks.</p>
            <div className="example-prompts">
              <div className="example-title">Try examples:</div>
              <button className="example-btn" onClick={() => setInput('Create a file and write some content to it')}>
                📄 Create and write to a file
              </button>
              <button className="example-btn" onClick={() => setInput('Simulate a process that forks into child processes')}>
                🔀 Fork processes
              </button>
              <button className="example-btn" onClick={() => setInput('Allocate memory and manage it')}>
                🧠 Memory management
              </button>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚙️'}
            </div>
            <div className="message-content">
              <div className="message-role">{msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI' : 'System'}</div>
              <div className="message-text">{msg.content}</div>
              <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="chat-message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-role">AI</div>
              <div className="message-text">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task (e.g., 'Create a new process and allocate memory for it')..."
          className="chat-input"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={!input.trim() || isProcessing}
        >
          {isProcessing ? <Icon name="hourglass" size={18} /> : <Icon name="play" size={18} />}
        </button>
      </form>
    </div>
  )
}

