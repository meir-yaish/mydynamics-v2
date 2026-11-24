import { prisma } from '@/lib/db'
import { computeInstallationSchedule, isInstallationName, dayKey } from './installationEngine'

// הצהרה אחת אטומית (פרמטרית) — 176 עדכונים נפרדים מול Neon לקחו ~40 שניות
export async function applyScheduleChanges(changes: { id: string; startDate: Date; endDate: Date }[]): Promise<void> {
  if (changes.length === 0) return
  const ids = changes.map(c => c.id)
  const starts = changes.map(c => c.startDate.toISOString())
  const ends = changes.map(c => c.endDate.toISOString())
  await prisma.$executeRaw`
    UPDATE "Task" AS t
    SET "startDate" = v.s, "endDate" = v.e, version = t.version + 1, "updatedAt" = NOW()
    FROM (SELECT unnest(${ids}::text[]) AS id, unnest(${starts}::timestamp[]) AS s, unnest(${ends}::timestamp[]) AS e) AS v
    WHERE t.id = v.id`
}

export async function recalcInstallationSchedule(ramadan: boolean): Promise<number> {
  const candidates = await prisma.task.findMany({
    where: {
      OR: [
        { name: { startsWith: 'A-' } },
        { name: { startsWith: 'G-' } },
        { name: { startsWith: 'B-' } },
        { name: { contains: 'סיליקון S-' } },
      ],
    },
    select: { id: true, name: true, startDate: true, endDate: true, dependencies: true, notes: true, quantity: true, floors: true },
  })
  const tasks = candidates.filter(t => isInstallationName(t.name))
  const { results, hasCycle } = computeInstallationSchedule(tasks, ramadan)
  if (hasCycle) throw new Error('זוהתה תלות מעגלית בפעילויות ההתקנה')

  const changes = tasks.flatMap(t => {
    const r = results.get(t.id)
    if (!r) return []
    if (dayKey(t.startDate) === dayKey(r.startDate) && dayKey(t.endDate) === dayKey(r.endDate)) return []
    return [{ id: t.id, startDate: r.startDate, endDate: r.endDate }]
  })
  await applyScheduleChanges(changes)
  return changes.length
}
