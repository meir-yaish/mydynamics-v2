import { Receipt } from 'lucide-react'

export default function BuyoutPage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <Receipt size={48} style={{ color: 'var(--purple)', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">תמכור</h2>
        <p style={{ color: 'var(--muted)' }}>
          ניהול הצעות מחיר, חבילות רכש וספקים.
          <br />בשלב הבא — port מלא מ-buyout-tool.
        </p>
      </div>
    </div>
  )
}
