import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {}
  })
  return NextResponse.json({ emailFrom: settings.emailFrom, weeklyReportDay: settings.weeklyReportDay, weeklyReportTime: settings.weeklyReportTime })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const safeData: Record<string, unknown> = {}
  if (typeof data.emailFrom === 'string') safeData.emailFrom = data.emailFrom
  if (typeof data.weeklyReportDay === 'number') safeData.weeklyReportDay = data.weeklyReportDay
  if (typeof data.weeklyReportTime === 'string') safeData.weeklyReportTime = data.weeklyReportTime
  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...safeData },
    update: safeData
  })
  return NextResponse.json(settings)
}
