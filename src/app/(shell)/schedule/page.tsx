'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import TaskTable from '@/components/schedule/TaskTable'
import MilestoneStatus from '@/components/schedule/MilestoneStatus'
import FinanceNav from '@/components/schedule/FinanceNav'

const GanttChart = dynamic(() => import('@/components/schedule/GanttChart'), { ssr: false })

interface Task {
  id: string; name: string; phase: string; responsible: string
  startDate: string; endDate: string; progress: number; color: string
  notes?: string | null; order: number
  changes?: { field: string; oldValue: string | null; newValue: string | null; changedBy: string | null; changedAt: string }[]
  stage?: string | null; subStage?: string | null
  building?: string | null; facade?: string | null
  floors?: string | null; scaffoldingNum?: string | null
  cost?: number | null; quantity?: number | null
  dependencies?: string | null
  wbsStage?: string | null
  sdPhase?: string | null
  excludeCascadeIds?: string[]
}
interface Milestone { id: string; name: string; date: string; status: string; notes?: string | null }

type FilterKey = string

const KNOWN_CONSTRUCTION_PHASES = ['תיכנון', 'הוראות ייצור', 'שרשרת ספקה', 'שלד', 'קומת קרקע', 'בקרת איכות', 'הרכבה ק.מ חולף', 'הרכבה בולנוז', 'מעקות', 'דלתות קרקע', 'תוספת מרפסות']
const DYNAMIC_FILTER_PALETTE = ['#4472C4', '#70AD47', '#ED7D31', '#7030A0', '#1F78C1', '#843C0C', '#C00000', '#2E75B6', '#808080', '#2E7D32']
const FILTERS: { key: FilterKey; label: string; color: string }[] = [
  { key: 'all',         label: 'הכל',                 color: '#1F3864' },
  { key: 'תיכנון',      label: 'תיכנון',              color: '#4472C4' },
  { key: 'רכש',        label: 'רכש, ייצור והזמנות',   color: '#70AD47' },
  { key: 'התקנה',      label: 'התקנה',                color: '#1F78C1' },
  { key: 'קיר_מסך',    label: 'קיר מסך',              color: '#2E75B6' },
  { key: 'קרקע',       label: 'קומת קרקע',            color: '#7030A0' },
  { key: 'מעקות',      label: 'מעקות',                color: '#843C0C' },
  { key: 'בולנוזים',   label: 'בולנוזים',             color: '#ED7D31' },
  { key: 'דלתות',      label: 'דלתות/מילוט',          color: '#7030A0' },
  { key: 'נתיב_קריטי', label: '⚡ נתיב קריטי',        color: '#C00000' },
]

const CRITICAL_GATE_PHASES = ['תיכנון', 'הוראות ייצור', 'מעקות', 'קומת קרקע', 'בקרת איכות', 'תוספת מרפסות']
const CRITICAL_REPETITIVE_PHASES = ['שלד', 'הרכבה ק.מ חולף', 'הרכבה בולנוז', 'דלתות קרקע']

