import { Truck } from 'lucide-react'

export default function SupplyChainPage() {
  return (
    <div className="fade-in">
      <div className="card p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
        <Truck size={48} style={{ color: '#0d9488', margin: '0 auto 1rem' }} />
        <h2 className="text-xl font-bold mb-2">שרשרת הספקה</h2>
        <p style={{ color: 'var(--muted)' }}>
          מעקב הזמנות, משלוחים ואספקה לאתרים.
        </p>
      </div>
    </div>
  )
}
