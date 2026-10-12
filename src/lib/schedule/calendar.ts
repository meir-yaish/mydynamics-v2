export type CalendarType = 'israel' | 'portugal'

const ISRAEL_OFF_DAYS = new Set([5, 6])
const PORTUGAL_OFF_DAYS = new Set([0, 6])

export const MUSLIM_HOLIDAYS = new Set<string>([
  '2025-03-30', '2025-03-31', '2025-04-01',
  '2025-06-06', '2025-06-07', '2025-06-08',
  '2026-03-19', '2026-03-20', '2026-03-21',
  '2026-05-26', '2026-05-27', '2026-05-28',
  '2027-03-08', '2027-03-09', '2027-03-10',
  '2027-05-15', '2027-05-16', '2027-05-17',
])

export const JEWISH_HOLIDAYS = new Set<string>([
  '2025-04-13', '2025-04-14', '2025-04-15', '2025-04-16',
  '2025-04-17', '2025-04-18', '2025-04-19',
  '2025-04-30',
  '2025-06-01',
  '2025-09-22', '2025-09-23',
  '2025-10-01',
  '2025-10-06',
  '2025-10-13',
  '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05',
  '2026-04-06', '2026-04-07', '2026-04-08',
  '2026-04-22',
  '2026-05-21',
  '2026-09-11', '2026-09-12',
  '2026-09-20',
  '2026-09-25',
  '2026-10-02',
  '2027-04-21', '2027-04-22', '2027-04-23', '2027-04-24',
  '2027-04-25', '2027-04-26', '2027-04-27',
  '2027-05-11',
  '2027-06-11',
  '2027-10-02', '2027-10-03',
])

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
])

const CONSTRUCTION_HOLIDAYS = new Set<string>([
  ...JEWISH_HOLIDAYS,
  ...MUSLIM_HOLIDAYS,
])

function toKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function isWorkingDay(d: Date, cal: CalendarType): boolean {
  const dow = d.getDay()
  if (cal === 'israel') {
    if (ISRAEL_OFF_DAYS.has(dow)) return false
    return !CONSTRUCTION_HOLIDAYS.has(toKey(d))
  } else {
    if (PORTUGAL_OFF_DAYS.has(dow)) return false
    return !PORTUGAL_HOLIDAYS.has(toKey(d))
  }
}

export function countMonFriDays(start: Date, end: Date): number {
  let count = 0
  const d = new Date(start)
  while (d < end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

export function nextWorkingDay(d: Date, cal: CalendarType): Date {
  const result = new Date(d)
  while (!isWorkingDay(result, cal)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

export function addWorkingDays(start: Date, days: number, cal: CalendarType): Date {
  if (days <= 0) return new Date(start)
  const d = new Date(start)
  let counted = 0
  while (true) {
    if (isWorkingDay(d, cal)) {
      counted++
      if (counted === days) {
        d.setDate(d.getDate() + 1)
        return d
      }
    }
    d.setDate(d.getDate() + 1)
  }
}

export function calendarForResponsible(responsible: string): CalendarType {
  if (responsible.includes('קלריאו') || responsible.includes('קלריאר')) return 'portugal'
  return 'israel'
}