function applyFilter(tasks: Task[], filter: FilterKey): Task[] {
  switch (filter) {
    case 'all': return tasks
    case 'תיכנון': return tasks.filter(t => ['תיכנון', 'הוראות ייצור'].includes(t.phase))
    case 'רכש': return tasks.filter(t => t.phase === 'שרשרת ספקה')
    case 'התקנה': return tasks.filter(t => ['הרכבה ק.מ חולף', 'הרכבה בולנוז', 'מעקות', 'קומת קרקע', 'שלד', 'בקרת איכות', 'דלתות קרקע', 'תוספת מרפסות'].includes(t.phase))
    case 'קיר_מסך': return tasks.filter(t => t.phase === 'הרכבה ק.מ חולף')
    case 'קרקע': return tasks.filter(t => t.phase === 'קומת קרקע')
    case 'מעקות': return tasks.filter(t => t.phase === 'מעקות')
    case 'בולנוזים': return tasks.filter(t => t.phase === 'הרכבה בולנוז')
    case 'דלתות': return tasks.filter(t => ['דלתות קרקע', 'תוספת מרפסות'].includes(t.phase))
    case 'נתיב_קריטי': {
      const gate = tasks.filter(t => CRITICAL_GATE_PHASES.includes(t.phase))
      const supply = tasks.filter(t => t.phase === 'שרשרת ספקה' && (t.name.includes('שילוח') || t.name.includes('הזמנת')))
      const collapsed: Task[] = []
      for (const phase of CRITICAL_REPETITIVE_PHASES) {
        const group = tasks.filter(t => t.phase === phase)
        if (!group.length) continue
        const first = group.reduce((a, b) => new Date(a.startDate) <= new Date(b.startDate) ? a : b)
        const last  = group.reduce((a, b) => new Date(a.endDate)   >= new Date(b.endDate)   ? a : b)
        collapsed.push(first)
        if (last.id !== first.id) collapsed.push(last)
      }
      return [...gate, ...supply, ...collapsed]
    }
    default: return tasks
  }
}

