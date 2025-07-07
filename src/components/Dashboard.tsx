'use client'

import { useState, useEffect } from 'react'

interface Session {
  id: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
  _count: {
    messages: number
    progress: number
    results: number
  }
}

interface SessionsResponse {
  sessions: Session[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/sessions?limit=10')
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data: SessionsResponse = await response.json()
      setSessions(data.sessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
        <h2 className="text-xl font-bold">Research Dashboard</h2>
        <p className="text-purple-100 text-sm">Track your physics research sessions</p>
      </div>

      {/* Stats */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-blue-800">Total Sessions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-green-800">Active Sessions</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.reduce((total, session) => total + session._count.messages, 0)}
            </div>
            <div className="text-sm text-purple-800">Total Messages</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
            <p className="text-sm">Start a conversation with the physics agent to begin!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {session.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💬 {session._count.messages} messages</span>
                      <span>📊 {session._count.progress} progress steps</span>
                      <span>📋 {session._count.results} results</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {formatDate(session.createdAt)} • 
                      Updated: {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 