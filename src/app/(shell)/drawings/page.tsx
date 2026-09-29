import { FileImage } from 'lucide-react'

export default function DrawingsPage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <FileImage size={48} style={{ color: 'var(--green)', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">שרטוטים</h2>
        <p style={{ color: 'var(--muted)' }}>
          צפייה בשרטוטים וחזיתות (Shop Drawings).
          <br />בשלב הבא — port מלא מ-קוראה-SD.
        </p>
      </div>
    </div>
  )
}
