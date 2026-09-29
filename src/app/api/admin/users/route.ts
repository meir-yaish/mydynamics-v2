import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
  role: z.enum(['ADMIN', 'MANAGER', 'SITE_MANAGER', 'WORKER', 'VIEWER']),
})

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const { email, name, password, role } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json(
      { error: 'אימייל כבר קיים במערכת' },
      { status: 409 },
    )
  }

  const passwordHash = await hash(password, 12)
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
