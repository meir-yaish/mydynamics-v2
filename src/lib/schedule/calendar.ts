export type CalendarType = 'israel' | 'portugal'

// Day-of-week off days (UTC-based)
const ISRAEL_OFF_DOW = new Set([6])    // Saturday only (0=Sun,1=Mon,...,5=Fri,6=Sat)
const PORTUGAL_OFF_DOW = new Set([0, 6]) // Sunday + Saturday

// ──────────────────────────────────────────────
// Helper: generate all ISO date strings in range
// ──────────────────────────────────────────────
function dateRange(start: string, end: string): string[] {
  const result: string[] = []
  const d = new Date(start + 'T00:00:00Z')
  const e = new Date(end + 'T00:00:00Z')
  while (d <= e) {
    result.push(d.toISOString().split('T')[0])
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return result
}

// ──────────────────────────────────────────────
// Jewish holidays — full-off days (0)
// ──────────────────────────────────────────────
const JEWISH_FULL_OFF = new Set<string>([
  // 2025
  '2025-04-13', '2025-04-14', '2025-04-15', '2025-04-16',
  '2025-04-17', '2025-04-18', '2025-04-19',
  '2025-04-30',
  '2025-06-01',
  '2025-09-22', '2025-09-23',
  '2025-10-01',
  '2025-10-06',
  '2025-10-13',
  // 2026
  '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05',
  '2026-04-06', '2026-04-07', '2026-04-08',
  '2026-04-22',
  '2026-05-21',
  '2026-09-11', '2026-09-12',
  '2026-09-20',
  '2026-09-25',
  '2026-10-02',
  // 2027
  '2027-04-22',                   // פסח
  '2027-04-28',                   // שביעי של פסח
  '2027-05-12',                   // יום העצמאות
  '2027-06-11',                   // שבועות
  '2027-10-02', '2027-10-03',     // ראש השנה
  '2027-10-11',                   // יום כיפור
  '2027-10-16',                   // סוכות
  '2027-10-23',                   // שמיני עצרת
  // 2028
  '2028-04-11',                   // פסח
  '2028-04-17',                   // שביעי של פסח
  '2028-05-02',                   // יום העצמאות
  '2028-05-31',                   // שבועות
  '2028-09-21', '2028-09-22',     // ראש השנה
  '2028-09-30',                   // יום כיפור
  '2028-10-05',                   // סוכות
  '2028-10-12',                   // שמיני עצרת
])

// ──────────────────────────────────────────────
// Jewish half-days (0.5): ערבי חגים + חול המועד
// ──────────────────────────────────────────────
const JEWISH_HALF = new Set<string>([
  // 2027
  '2027-04-21',                                                // ערב פסח
  '2027-04-23', '2027-04-24', '2027-04-25', '2027-04-26', '2027-04-27', // חול המועד פסח
  '2027-06-10',                                                // ערב שבועות
  '2027-10-01',                                                // ערב ראש השנה
  '2027-10-10',                                                // ערב יום כיפור
  '2027-10-15',                                                // ערב סוכות
  '2027-10-17', '2027-10-18', '2027-10-19', '2027-10-20', '2027-10-21', '2027-10-22', // חול המועד סוכות
  // 2028
  '2028-04-10',                                                // ערב פסח
  '2028-04-12', '2028-04-13', '2028-04-14', '2028-04-15', '2028-04-16', // חול המועד פסח
  '2028-05-30',                                                // ערב שבועות
  '2028-09-20',                                                // ערב ראש השנה
  '2028-09-29',                                                // ערב יום כיפור
  '2028-10-04',                                                // ערב סוכות
  '2028-10-06', '2028-10-07', '2028-10-08', '2028-10-09', '2028-10-10', '2028-10-11', // חול המועד סוכות
])

// ──────────────────────────────────────────────
// Muslim holidays — full-off (0)
// Eid al-Fitr + Eid al-Adha
// Note: can shift ±1 day — editable here manually
// ──────────────────────────────────────────────
const MUSLIM_FULL_OFF = new Set<string>([
  // 2025 עיד אל-פיטר Mar 30–Apr 1
  '2025-03-30', '2025-03-31', '2025-04-01',
  // 2025 עיד אל-אדחא Jun 6–8
  '2025-06-06', '2025-06-07', '2025-06-08',
  // 2026 עיד אל-פיטר Mar 19–21
  '2026-03-19', '2026-03-20', '2026-03-21',
  // 2026 עיד אל-אדחא May 26–28
  '2026-05-26', '2026-05-27', '2026-05-28',
  // 2027 עיד אל-פיטר Mar 9–11
  '2027-03-09', '2027-03-10', '2027-03-11',
  // 2027 עיד אל-אדחא May 16–19
  '2027-05-16', '2027-05-17', '2027-05-18', '2027-05-19',
  // 2028 עיד אל-פיטר Feb 26–28
  '2028-02-26', '2028-02-27', '2028-02-28',
  // 2028 עיד אל-אדחא May 5–8
  '2028-05-05', '2028-05-06', '2028-05-07', '2028-05-08',
])

// ──────────────────────────────────────────────
// Ramadan — half days (0.5)
// Note: can shift ±1 day — editable here manually
// ──────────────────────────────────────────────
// נספרים כחצי יום רק כשההגדרה Settings.ramadanHalfDays פעילה (פרמטר ramadan בפונקציות למטה)
export const RAMADAN_DAYS = new Set<string>([
  // 2027: Feb 8 – Mar 8
  ...dateRange('2027-02-08', '2027-03-08'),
  // 2028: Jan 28 – Feb 25
  ...dateRange('2028-01-28', '2028-02-25'),
])

// ──────────────────────────────────────────────
// Exported Sets for GanttChart visual display
// (colored bands: blue=Jewish, green=Muslim)
// ──────────────────────────────────────────────
export const JEWISH_HOLIDAYS = new Set<string>([
  ...JEWISH_FULL_OFF,
  ...JEWISH_HALF,
])

export const MUSLIM_HOLIDAYS = new Set<string>(MUSLIM_FULL_OFF)

// Portugal holidays (unchanged)
const PORTUGAL_HOLIDAYS = new Set<string>([
  '2025-01-01', '2025-04-18', '2025-04-25', '2025-05-01',
  '2025-06-10', '2025-06-19', '2025-08-15', '2025-10-05',
  '2025-11-01', '2025-12-01', '2025-12-08', '2025-12-25',
  '2026-01-01', '2026-04-03', '2026-04-25', '2026-05-01',
  '2026-06-04', '2026-06-10', '2026-08-15', '2026-10-05',
  '2026-11-01', '2026-12-01', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-03-26', '2027-04-25', '2027-05-01',
  '2027-05-27', '2027-06-10', '2027-08-15', '2027-10-05',
  '2027-11-01', '2027-12-01', '2027-12-08', '2027-12-25',
  '2028-01-01', '2028-03-31', '2028-04-25', '2028-05-01',
  '2028-06-15', '2028-06-10', '2028-08-15', '2028-10-05',
  '2028-11-01', '2028-12-01', '2028-12-08', '2028-12-25',
])

function toKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ──────────────────────────────────────────────
// workFactor: 0 = no work, 0.5 = half day, 1 = full day
// Rule: Friday and Saturday are always 0 (no work on Fridays).
// ──────────────────────────────────────────────
export function workFactor(d: Date, cal: CalendarType, ramadan = false): 0 | 0.5 | 1 {
  const dow = d.getUTCDay() // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

  if (cal === 'israel') {
    if (dow === 5 || dow === 6) return 0
    const key = toKey(d)
    if (JEWISH_FULL_OFF.has(key) || MUSLIM_FULL_OFF.has(key)) return 0
    if (JEWISH_HALF.has(key) || (ramadan && RAMADAN_DAYS.has(key))) return 0.5
    return 1
  } else {
    if (PORTUGAL_OFF_DOW.has(dow)) return 0
    if (PORTUGAL_HOLIDAYS.has(toKey(d))) return 0
    return 1
  }
}

export function isWorkingDay(d: Date, cal: CalendarType, ramadan = false): boolean {
  return workFactor(d, cal, ramadan) > 0
}

// ──────────────────────────────────────────────
// nextWorkingDay: first working day on or after d
// ──────────────────────────────────────────────
export function nextWorkingDay(d: Date, cal: CalendarType, ramadan = false): Date {
  const result = new Date(d)
  result.setUTCHours(0, 0, 0, 0)
  while (workFactor(result, cal, ramadan) === 0) {
    result.setUTCDate(result.getUTCDate() + 1)
  }
  return result
}

// ──────────────────────────────────────────────
// lastDayOfWork: last calendar date when `days` working
// days have elapsed starting from `start` (inclusive).
// Half-days contribute 0.5 toward the total.
// ──────────────────────────────────────────────
export function lastDayOfWork(start: Date, days: number, cal: CalendarType, ramadan = false): Date {
  if (days <= 0) return new Date(start)
  const d = new Date(start)
  d.setUTCHours(0, 0, 0, 0)
  let acc = 0
  while (true) {
    const f = workFactor(d, cal, ramadan)
    if (f > 0) {
      acc += f
      if (acc >= days) return new Date(d)
    }
    d.setUTCDate(d.getUTCDate() + 1)
  }
}

// addWorkingDays: returns day AFTER `days` working days (backward-compat)
export function addWorkingDays(start: Date, days: number, cal: CalendarType, ramadan = false): Date {
  if (days <= 0) return new Date(start)
  const last = lastDayOfWork(start, days, cal, ramadan)
  const next = new Date(last)
  next.setUTCDate(next.getUTCDate() + 1)
  return next
}

// סכום ימי העבודה (ערב חג/חצי יום = 0.5) בטווח, כולל שני הקצוות
export function workDaysBetween(start: Date, end: Date, cal: CalendarType, ramadan = false): number {
  let sum = 0
  const d = new Date(start)
  d.setUTCHours(0, 0, 0, 0)
  while (d <= end) {
    sum += workFactor(d, cal, ramadan)
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return sum
}

export function countMonFriDays(start: Date, end: Date): number {
  let count = 0
  const d = new Date(start)
  while (d < end) {
    const dow = d.getUTCDay()
    if (dow !== 0 && dow !== 6) count++
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return count
}

export function calendarForResponsible(responsible: string): CalendarType {
  if (responsible.includes('קלריאו') || responsible.includes('קלריאר')) return 'portugal'
  return 'israel'
}