function getCriticalTasksForFilter(tasks: Task[], filter: FilterKey): Task[] {
  if (filter === 'נתיב_קריטי') return applyFilter(tasks, filter)
  const scoped = filter === 'all' ? tasks : applyFilter(tasks, filter)
  const byPhase = new Map<string, Task[]>()
  for (const t of scoped) {
    if (!byPhase.has(t.phase)) byPhase.set(t.phase, [])
    byPhase.get(t.phase)!.push(t)
  }
  const result: Task[] = []
  for (const [phase, group] of byPhase) {
    if (phase === 'שרשרת ספקה') {
      result.push(...group.filter(t => t.name.includes('שילוח') || t.name.includes('הזמנת')))
    } else if (CRITICAL_REPETITIVE_PHASES.includes(phase)) {
      const first = group.reduce((a, b) => new Date(a.startDate) <= new Date(b.startDate) ? a : b)
      const last  = group.reduce((a, b) => new Date(a.endDate)   >= new Date(b.endDate)   ? a : b)
      result.push(first)
      if (last.id !== first.id) result.push(last)
    } else {
      result.push(...group)
    }
  }
  return result
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const [view, setView]                   = useState<'gantt' | 'table' | 'milestones'>('gantt')
  const [activeFilter, setActiveFilter]   = useState<FilterKey>('all')
  const [tasks, setTasks]                 = useState<Task[]>([])
  const [milestones, setMilestones]       = useState<Milestone[]>([])
  const [projectId, setProjectId]         = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const [pendingChanges, setPendingChanges] = useState<{ taskName: string; field: string; oldValue: string; newValue: string; changedBy: string }[]>([])
  const [lastSaved, setLastSaved]         = useState<string | null>(null)
  const [undoStack, setUndoStack]         = useState<{ id: string; snapshot: Partial<Task> }[]>([])
  const [searchQuery, setSearchQuery]     = useState('')
  const [showAddTask, setShowAddTask]     = useState(false)
  const [newTask, setNewTask]             = useState({ name: '', phase: '', responsible: '', startDate: '', endDate: '' })
  const [projects, setProjects]           = useState<{ id: string; name: string }[]>([])
  const [procurementTaskIds, setProcurementTaskIds] = useState<Set<string>>(new Set())

  const userName = session?.user?.name ?? ''
  const userRole = (session?.user as { role?: string })?.role ?? ''
  const canEdit        = userRole === 'ADMIN' || userRole === 'MANAGER'
  const canViewReports = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'SITE_MANAGER'

  async function loadData(pid: string) {
    const [tasksRes, milestonesRes, procRes] = await Promise.all([
      fetch(`/api/schedule/tasks?projectId=${pid}`),
      fetch(`/api/schedule/milestones?projectId=${pid}`),
      fetch(`/api/schedule/procurement?projectId=${pid}`),
    ])
    if (tasksRes.ok)   setTasks(await tasksRes.json())
    if (milestonesRes.ok) setMilestones(await milestonesRes.json())
    if (procRes.ok) {
      const items: { taskId: string }[] = await procRes.json()
      setProcurementTaskIds(new Set(items.map(i => i.taskId)))
    }
  }

  async function switchProject(pid: string) {
    setProjectId(pid); setActiveFilter('all'); setLoading(true)
    await loadData(pid)
    setLoading(false)
  }

  useEffect(() => {
    if (status !== 'authenticated') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) { setSearchQuery(q); setView('table'); setActiveFilter('all') }

    async function init() {
      try {
        const res = await fetch('/api/schedule/projects')
        if (!res.ok) return
        const allProjects: { id: string; name: string }[] = await res.json()
        setProjects(allProjects)
        if (!allProjects.length) return
        const stored = typeof window !== 'undefined' ? localStorage.getItem('schedule_projectId') : null
        const pid = (stored && allProjects.some(p => p.id === stored)) ? stored : allProjects[0].id
        if (typeof window !== 'undefined') localStorage.setItem('schedule_projectId', pid)
        setProjectId(pid)
        await loadData(pid)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [status])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undoStack]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleUndo() {
    setUndoStack(prev => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]
      fetch(`/api/schedule/tasks/${last.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(last.snapshot)
      }).then(r => r.ok ? r.json() : null).then(json => {
        if (!json) return
        const updated: Task[] = json.updatedTasks ?? [json]
        setTasks(prev => prev.map(t => { const u = updated.find(x => x.id === t.id); return u ? { ...t, ...u } : t }))
        setLastSaved(new Date().toLocaleTimeString('he-IL'))
      })
      return prev.slice(0, -1)
    })
  }

  const handleTaskUpdate = useCallback(async (id: string, data: Partial<Task>) => {
    const original = tasks.find(t => t.id === id)
    if (!original) return
    const snapshot: Partial<Task> = {}
    const originalRaw = original as unknown as Record<string, unknown>
    const dataRaw = data as unknown as Record<string, unknown>
    for (const key of Object.keys(data) as (keyof Task)[]) (snapshot as unknown as Record<string, unknown>)[key] = originalRaw[key]
    setUndoStack(prev => [...prev.slice(-19), { id, snapshot }])
    const fieldLabels: Record<string, string> = { name: 'שם', startDate: 'תאריך התחלה', endDate: 'תאריך סיום', progress: 'התקדמות', responsible: 'אחראי', notes: 'הערות' }
    const changes: typeof pendingChanges = []
    for (const [key, label] of Object.entries(fieldLabels)) {
      if (dataRaw[key] !== undefined && String(originalRaw[key]) !== String(dataRaw[key])) {
        changes.push({ taskName: original.name, field: label, oldValue: String(originalRaw[key] ?? ''), newValue: String(dataRaw[key]), changedBy: userName })
      }
    }
    setPendingChanges(prev => [...prev, ...changes])
    const res = await fetch(`/api/schedule/tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, changedBy: userName })
    })
    if (res.ok) {
      const json = await res.json()
      const updated: Task[] = json.updatedTasks ?? [json]
      setTasks(prev => prev.map(t => { const u = updated.find(x => x.id === t.id); return u ? { ...t, ...u } : t }))
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    }
    setLastSaved(new Date().toLocaleTimeString('he-IL'))
  }, [tasks, userName])

  const handleTaskDelete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    if (!window.confirm(`למחוק את המשימה "${task.name}"?\nהפעולה בלתי הפיכה.`)) return
    const res = await fetch(`/api/schedule/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) { setTasks(prev => prev.filter(t => t.id !== id)); setLastSaved(new Date().toLocaleTimeString('he-IL')) }
  }, [tasks])

  const handleTaskAdd = useCallback(async (data: { name: string; phase: string; responsible: string; startDate: string; endDate: string }) => {
    if (!projectId) return
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order), 0)
    const samePhaseTask = tasks.find(t => t.phase === data.phase)
    const res = await fetch('/api/schedule/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...data, progress: 0, color: samePhaseTask?.color || '#4472C4', order: maxOrder + 1 }),
    })
    if (res.ok) { const created = await res.json(); setTasks(prev => [...prev, created]); setLastSaved(new Date().toLocaleTimeString('he-IL')) }
    else alert('שמירת המשימה נכשלה — נסה שוב.')
  }, [projectId, tasks])

  const handleMilestoneStatus = useCallback(async (id: string, status: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    await fetch('/api/schedule/milestones', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
  }, [])

  const handleMilestoneUpdate = useCallback(async (id: string, data: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))
    await fetch('/api/schedule/milestones', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) })
  }, [])

  const handleMilestoneAdd = useCallback(async (data: { name: string; date: string; notes?: string }) => {
    if (!projectId) return
    const res = await fetch('/api/schedule/milestones', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, name: data.name, date: data.date, notes: data.notes || null, status: 'green' }),
    })
    if (res.ok) { const created = await res.json(); setMilestones(prev => [...prev, created]) }
  }, [projectId])

  const handleMilestoneDelete = useCallback(async (id: string) => {
    const m = milestones.find(x => x.id === id)
    if (!m || !window.confirm(`למחוק את אבן הדרך "${m.name}"?`)) return
    const res = await fetch('/api/schedule/milestones', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) setMilestones(prev => prev.filter(x => x.id !== id))
  }, [milestones])

  async function sendUpdate() {
    if (!projectId) return
    setSending(true)
    try {
      const res = await fetch('/api/schedule/send-update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, changes: pendingChanges })
      })
      const data = await res.json()
      if (data.success) { setPendingChanges([]); alert(`✅ עדכון נשלח בהצלחה ל-${data.sent} נמענים`) }
      else alert(`שגיאה: ${data.error}`)
    } finally { setSending(false) }
  }

  const visibleTasks = useMemo(() => tasks
    .filter(t => t.phase !== 'עלות מול תקציב')
    .filter(t => !t.phase.startsWith('הכנסות') && !t.phase.startsWith('הוצאות')),
    [tasks])

  const isConstructionProject = visibleTasks.length === 0 || visibleTasks.every(t => KNOWN_CONSTRUCTION_PHASES.includes(t.phase))
  const currentProjectName = projects.find(p => p.id === projectId)?.name ?? ''
  const isLogisticsProject = currentProjectName.includes('לוגיסטיקה')

  const dynamicPhaseFilters = useMemo(() => {
    const seen = new Map<string, number>()
    for (const t of [...visibleTasks].sort((a, b) => a.order - b.order)) if (!seen.has(t.phase)) seen.set(t.phase, t.order)
    return [...seen.keys()].map((phase, i) => ({ key: phase, label: phase, color: DYNAMIC_FILTER_PALETTE[i % DYNAMIC_FILTER_PALETTE.length] }))
  }, [visibleTasks])

  const PROCUREMENT_FILTER_KEY = '__procurement__'
  const OVERDUE_FILTER_KEY = '__overdue__'
  const isTaskOverdue = (t: Task) => new Date(t.endDate) < new Date() && t.progress < 100
  const overdueCount = visibleTasks.filter(isTaskOverdue).length

  const activeFilters: { key: FilterKey; label: string; color: string }[] = [
    ...(isConstructionProject ? FILTERS : [{ key: 'all', label: 'הכל', color: '#1F3864' }, ...dynamicPhaseFilters]),
    { key: PROCUREMENT_FILTER_KEY, label: '🛒 רכש', color: '#B45309' },
    ...(overdueCount > 0 ? [{ key: OVERDUE_FILTER_KEY, label: `⚠️ פג תוקף (${overdueCount})`, color: '#C00000' }] : []),
  ]

  const filteredTasks = (
    activeFilter === PROCUREMENT_FILTER_KEY ? visibleTasks.filter(t => procurementTaskIds.has(t.id))
    : activeFilter === OVERDUE_FILTER_KEY   ? visibleTasks.filter(isTaskOverdue)
    : isConstructionProject ? applyFilter(visibleTasks, activeFilter)
    : activeFilter === 'all' ? visibleTasks : visibleTasks.filter(t => t.phase === activeFilter)
  ).filter(t => {
    const q = searchQuery.trim().toLowerCase()
    return !q || t.name.toLowerCase().includes(q) || (t.wbsStage ?? '').toLowerCase().includes(q) || (t.sdPhase ?? '').toLowerCase().includes(q)
  })

  const criticalTasksForFilter = isConstructionProject && activeFilter !== 'all' ? getCriticalTasksForFilter(visibleTasks, activeFilter) : []

  const taskSerialNumbers = useMemo(() => {
    const allPhases = [...new Set(visibleTasks.map(t => t.phase))]
    const map: Record<string, number> = {}
    let num = 0
    for (const phase of allPhases) for (const task of visibleTasks.filter(t => t.phase === phase)) map[task.id] = ++num
    return map
  }, [visibleTasks])

  if (status === 'loading' || loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#F0F4F8' }}>
      <div className="text-center" dir="rtl">
        <div className="text-4xl mb-4">🏗️</div>
        <div className="text-xl text-gray-600">טוען את לוח הזמנים...</div>
      </div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed', top: 'var(--topbar-height, 56px)', bottom: 0,
      right: 'var(--sidebar-width, 250px)', left: 0,
      display: 'flex', flexDirection: 'column',
      background: '#F0F4F8', direction: 'rtl', fontFamily: 'Arial, sans-serif',
      zIndex: 5, transition: 'right 0.25s ease',
    }}>
      {/* Toolbar */}
      <div style={{ background: '#1a1a1a', flexShrink: 0, padding: '8px 16px' }} className="flex items-center gap-3 flex-wrap">
        {/* Project selector */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs whitespace-nowrap">פרויקט:</span>
            {projects.length > 1 ? (
              <select
                value={projectId ?? ''}
                onChange={e => { localStorage.setItem('schedule_projectId', e.target.value); switchProject(e.target.value) }}
                style={{ background: '#2d2d2d', color: 'white', border: '1px solid #4472C4', borderRadius: 6, padding: '4px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', maxWidth: 260 }}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <span className="text-white text-sm font-semibold">{projects[0]?.name}</span>
            )}
          </div>
        )}

        <div style={{ width: 1, height: 24, background: '#555' }} />

        {/* View tabs */}
        <div className="flex gap-1 bg-gray-800 rounded p-0.5">
          {([['gantt', '📊 גאנט'], ['table', '📋 טבלה'], ['milestones', '📍 אבני דרך']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setView(key)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{ background: view === key ? '#4472C4' : 'transparent', color: view === key ? 'white' : '#aaa' }}>
              {label}
            </button>
          ))}
        </div>

        {canEdit && (
          <button onClick={() => { setNewTask({ name: '', phase: visibleTasks[0]?.phase || '', responsible: '', startDate: '', endDate: '' }); setShowAddTask(true) }}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium hover:opacity-90"
            style={{ background: '#00B050', color: 'white' }}>
            ➕ הוסף משימה
          </button>
        )}

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', right: 8, color: '#888', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="חיפוש..."
            style={{ paddingRight: 28, paddingLeft: searchQuery ? 24 : 8, paddingTop: 5, paddingBottom: 5, border: '1px solid #555', borderRadius: 16, fontSize: 12, fontFamily: 'Arial', direction: 'rtl', background: '#333', color: 'white', width: 150 }} />
          {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', left: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14, lineHeight: 1 }}>×</button>}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right-side actions */}
        {lastSaved && <span className="text-blue-300 text-xs">נשמר: {lastSaved}</span>}
        {canEdit && undoStack.length > 0 && (
          <button onClick={handleUndo} title="בטל (Ctrl+Z)"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{ background: '#4a3500', color: '#FFD700', border: '1px solid #FFD700' }}>↩ בטל</button>
        )}
        {pendingChanges.length > 0 && (
          <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">{pendingChanges.length} שינויים</span>
        )}
        <button onClick={sendUpdate} disabled={sending}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: sending ? '#555' : '#00B050', color: 'white' }}>
          {sending ? '⏳ שולח...' : '📧 עדכן ושלח'}
        </button>
        {canViewReports && !isLogisticsProject && <FinanceNav />}
        {isLogisticsProject && (
          <Link href="/schedule/procurement" className="flex items-center gap-1 px-3 py-1.5 rounded text-xs" style={{ background: '#B45309', color: 'white' }}>🛒 רכש</Link>
        )}
        <Link href="/schedule/settings" className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 text-white rounded text-xs hover:bg-blue-600">⚙️ הגדרות</Link>
      </div>

      {/* Filters row */}
      <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexShrink: 0, padding: '6px 16px' }} className="flex gap-1 flex-wrap items-center">
        {activeFilters.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: activeFilter === f.key ? 700 : 400, background: activeFilter === f.key ? f.color : 'white', color: activeFilter === f.key ? 'white' : '#444', border: `1.5px solid ${activeFilter === f.key ? f.color : '#d1d5db'}`, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
            {f.label}
            {activeFilter === f.key && visibleTasks.length > 0 && <span style={{ marginRight: 4, fontSize: 10, opacity: 0.85 }}>({filteredTasks.length})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 px-4 pb-2 pt-3" style={{ display: 'flex', flexDirection: 'column' }}>
        {view === 'gantt' && <GanttChart tasks={filteredTasks} onTaskUpdate={handleTaskUpdate} onTaskDelete={handleTaskDelete} taskSerialNumbers={taskSerialNumbers} canEdit={canEdit} procurementOnly={activeFilter === PROCUREMENT_FILTER_KEY} projectId={projectId} />}
        {view === 'table' && <TaskTable tasks={filteredTasks} onTaskUpdate={handleTaskUpdate} onTaskDelete={handleTaskDelete} canEdit={canEdit} />}
        {view === 'milestones' && <MilestoneStatus milestones={milestones} onStatusChange={handleMilestoneStatus} onUpdate={handleMilestoneUpdate} onAdd={handleMilestoneAdd} onDelete={handleMilestoneDelete} tasks={visibleTasks} canEdit={canEdit} criticalTasks={criticalTasksForFilter} criticalFilterLabel={activeFilters.find(f => f.key === activeFilter)?.label ?? 'הכל'} onTaskUpdate={handleTaskUpdate} onTaskDelete={handleTaskDelete} />}
      </div>

      {/* Add task modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowAddTask(false)}>
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-2xl" dir="rtl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#1F3864] mb-4">הוספת משימה חדשה</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם משימה</label>
                <input className="w-full border rounded px-3 py-2" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שלב</label>
                <input className="w-full border rounded px-3 py-2" list="phase-options" value={newTask.phase} onChange={e => setNewTask({ ...newTask, phase: e.target.value })} placeholder="בחר שלב קיים או הקלד חדש" />
                <datalist id="phase-options">
                  {[...new Set(visibleTasks.map(t => t.phase))].map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך התחלה</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={newTask.startDate} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סיום</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={newTask.endDate} onChange={e => setNewTask({ ...newTask, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אחראי</label>
                <input className="w-full border rounded px-3 py-2" value={newTask.responsible} onChange={e => setNewTask({ ...newTask, responsible: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowAddTask(false)}>ביטול</button>
              <button className="px-4 py-2 bg-[#1F3864] text-white rounded hover:bg-blue-800 disabled:opacity-50"
                disabled={!newTask.name.trim() || !newTask.phase.trim() || !newTask.startDate || !newTask.endDate}
                onClick={async () => { await handleTaskAdd(newTask); setShowAddTask(false) }}>
                הוסף
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
