'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import ProgressSection from '@/components/ProgressSection'
import ResultsSection from '@/components/ResultsSection'
import { ResearchSession } from '@/types/research'

export default function Home() {
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null)
  const [isAgentThinking, setIsAgentThinking] = useState(false)

  const handleNewMessage = async (message: string) => {
    setIsAgentThinking(true)
    
    // Create new session if none exists
    if (!currentSession) {
      const newSession: ResearchSession = {
        id: Date.now().toString(),
        title: message.slice(0, 50) + '...',
        messages: [],
        progress: [],
        results: [],
        createdAt: new Date(),
        status: 'active'
      }
      setCurrentSession(newSession)
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    }

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    // TODO: Send to agent via WebSocket
    // For now, simulate agent response
    setTimeout(() => {
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent' as const,
        content: 'I\'m analyzing your physics question. Let me think about this systematically...',
        timestamp: new Date()
      }

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, agentMessage]
      } : null)
      
      setIsAgentThinking(false)
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Physics Research Agent
          </h1>
          <p className="text-lg text-gray-600">
            Autonomous physics research that pushes the boundaries of scientific knowledge
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <ChatInterface
              session={currentSession}
              onSendMessage={handleNewMessage}
              isAgentThinking={isAgentThinking}
            />
          </div>

          {/* Progress Section */}
          <div className="lg:col-span-1">
            <ProgressSection
              session={currentSession}
              isAgentThinking={isAgentThinking}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <ResultsSection
              session={currentSession}
            />
          </div>
        </div>
      </div>
    </main>
  )
} 