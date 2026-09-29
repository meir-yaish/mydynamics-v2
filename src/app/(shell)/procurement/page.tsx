import { Search } from 'lucide-react'

export default function ProcurementPage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <Search size={48} style={{ color: 'var(--red)', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">חיפוש רכש</h2>
        <p style={{ color: 'var(--muted)' }}>
          חיפוש חכם בתוך הצעות מחיר ומסמכי רכש.
        </p>
      </div>
    </div>
  )
}
