'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { ResearchSession, Message } from '@/types/research'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface ChatInterfaceProps {
  session: ResearchSession | null
  onSendMessage: (message: string) => void
  isAgentThinking: boolean
}

export default function ChatInterface({ session, onSendMessage, isAgentThinking }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isAgentThinking) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="h-5 w-5 text-physics-blue" />
          Physics Chat
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ask me anything about physics research
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!session?.messages.length ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Welcome to Physics Research Agent!</p>
            <p className="text-sm mt-2">
              I'm here to help you explore physics concepts, solve problems, and conduct research.
              Ask me anything about quantum mechanics, relativity, thermodynamics, or any other physics topic.
            </p>
          </div>
        ) : (
          session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'agent' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-physics-blue rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-physics-blue text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    className={message.type === 'user' ? 'text-white' : 'text-gray-800'}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {isAgentThinking && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-physics-blue rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="thinking-dots flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about physics concepts, equations, or research topics..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-physics-blue focus:border-transparent"
            rows={2}
            disabled={isAgentThinking}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isAgentThinking}
            className="bg-physics-blue text-white px-4 py-2 rounded-lg hover:bg-physics-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 