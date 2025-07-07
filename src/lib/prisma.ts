import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is available
const isDatabaseAvailable = !!process.env.DATABASE_URL

// Safe Prisma client initialization
function createPrismaClient() {
  if (!isDatabaseAvailable) {
    console.log('⚠️ DATABASE_URL not found, database operations will use fallback')
    return null
  }
  
  try {
    return new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error)
    return null
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

// Helper function to handle database connection with retry logic
export async function connectToDatabase() {
  if (!prisma) {
    throw new Error('Database not available - no DATABASE_URL configured')
  }
  
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// Helper function to disconnect from database
export async function disconnectFromDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected')
  }
}

// Health check function
export async function checkDatabaseHealth() {
  if (!prisma) {
    return { 
      status: 'unavailable', 
      error: 'DATABASE_URL not configured', 
      timestamp: new Date() 
    }
  }
  
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error', 
      timestamp: new Date() 
    }
  }
}

// Helper function to check if database is available
export function isDatabaseConfigured() {
  return isDatabaseAvailable && prisma !== null
} 