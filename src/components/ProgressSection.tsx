'use client'

import { Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { ResearchSession, ProgressStep } from '@/types/research'

interface ProgressSectionProps {
  session: ResearchSession | null
  isAgentThinking: boolean
}

export default function ProgressSection({ session, isAgentThinking }: ProgressSectionProps) {
  const getStatusIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in_progress':
        return 'bg-blue-50 border-blue-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="h-5 w-5 text-physics-purple" />
          Agent Progress
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Watch how the agent thinks and processes your request
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!session?.progress.length && !isAgentThinking ? (
          <div className="text-center text-gray-500 mt-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No active research</p>
            <p className="text-sm mt-2">
              Start a conversation to see the agent's thinking process
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {session?.progress.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg p-3 transition-all duration-200 ${getStatusColor(step.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Step {index + 1}
                      </span>
                      <span className="text-xs text-gray-400">
                        {step.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mt-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>
                    {step.details && (
                      <div className="mt-2 text-xs text-gray-500 bg-white bg-opacity-50 rounded p-2">
                        {step.details}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isAgentThinking && (
              <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Current Step
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mt-1">
                      Processing your request...
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      The agent is analyzing your physics question and formulating a response
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {session && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Session: {session.title}
            </span>
            <span className="text-gray-500">
              {session.progress.length} steps
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 