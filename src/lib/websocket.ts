import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export interface SocketData {
  sessionId?: string
  userId?: string
}

export interface ClientToServerEvents {
  'join-session': (sessionId: string) => void
  'send-message': (data: { sessionId: string; message: string }) => void
  'disconnect-session': (sessionId: string) => void
}

export interface ServerToClientEvents {
  'session-joined': (sessionId: string) => void
  'message-received': (data: { messageId: string; content: string; type: 'user' | 'agent' }) => void
  'progress-update': (data: { stepId: string; title: string; description: string; status: string }) => void
  'result-generated': (data: { resultId: string; type: string; title: string; content: string }) => void
  'agent-thinking': (isThinking: boolean) => void
  'error': (error: string) => void
}

export type SocketIOServerType = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>

export const initializeSocket = (server: HTTPServer): SocketIOServerType => {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.vercel.app'] 
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-session', (sessionId) => {
      socket.data.sessionId = sessionId
      socket.join(sessionId)
      socket.emit('session-joined', sessionId)
      console.log(`Client ${socket.id} joined session ${sessionId}`)
    })

    socket.on('send-message', async (data) => {
      try {
        // Emit to all clients in the session
        io.to(data.sessionId).emit('message-received', {
          messageId: Date.now().toString(),
          content: data.message,
          type: 'user'
        })

        // Indicate agent is thinking
        io.to(data.sessionId).emit('agent-thinking', true)

        // TODO: Process with LangChain agent
        // For now, simulate processing
        setTimeout(() => {
          io.to(data.sessionId).emit('message-received', {
            messageId: (Date.now() + 1).toString(),
            content: 'I\'m analyzing your physics question...',
            type: 'agent'
          })
          
          io.to(data.sessionId).emit('agent-thinking', false)
        }, 2000)

      } catch (error) {
        console.error('Error processing message:', error)
        socket.emit('error', 'Failed to process message')
      }
    })

    socket.on('disconnect-session', (sessionId) => {
      socket.leave(sessionId)
      console.log(`Client ${socket.id} left session ${sessionId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
} 