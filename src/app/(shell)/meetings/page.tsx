import { Users } from 'lucide-react'

export default function MeetingsPage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <Users size={48} style={{ color: 'var(--amber)', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">סיכום ישיבות</h2>
        <p style={{ color: 'var(--muted)' }}>
          ישיבות צוות, החלטות ומעקב משימות.
          <br />בשלב הבא — port מלא מ-meeting-summary-tool.
        </p>
      </div>
    </div>
  )
}
