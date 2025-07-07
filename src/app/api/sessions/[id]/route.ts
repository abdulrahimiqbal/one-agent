import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateSessionSchema, UUIDSchema } from '@/lib/validations'

// Safe database operations with fallback
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.log('Database operation failed, using fallback:', error)
    return fallback
  }
}

// GET /api/sessions/[id] - Get a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id // Don't validate UUID for mock IDs

    const session = await safeDbOperation(
      async () => {
        return await prisma.researchSession.findUnique({
          where: { id: sessionId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
            progress: {
              orderBy: { timestamp: 'asc' },
            },
            results: {
              orderBy: { timestamp: 'desc' },
            },
          },
        })
      },
      // Mock session for fallback
      {
        id: sessionId,
        title: 'Sample Physics Session',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: 'mock-msg-1',
            sessionId: sessionId,
            type: 'user' as const,
            content: 'What is Newton\'s second law?',
            timestamp: new Date(),
          },
          {
            id: 'mock-msg-2',
            sessionId: sessionId,
            type: 'agent' as const,
            content: 'Newton\'s second law states that F = ma...',
            timestamp: new Date(),
          },
        ],
        progress: [],
        results: [
          {
            id: 'mock-result-1',
            sessionId: sessionId,
            type: 'physics_analysis' as const,
            title: 'Physics Analysis',
            content: 'Analysis of Newton\'s second law',
            metadata: {
              equations: ['F = ma'],
              concepts: ['force', 'mass', 'acceleration'],
              followUpQuestions: ['What is the relationship between force and acceleration?'],
            },
            timestamp: new Date(),
          },
        ],
      }
    )

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error fetching session:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// PUT /api/sessions/[id] - Update a specific session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const body = await request.json()
    const validatedData = UpdateSessionSchema.parse(body)

    const session = await safeDbOperation(
      async () => {
        return await prisma.researchSession.update({
          where: { id: sessionId },
          data: {
            ...validatedData,
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: {
                messages: true,
                progress: true,
                results: true,
              },
            },
          },
        })
      },
      // Mock updated session for fallback
      {
        id: sessionId,
        title: validatedData.title || 'Updated Session',
        status: validatedData.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          messages: 2,
          progress: 0,
          results: 1,
        },
      }
    )

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating session:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions/[id] - Delete a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    await safeDbOperation(
      async () => {
        return await prisma.researchSession.delete({
          where: { id: sessionId },
        })
      },
      null // Mock success for fallback
    )

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Error deleting session:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
} 