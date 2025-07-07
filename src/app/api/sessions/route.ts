import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateSessionSchema, PaginationSchema } from '@/lib/validations'


// GET /api/sessions - List all sessions with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit } = PaginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
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

    const session = await prisma.researchSession.create({
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