import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateProgressSchema, PaginationSchema } from '@/lib/validations'


// GET /api/progress - List progress steps with pagination and optional filtering by sessionId
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

    const [progressSteps, total] = await Promise.all([
      prisma.progressStep.findMany({
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
      prisma.progressStep.count({ where: whereClause }),
    ])

    return NextResponse.json({
      progressSteps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching progress steps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress steps' },
      { status: 500 }
    )
  }
}

// POST /api/progress - Create a new progress step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateProgressSchema.parse(body)

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

    const progressStep = await prisma.progressStep.create({
      data: {
        sessionId: validatedData.sessionId,
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        details: validatedData.details,
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

    return NextResponse.json(progressStep, { status: 201 })
  } catch (error) {
    console.error('Error creating progress step:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create progress step' },
      { status: 500 }
    )
  }
} 