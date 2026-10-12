import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const baseline = await prisma.baseline.findUnique({
    where: { id },
    include: { tasks: true },
  })
  if (!baseline) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(baseline)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.baseline.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
