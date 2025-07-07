import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { prisma } from './prisma'

export interface SocketData {
  sessionId?: string
  userId?: string
}

export interface ServerToClientEvents {
  'message:new': (data: { id: string; content: string; type: string; timestamp: Date }) => void
  'progress:update': (data: { id: string; step: string; status: string; progress: number; timestamp: Date }) => void
  'session:update': (data: { id: string; status: string; timestamp: Date }) => void
  'error': (data: { message: string; code?: string }) => void
}

export interface ClientToServerEvents {
  'session:join': (sessionId: string) => void
  'session:leave': (sessionId: string) => void
  'message:send': (data: { sessionId: string; content: string; type: string }) => void
  'progress:subscribe': (sessionId: string) => void
  'progress:unsubscribe': (sessionId: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Handle session joining
    socket.on('session:join', async (sessionId: string) => {
      try {
        // Verify session exists
        const session = await prisma.researchSession.findUnique({
          where: { id: sessionId },
        })

        if (!session) {
          socket.emit('error', { message: 'Session not found', code: 'SESSION_NOT_FOUND' })
          return
        }

        // Join session room
        socket.join(`session:${sessionId}`)
        socket.data.sessionId = sessionId

        console.log(`📍 Client ${socket.id} joined session ${sessionId}`)
      } catch (error) {
        console.error('Error joining session:', error)
        socket.emit('error', { message: 'Failed to join session', code: 'JOIN_ERROR' })
      }
    })

    // Handle session leaving
    socket.on('session:leave', (sessionId: string) => {
      socket.leave(`session:${sessionId}`)
      socket.data.sessionId = undefined
      console.log(`📍 Client ${socket.id} left session ${sessionId}`)
    })

    // Handle message sending
    socket.on('message:send', async (data) => {
      try {
        const { sessionId, content, type } = data

        // Verify session exists and user is in session room
        if (!socket.rooms.has(`session:${sessionId}`)) {
          socket.emit('error', { message: 'Not authorized for this session', code: 'UNAUTHORIZED' })
          return
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            sessionId,
            content,
            type,
          },
        })

        // Broadcast to all clients in session room
        io.to(`session:${sessionId}`).emit('message:new', {
          id: message.id,
          content: message.content,
          type: message.type,
          timestamp: message.timestamp,
        })

        console.log(`💬 Message sent in session ${sessionId}: ${content.substring(0, 50)}...`)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message', code: 'MESSAGE_ERROR' })
      }
    })

    // Handle progress subscription
    socket.on('progress:subscribe', (sessionId: string) => {
      socket.join(`progress:${sessionId}`)
      console.log(`📊 Client ${socket.id} subscribed to progress for session ${sessionId}`)
    })

    // Handle progress unsubscription
    socket.on('progress:unsubscribe', (sessionId: string) => {
      socket.leave(`progress:${sessionId}`)
      console.log(`📊 Client ${socket.id} unsubscribed from progress for session ${sessionId}`)
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`)
    })
  })

  return io
}

// Helper functions to emit events from API routes
export const emitProgressUpdate = (sessionId: string, data: {
  id: string
  step: string
  status: string
  progress: number
  timestamp: Date
}) => {
  if (io) {
    io.to(`progress:${sessionId}`).emit('progress:update', data)
  }
}

export const emitSessionUpdate = (sessionId: string, data: {
  id: string
  status: string
  timestamp: Date
}) => {
  if (io) {
    io.to(`session:${sessionId}`).emit('session:update', data)
  }
}

export const emitNewMessage = (sessionId: string, data: {
  id: string
  content: string
  type: string
  timestamp: Date
}) => {
  if (io) {
    io.to(`session:${sessionId}`).emit('message:new', data)
  }
}

export { io } 