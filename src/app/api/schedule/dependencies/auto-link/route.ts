import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await req.json()
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: [{ phase: 'asc' }, { order: 'asc' }],
  })

  const phaseOrder: Record<string, number> = {}
  let phaseIdx = 0
  for (const t of tasks) {
    if (!(t.phase in phaseOrder)) phaseOrder[t.phase] = phaseIdx++
  }

  const byPhase: Record<string, typeof tasks> = {}
  for (const t of tasks) {
    if (!byPhase[t.phase]) byPhase[t.phase] = []
    byPhase[t.phase].push(t)
  }

  const phases = Object.keys(phaseOrder).sort((a, b) => phaseOrder[a] - phaseOrder[b])
  let updated = 0

  for (let i = 1; i < phases.length; i++) {
    const predecessors = byPhase[phases[i - 1]] ?? []
    const successors   = byPhase[phases[i]] ?? []
    const predIds = predecessors.map(p => p.id)

    for (const succ of successors) {
      let deps: string[] = []
      try { deps = JSON.parse((succ.dependencies as string | null) || '[]') } catch { deps = [] }
      const newDeps = [...new Set([...deps, ...predIds])]
      if (newDeps.length !== deps.length) {
        await prisma.task.update({ where: { id: succ.id }, data: { dependencies: JSON.stringify(newDeps) } })
        updated++
      }
    }
  }

  return NextResponse.json({ updated })
}
