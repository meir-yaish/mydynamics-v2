import { nextWorkingDay, lastDayOfWork, workFactor } from './calendar'

export type InstallKind = 'A' | 'G' | 'S' | 'B'

export interface EngineTask {
  id: string
  name: string
  startDate: Date
  endDate: Date
  dependencies: string
  notes: string | null
  quantity: number | null
  floors: string | null
}

export interface EngineResult {
  startDate: Date
  endDate: Date
}

export interface EngineOutput {
  results: Map<string, EngineResult>
  hasCycle: boolean
  withoutArea: string[]
}

// ימי עבודה למקטע של 510 מ"ר: A = סימונים 1 + לוגיסטיקה 1 + עוגנים 3 + שלד 4; G = זיגוג; S = סיליקון. B לא משתנה.
const DAYS_PER_510: Partial<Record<InstallKind, number>> = { A: 9, G: 17, S: 5 }

// זיגוג (G): קצב התקנה של יחידות זכוכית ליום עבודה — עדיף על חישוב לפי מ"ר כשקיימת כמות
export const GLAZING_UNITS_PER_DAY = 25
// קומות נמוכות (טווח שמתחיל עד קומה זו): כרגע זהה לקצב הרגיל; להעלאת הקצב — לשנות כאן
export const GLAZING_FAST_UNITS_PER_DAY = 25
const GLAZING_FAST_MAX_START_FLOOR = 5

export function glazingRate(floors: string | null): number {
  const m = floors?.match(/\d+/)
  return m && parseInt(m[0], 10) <= GLAZING_FAST_MAX_START_FLOOR ? GLAZING_FAST_UNITS_PER_DAY : GLAZING_UNITS_PER_DAY
}

const NAME_PATTERN = /^([AGB])-(\d+) /
const SILICONE_PATTERN = /סיליקון S-(\d+)/

export function isInstallationName(name: string): boolean {
  return NAME_PATTERN.test(name) || SILICONE_PATTERN.test(name)
}

function parseKind(name: string): { kind: InstallKind; num: number } | null {
  const m = name.match(NAME_PATTERN)
  if (m) return { kind: m[1] as InstallKind, num: parseInt(m[2], 10) }
  const s = name.match(SILICONE_PATTERN)
  return s ? { kind: 'S', num: parseInt(s[1], 10) } : null
}

function parseArea(notes: string | null): number | null {
  const m = notes?.match(/([\d.]+)\s*מ"ר/)
  return m ? parseFloat(m[1]) : null
}

// מיקום בציר הזמן: יום + כמה מקיבולת העבודה שלו כבר נוצלה. מאפשר לפעילות זיגוג להתחיל באותו יום שבו הקודמת נגמרה.
interface Pos { date: Date; used: number }

function normalizePos(p: Pos, ramadan: boolean): Pos {
  let { date, used } = p
  for (;;) {
    const cap = workFactor(date, 'israel', ramadan)
    if (cap > 0 && used < cap - 1e-9) return { date, used }
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + 1)
    date = nextWorkingDay(next, 'israel', ramadan)
    used = 0
  }
}

function advance(pos: Pos, amount: number, ramadan: boolean): { endDate: Date; endPos: Pos } {
  let cur = normalizePos(pos, ramadan)
  let endDate = cur.date
  let left = amount
  while (left > 1e-9) {
    cur = normalizePos(cur, ramadan)
    const take = Math.min(workFactor(cur.date, 'israel', ramadan) - cur.used, left)
    cur = { date: cur.date, used: cur.used + take }
    left -= take
    endDate = cur.date
  }
  return { endDate, endPos: normalizePos(cur, ramadan) }
}

function isLater(a: Pos, b: Pos): boolean {
  return a.date.getTime() > b.date.getTime() || (a.date.getTime() === b.date.getTime() && a.used > b.used)
}

// ימי עבודה נדרשים: G לפי כמות יחידות, A לפי טבלת 510 מ"ר (השטח בהערות הפעילות)
export function requiredWorkDays(name: string, notes: string | null, quantity: number | null, floors: string | null): { days: number; basis: string } | null {
  const kind = parseKind(name)?.kind
  if (kind === 'G' && quantity !== null && quantity > 0) {
    const rate = glazingRate(floors)
    return { days: quantity / rate, basis: `${rate} יח׳ ליום` }
  }
  const per510 = kind ? DAYS_PER_510[kind] : undefined
  const area = parseArea(notes)
  return per510 && area !== null && kind !== 'S' ? { days: (area * per510) / 510, basis: 'טבלת 510 מ״ר' } : null
}

// היום כפי שמוצג בישראל; +12 שעות מונע טעות יום כשהשעה השמורה 22:00 UTC
export function localDay(d: Date): Date {
  const shifted = new Date(d.getTime() + 12 * 3600000)
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()))
}

