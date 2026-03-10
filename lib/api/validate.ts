import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Middleware de validacao Zod para APIs
 * Retorna erro 400 com detalhes se validacao falhar
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): 
  { success: true; data: T } | { success: false; response: NextResponse } {
  
  const result = schema.safeParse(body)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Dados invalidos',
          details: errors,
        },
        { status: 400 }
      ),
    }
  }
  
  return { success: true, data: result.data }
}

/**
 * Validar query params
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): 
  { success: true; data: T } | { success: false; response: NextResponse } {
  
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return validateBody(schema, params)
}

/**
 * Wrapper para handler de API com validacao automatica
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, request: Request) => Promise<NextResponse>
) {
  return async (request: Request) => {
    try {
      const body = await request.json()
      const validation = validateBody(schema, body)
      
      if (!validation.success) {
        return validation.response
      }
      
      return handler(validation.data, request)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'JSON invalido' },
          { status: 400 }
        )
      }
      throw error
    }
  }
}

// Schemas comuns para APIs
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const idParamSchema = z.object({
  id: z.string().uuid('ID invalido'),
})

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})
