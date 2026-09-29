import { Construction } from 'lucide-react'

export default function EquipmentPage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <Construction size={48} style={{ color: 'var(--accent)', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">ציוד הרמה</h2>
        <p style={{ color: 'var(--muted)' }}>
          קטלוג ציוד, המלצות, עגלת הזמנה והזמנה מהירה.
          <br />בשלב הבא — port מלא מ-equipment-advisor.
        </p>
      </div>
    </div>
  )
}
