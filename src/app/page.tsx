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

    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage]
      })
    }

    // Simulate agent response
    setTimeout(() => {
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent' as const,
        content: 'I\'m analyzing your physics question. Let me think about this systematically...',
        timestamp: new Date()
      }

      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, agentMessage]
        } : null)
      }
      
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
          <p className="text-sm text-gray-500 mt-4">
            🚀 Successfully deployed! Advanced features coming soon...
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🤖 Physics Chat
            </h2>
            <p className="text-gray-600">
              Interactive chat interface for physics research discussions.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">
                Chat functionality will be enabled in the next update.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🧠 Agent Progress
            </h2>
            <p className="text-gray-600">
              Real-time tracking of the agent's thinking process.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">
                Progress tracking will be enabled in the next update.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📄 Research Results
            </h2>
            <p className="text-gray-600">
              Generated equations, calculations, and research findings.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">
                Results display will be enabled in the next update.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </footer>
      </div>
    </main>
  )
} 