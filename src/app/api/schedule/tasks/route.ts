import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

function taskGroupOrder(name: string, phase: string): number {
  if (phase === 'שלד' || name.includes('שלד אלומיניום')) return 10
  if (name.startsWith('גמר סיליקון')) return 30
  if (phase === 'הרכבה ק.מ חולף') return 20
  return 0
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  const tasks = await prisma.task.findMany({
    where: projectId ? { projectId } : {},
    orderBy: [{ startDate: 'asc' }, { order: 'asc' }],
    include: { changes: { orderBy: { changedAt: 'desc' }, take: 5 } }
  })
  tasks.sort((a, b) => {
    const ga = taskGroupOrder(a.name, a.phase)
    const gb = taskGroupOrder(b.name, b.phase)
    if (ga !== gb) return ga - gb
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  if (data.startDate && typeof data.startDate === 'string') data.startDate = new Date(data.startDate)
  if (data.endDate && typeof data.endDate === 'string') data.endDate = new Date(data.endDate)
  const task = await prisma.task.create({ data })
  return NextResponse.json(task)
}
