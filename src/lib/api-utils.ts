import { NextResponse } from 'next/server'
import { auth } from './auth'
import { rateLimit } from './rate-limit'
import type { Role } from '@/generated/prisma/client'
import { can } from './rbac'
import type { ZodSchema } from 'zod'

type Action = Parameters<typeof can>[1]

export async function protectedRoute<T>(
  req: Request,
  opts: {
    action: Action
    schema?: ZodSchema<T>
    rateLimitKey?: string
  },
) {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (!can(session.user.role as Role, opts.action)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  if (opts.rateLimitKey) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { ok } = rateLimit(`${opts.rateLimitKey}:${ip}`)
    if (!ok) {
      return {
        error: NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 },
        ),
      }
    }
  }

  let data: T | undefined
  if (opts.schema) {
    const body = await req.json()
    const parsed = opts.schema.safeParse(body)
    if (!parsed.success) {
      return {
        error: NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 },
        ),
      }
    }
    data = parsed.data
  }

  return { session, data }
}
