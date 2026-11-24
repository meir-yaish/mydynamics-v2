import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { recalcInstallationSchedule } from '@/lib/schedule/recalcInstallation'

export const maxDuration = 60

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {}
  })
  return NextResponse.json({
    emailFrom: settings.emailFrom,
    weeklyReportDay: settings.weeklyReportDay,
    weeklyReportTime: settings.weeklyReportTime,
    ramadanHalfDays: settings.ramadanHalfDays,
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const safeData: Record<string, unknown> = {}
  if (typeof data.emailFrom === 'string') safeData.emailFrom = data.emailFrom
  if (typeof data.weeklyReportDay === 'number') safeData.weeklyReportDay = data.weeklyReportDay
  if (typeof data.weeklyReportTime === 'string') safeData.weeklyReportTime = data.weeklyReportTime

  let recalculated = 0
  const ramadan: unknown = data.ramadanHalfDays
  if (typeof ramadan === 'boolean') {
    const current = await prisma.settings.upsert({ where: { id: 'singleton' }, create: { id: 'singleton' }, update: {} })
    if (current.ramadanHalfDays !== ramadan) {
      const role = (session.user as { role?: string }).role
      if (role !== 'ADMIN' && role !== 'MANAGER') {
        return NextResponse.json({ error: 'אין הרשאה לשנות הגדרת ימי רמדאן' }, { status: 403 })
      }
      await prisma.settings.update({ where: { id: 'singleton' }, data: { ramadanHalfDays: ramadan } })
      try {
        recalculated = await recalcInstallationSchedule(ramadan)
      } catch (err) {
        await prisma.settings.update({ where: { id: 'singleton' }, data: { ramadanHalfDays: current.ramadanHalfDays } })
        const message = err instanceof Error ? err.message : 'שגיאה בחישוב מחדש של הלוז'
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }
  }

  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...safeData },
    update: safeData
  })
  return NextResponse.json({ ...settings, recalculated })
}
