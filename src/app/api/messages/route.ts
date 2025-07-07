import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateMessageSchema, PaginationSchema } from '@/lib/validations'


// GET /api/messages - List messages with pagination and optional filtering by sessionId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit } = PaginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    const sessionId = searchParams.get('sessionId')
    const skip = (page - 1) * limit

    const whereClause = sessionId ? { sessionId } : {}

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          session: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.message.count({ where: whereClause }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateMessageSchema.parse(body)

    // Verify session exists
    const session = await prisma.researchSession.findUnique({
      where: { id: validatedData.sessionId },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const message = await prisma.message.create({
      data: {
        sessionId: validatedData.sessionId,
        content: validatedData.content,
        type: validatedData.type,
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
} 