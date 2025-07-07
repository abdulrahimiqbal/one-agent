import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'
import { CreateSessionSchema, PaginationSchema } from '@/lib/validations'

// Safe database operations with fallback
async function safeDbOperation<T>(operation: (prisma: PrismaClient) => Promise<T>, fallback: T): Promise<T> {
  try {
    // Check if prisma is available
    if (!prisma) {
      console.log('Database not available, using fallback')
      return fallback
    }
    return await operation(prisma)
  } catch (error) {
    console.log('Database operation failed, using fallback:', error)
    return fallback
  }
}

// GET /api/sessions - List all sessions with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit } = PaginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    })

    const skip = (page - 1) * limit

    const [sessions, total] = await safeDbOperation(
      async (prisma) => {
        return await Promise.all([
          prisma.researchSession.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              _count: {
                select: {
                  messages: true,
                  progress: true,
                  results: true,
                },
              },
            },
          }),
          prisma.researchSession.count(),
        ])
      },
      [
        // Mock sessions for fallback
        [
          {
            id: 'mock-session-1',
            title: 'Sample Physics Session',
            status: 'active' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: {
              messages: 2,
              progress: 0,
              results: 1,
            },
          },
        ],
        1, // total count
      ]
    )

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateSessionSchema.parse(body)

    const session = await safeDbOperation(
      async (prisma) => {
        return await prisma.researchSession.create({
          data: {
            title: validatedData.title,
            status: 'active',
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
      {
        id: `mock-session-${Date.now()}`,
        title: validatedData.title,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          messages: 0,
          progress: 0,
          results: 0,
        },
      }
    )

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
} 