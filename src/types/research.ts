export interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

export interface ProgressStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp: Date
  details?: string
}

export interface ResearchResult {
  id: string
  type: 'equation' | 'graph' | 'text' | 'citation' | 'calculation'
  title: string
  content: string
  metadata?: Record<string, any>
  timestamp: Date
}

export interface ResearchSession {
  id: string
  title: string
  messages: Message[]
  progress: ProgressStep[]
  results: ResearchResult[]
  createdAt: Date
  updatedAt?: Date
  status: 'active' | 'completed' | 'paused' | 'failed'
}

export interface AgentState {
  isThinking: boolean
  currentStep?: string
  confidence?: number
  lastAction?: string
} 