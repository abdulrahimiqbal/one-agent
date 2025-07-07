import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/prisma'

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        api: {
          status: 'healthy',
          timestamp: new Date(),
        },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    }

    const statusCode = dbHealth.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
          api: {
            status: 'healthy',
            timestamp: new Date(),
          },
        },
      },
      { status: 503 }
    )
  }
} 