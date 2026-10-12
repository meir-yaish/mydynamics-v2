import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  const milestones = await prisma.milestone.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { date: 'asc' }
  })

  const projectEnd = milestones.find(m => m.name === 'סיום פרויקט')
  if (projectEnd) {
    const lastTask = await prisma.task.findFirst({
      where: projectId ? { projectId } : {},
      orderBy: { endDate: 'desc' }
    })
    if (lastTask) projectEnd.date = lastTask.endDate
  }

  return NextResponse.json(milestones.sort((a, b) => a.date.getTime() - b.date.getTime()))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  if (data.date && typeof data.date === 'string') data.date = new Date(data.date)
  const milestone = await prisma.milestone.create({ data })
  return NextResponse.json(milestone)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...rawData } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (rawData.date && typeof rawData.date === 'string') rawData.date = new Date(rawData.date)
  const milestone = await prisma.milestone.update({ where: { id }, data: rawData })
  return NextResponse.json(milestone)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.milestone.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
