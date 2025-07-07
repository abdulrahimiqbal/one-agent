import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { physicsAgent } from '@/lib/physics-agent'
import { z } from 'zod'

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = ChatRequestSchema.parse(body)

    console.log(`💬 Processing chat message: ${message.substring(0, 100)}...`)

    // Create or get session
    let session
    if (sessionId) {
      session = await prisma.researchSession.findUnique({
        where: { id: sessionId }
      })
    }

    if (!session) {
      // Create new session
      session = await prisma.researchSession.create({
        data: {
          title: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          status: 'active',
        }
      })
      console.log(`📝 Created new session: ${session.id}`)
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        content: message,
        type: 'user',
      }
    })

    // Process with physics agent
    const agentResponse = await physicsAgent.processQuestion(message, session.id)

    // Save agent response
    const agentMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        content: agentResponse.response,
        type: 'agent',
      }
    })

    // Save results if we have equations or concepts
    if (agentResponse.equations.length > 0 || agentResponse.concepts.length > 0) {
      await prisma.researchResult.create({
        data: {
          sessionId: session.id,
          type: 'text',
          title: 'Physics Analysis',
          content: agentResponse.reasoning,
          metadata: {
            equations: agentResponse.equations,
            concepts: agentResponse.concepts,
            originalQuestion: message,
          }
        }
      })
    }

    // Generate follow-up questions
    const followUpQuestions = await physicsAgent.generateFollowUpQuestions(message, agentResponse.response)

    console.log(`✅ Chat processed successfully for session ${session.id}`)

    return NextResponse.json({
      sessionId: session.id,
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        type: userMessage.type,
        timestamp: userMessage.timestamp,
      },
      agentMessage: {
        id: agentMessage.id,
        content: agentMessage.content,
        type: agentMessage.type,
        timestamp: agentMessage.timestamp,
      },
      analysis: {
        equations: agentResponse.equations,
        concepts: agentResponse.concepts,
        reasoning: agentResponse.reasoning,
      },
      followUpQuestions,
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
      }
    })

  } catch (error) {
    console.error('❌ Error processing chat:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
} 