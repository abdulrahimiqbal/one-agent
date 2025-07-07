'use client'

import React, { useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsProcessing(true)
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setMessage('')
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
          <div className="mt-4 inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ Successfully Deployed on Vercel!
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              Physics Chat
            </h2>
            <p className="text-gray-600 mb-4">
              Interactive chat interface for physics research discussions.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a physics question..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing || !message.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Send Message'}
              </button>
            </form>
            
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-600">Agent is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🧠</span>
              Agent Progress
            </h2>
            <p className="text-gray-600 mb-4">
              Real-time tracking of the agent's thinking process.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">System initialized</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-50">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-500">Awaiting user input</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-50">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-500">Analysis pending</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📄</span>
              Research Results
            </h2>
            <p className="text-gray-600 mb-4">
              Generated equations, calculations, and research findings.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Sample Equation</h3>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  E = mc²
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Research Notes</h3>
                <div className="bg-white p-3 rounded border text-sm text-gray-600">
                  Results will appear here after agent processing...
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🚀 Next Phase Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Phase 2:</strong> WebSocket real-time communication
              </div>
              <div>
                <strong>Phase 3:</strong> LangChain AI agent integration
              </div>
              <div>
                <strong>Phase 4:</strong> Advanced physics calculations
              </div>
              <div>
                <strong>Phase 5:</strong> Research paper generation
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Built with Next.js 14, TypeScript, and Tailwind CSS • Deployed on Vercel
          </p>
        </footer>
      </div>
    </main>
  )
} 