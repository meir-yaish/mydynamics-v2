import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const UPDATABLE_FIELDS = ['name', 'sku', 'quantity', 'unit', 'neededByDate', 'notes', 'status']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const rawData = await req.json()

  const data: Record<string, unknown> = {}
  for (const field of UPDATABLE_FIELDS) {
    if (rawData[field] !== undefined) data[field] = rawData[field]
  }
  if (data.neededByDate && typeof data.neededByDate === 'string') data.neededByDate = new Date(data.neededByDate as string)

  const item = await prisma.procurementItem.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.procurementItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