export function dayKey(d: Date): string {
  return localDay(d).toISOString().slice(0, 10)
}

function parseDeps(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function topoSort(ids: string[], depsOf: Map<string, string[]>): string[] {
  const inDeg = new Map<string, number>(ids.map(id => [id, 0]))
  const successors = new Map<string, string[]>(ids.map(id => [id, []]))
  for (const id of ids) {
    for (const p of depsOf.get(id) ?? []) {
      if (!inDeg.has(p)) continue
      inDeg.set(id, (inDeg.get(id) ?? 0) + 1)
      successors.get(p)?.push(id)
    }
  }
  const queue = ids.filter(id => inDeg.get(id) === 0)
  const sorted: string[] = []
  while (queue.length) {
    const cur = queue.shift() as string
    sorted.push(cur)
    for (const s of successors.get(cur) ?? []) {
      const d = (inDeg.get(s) ?? 0) - 1
      inDeg.set(s, d)
      if (d === 0) queue.push(s)
    }
  }
  return sorted
}

// pinned: פעילויות שהתאריכים שלהן קבועים ולא מחושבים מחדש (למשל כל מה שמחוץ לשרשרת העוקבות של פעילות שנערכה)
export function computeInstallationSchedule(
  tasks: EngineTask[],
  ramadan: boolean,
  pinned: Map<string, EngineResult> = new Map(),
): EngineOutput {
  const byId = new Map(tasks.map(t => [t.id, t]))
  const depsOf = new Map(tasks.map(t => [t.id, parseDeps(t.dependencies)]))
  const info = new Map(tasks.map(t => [t.id, parseKind(t.name)]))

  const gArea = new Map<number, number>()
  for (const t of tasks) {
    const i = info.get(t.id)
    const a = parseArea(t.notes)
    if (i?.kind === 'G' && a !== null) gArea.set(i.num, a)
  }
  const areaOf = (t: EngineTask): number | null => {
    const i = info.get(t.id)
    return i?.kind === 'S' ? gArea.get(i.num) ?? null : parseArea(t.notes)
  }

  const order = topoSort(tasks.map(t => t.id), depsOf)
  const results = new Map<string, EngineResult>()
  const withoutArea: string[] = []
  const gCarry = new Map<string, Pos>()

  for (const id of order) {
    const t = byId.get(id) as EngineTask
    const kind = info.get(id)?.kind

    const fixed = pinned.get(id)
    if (fixed) { results.set(id, fixed); continue }

    if (kind === 'G' && t.quantity !== null && t.quantity > 0) {
      let startPos: Pos | null = null
      for (const p of depsOf.get(id) ?? []) {
        const r = results.get(p)
        if (!r) continue
        let cand = gCarry.get(p)
        if (!cand) {
          const dayAfter = new Date(r.endDate)
          dayAfter.setUTCDate(dayAfter.getUTCDate() + 1)
          cand = { date: nextWorkingDay(dayAfter, 'israel', ramadan), used: 0 }
        }
        if (!startPos || isLater(cand, startPos)) startPos = cand
      }
      const from = startPos ?? { date: nextWorkingDay(localDay(t.startDate), 'israel', ramadan), used: 0 }
      const { endDate, endPos } = advance(from, t.quantity / glazingRate(t.floors), ramadan)
      gCarry.set(id, endPos)
      results.set(id, { startDate: normalizePos(from, ramadan).date, endDate })
      continue
    }

    let maxPredEnd: Date | null = null
    for (const p of depsOf.get(id) ?? []) {
      const r = results.get(p)
      if (r && (!maxPredEnd || r.endDate > maxPredEnd)) maxPredEnd = r.endDate
    }
    let start = localDay(t.startDate)
    if (maxPredEnd) {
      const dayAfter = new Date(maxPredEnd)
      dayAfter.setUTCDate(dayAfter.getUTCDate() + 1)
      start = nextWorkingDay(dayAfter, 'israel', ramadan)
    }

    const per510 = kind ? DAYS_PER_510[kind] : undefined
    const area = areaOf(t)
    let end: Date
    if (per510 && area !== null) {
      const days = Math.max(1, Math.ceil((area * per510) / 510 - 1e-9))
      end = lastDayOfWork(start, days, 'israel', ramadan)
    } else {
      if (per510) withoutArea.push(t.name)
      const calDays = Math.round((localDay(t.endDate).getTime() - localDay(t.startDate).getTime()) / 86400000)
      end = new Date(start)
      end.setUTCDate(end.getUTCDate() + calDays)
    }
    results.set(id, { startDate: start, endDate: end })
  }

  return { results, hasCycle: order.length < tasks.length, withoutArea }
}
