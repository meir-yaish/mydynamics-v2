import { CalendarRange } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <CalendarRange size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">לוח זמנים</h2>
        <p style={{ color: 'var(--muted)' }}>
          מודול לוח הזמנים עם Gantt, תלויות, baselines ודוחות שבועיים.
          <br />בשלב הבא — port מלא מ-terminal3-scheduler.
        </p>
      </div>
    </div>
  )
}
