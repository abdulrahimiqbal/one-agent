import { z } from 'zod'

// Session validation schemas
export const CreateSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  status: z.enum(['active', 'completed', 'paused', 'failed']).default('active'),
})

export const UpdateSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  status: z.enum(['active', 'completed', 'paused', 'failed']).optional(),
})

// Message validation schemas
export const CreateMessageSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['user', 'agent']),
})

export const UpdateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').optional(),
  type: z.enum(['user', 'agent']).optional(),
})

// Progress validation schemas
export const CreateProgressSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  details: z.string().optional(),
})

export const UpdateProgressSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  details: z.string().optional(),
})

// Result validation schemas (matches ResearchResult model)
export const CreateResultSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['equation', 'graph', 'text', 'citation', 'calculation', 'physics_analysis']),
  metadata: z.record(z.any()).optional(),
})

export const UpdateResultSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  type: z.enum(['equation', 'graph', 'text', 'citation', 'calculation', 'physics_analysis']).optional(),
  metadata: z.record(z.any()).optional(),
})

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export const UUIDSchema = z.string().min(1, 'Invalid ID format')

// Type exports
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>
export type UpdateMessageInput = z.infer<typeof UpdateMessageSchema>
export type CreateProgressInput = z.infer<typeof CreateProgressSchema>
export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>
export type CreateResultInput = z.infer<typeof CreateResultSchema>
export type UpdateResultInput = z.infer<typeof UpdateResultSchema>
export type PaginationInput = z.infer<typeof PaginationSchema> 