import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PhysicsAgent } from '@/lib/physics-agent'
import { CreateSessionSchema, CreateMessageSchema, CreateResultSchema } from '@/lib/validations'

// Initialize physics agent
const physicsAgent = new PhysicsAgent()

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 6,
  initialDelay: 1000, // 1 second
  maxDelay: 60000, // 60 seconds
  backoffMultiplier: 2,
  jitter: true
}

// Exponential backoff with jitter
async function sleep(ms: number, jitter = false): Promise<void> {
  const delay = jitter ? ms * (0.5 + Math.random() * 0.5) : ms
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = RATE_LIMIT_CONFIG.maxRetries,
  delay = RATE_LIMIT_CONFIG.initialDelay
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    // Check if it's a rate limit error
    if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
      if (retries > 0) {
        const nextDelay = Math.min(delay * RATE_LIMIT_CONFIG.backoffMultiplier, RATE_LIMIT_CONFIG.maxDelay)
        console.log(`Rate limit hit, retrying in ${delay}ms. Retries left: ${retries}`)
        await sleep(delay, RATE_LIMIT_CONFIG.jitter)
        return withRetry(fn, retries - 1, nextDelay)
      }
    }
    throw error
  }
}

// Safe database operations with fallback
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.log('Database operation failed, using fallback:', error)
    return fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('💬 Processing chat message:', message.substring(0, 50) + '...')

    // Process physics question with retry logic
    const physicsResponse = await withRetry(async () => {
      console.log('🤖 Processing physics question:', message.substring(0, 50) + '...')
      return await physicsAgent.processQuestion(message)
    })

    // Generate follow-up questions with retry logic
    const followUpQuestions = await withRetry(async () => {
      return await physicsAgent.generateFollowUpQuestions(message, physicsResponse.response)
    }).catch(error => {
      console.warn('Failed to generate follow-up questions:', error)
      return []
    })

    // Try to save to database with fallback
    let currentSessionId = sessionId
    let userMessage = null
    let agentMessage = null
    let results = null

    // Create or get session
    if (!currentSessionId) {
      const newSession = await safeDbOperation(
        async () => {
          return await prisma.researchSession.create({ 
            data: {
              title: message.substring(0, 50) + '...',
              status: 'active'
            }
          })
        },
        { 
          id: `mock-session-${Date.now()}`, 
          title: message.substring(0, 50) + '...', 
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      )
      currentSessionId = newSession.id
    }

    // Save user message
    userMessage = await safeDbOperation(
      async () => {
        return await prisma.message.create({ 
          data: {
            sessionId: currentSessionId,
            type: 'user',
            content: message
          }
        })
      },
      { id: `mock-msg-${Date.now()}`, sessionId: currentSessionId, type: 'user' as const, content: message, timestamp: new Date() }
    )

    // Save agent response
    agentMessage = await safeDbOperation(
      async () => {
        return await prisma.message.create({ 
          data: {
            sessionId: currentSessionId,
            type: 'agent',
            content: physicsResponse.response
          }
        })
      },
      { id: `mock-msg-${Date.now() + 1}`, sessionId: currentSessionId, type: 'agent' as const, content: physicsResponse.response, timestamp: new Date() }
    )

    // Save results if available
    if (physicsResponse.equations.length > 0 || physicsResponse.concepts.length > 0 || followUpQuestions.length > 0) {
      results = await safeDbOperation(
        async () => {
          return await prisma.researchResult.create({ 
            data: {
              sessionId: currentSessionId,
              type: 'physics_analysis',
              title: 'Physics Analysis',
              content: physicsResponse.reasoning,
              metadata: {
                equations: physicsResponse.equations,
                concepts: physicsResponse.concepts,
                followUpQuestions: followUpQuestions
              }
            }
          })
        },
        { 
          id: `mock-result-${Date.now()}`,
          sessionId: currentSessionId,
          type: 'physics_analysis' as const,
          title: 'Physics Analysis',
          content: physicsResponse.reasoning,
          metadata: {
            equations: physicsResponse.equations,
            concepts: physicsResponse.concepts,
            followUpQuestions: followUpQuestions
          },
          timestamp: new Date()
        }
      )
    }

    return NextResponse.json({
      response: physicsResponse.response,
      sessionId: currentSessionId,
      equations: physicsResponse.equations,
      concepts: physicsResponse.concepts,
      followUpQuestions: followUpQuestions,
      userMessage,
      agentMessage,
      results
    })

  } catch (error: any) {
    console.error('❌ Error processing chat:', error)
    
    // Return specific error messages for different types of failures
    if (error?.status === 429 || error?.message?.includes('quota')) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again in a few moments.',
        retryAfter: 60
      }, { status: 429 })
    }

    if (error?.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'OpenAI API configuration error. Please check your API key.',
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'Failed to process message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
} 