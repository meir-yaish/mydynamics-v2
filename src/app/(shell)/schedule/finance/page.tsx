'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import CostAnalysisGate from '@/components/schedule/CostAnalysisGate'

const TABS = [
  { key: 'report', label: '📊 דוח מנכ״ל' },
  { key: 'pnl',    label: '📈 רווח והפסד' },
  { key: 'cost',   label: '💼 עלות מול תקציב' },
  { key: 'budget', label: '📋 תקציב לפי סעיף' },
  { key: 'quote',  label: '🧮 בדיקת הצעת מחיר' },
] as const

type TabKey = typeof TABS[number]['key']

export default function FinancePage() {
  return <CostAnalysisGate><FinancePageInner /></CostAnalysisGate>
}

// ──────────────────────────────────────────────
// Quote Check types
// ──────────────────────────────────────────────

const PHASE = 'עלות מול תקציב'
const PERIMETER_ITEM_NAME = 'פריפריה מ"א'
const LINEAR_METER_CATEGORIES = ['מחסום עשן', 'מחסום אש']

interface ScheduleTask {
  id: string
  name: string
  phase: string
  cost?: number | null
  quantity?: number | null
  notes?: string | null
  costBreakdown?: string | null
}

interface Option {
  key: string
  label: string
  sublabel: string
  budget: number
  rate: number | null
  unit: string | null
  quantity: number | null
}

// ──────────────────────────────────────────────
// Tabs placeholder
// ──────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <div className="bg-white rounded-xl shadow p-8">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-[#1F3864] mb-2">עמוד {label} — בהכנה</h2>
        <p className="text-gray-500 text-sm">מודול הכספים מועבר ממערכת terminal3 ויהיה זמין בקרוב.</p>
        <p className="text-gray-400 text-xs mt-2">בינתיים ניתן לגשת לנתוני הכספים ישירות מלוח הזמנים.</p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Quote Check tab — adapted from terminal3
// ──────────────────────────────────────────────

function QuoteCheckTab() {
  const [tasks, setTasks] = useState<ScheduleTask[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [priceMode, setPriceMode] = useState<'perUnit' | 'total'>('total')
  const [offeredPrice, setOfferedPrice] = useState('')
  const [offeredQuantity, setOfferedQuantity] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const projectsRes = await fetch('/api/schedule/projects')
        const projects: { id: string; name: string }[] = await projectsRes.json()
        const logisticsProject = projects.find(p => p.name.includes('לוגיסטיקה'))
        if (logisticsProject) {
          const res = await fetch(`/api/schedule/tasks?projectId=${logisticsProject.id}`)
          setTasks(await res.json())
        }
      } catch {
        // silently fail — no data to show
      }
      setLoading(false)
    })()
  }, [])

  const items = useMemo(() => tasks.filter(t => t.phase === PHASE && t.name !== PERIMETER_ITEM_NAME), [tasks])
  const perimeterLength = useMemo(() => tasks.find(t => t.name === PERIMETER_ITEM_NAME)?.quantity ?? null, [tasks])

  const options = useMemo<Option[]>(() => {
    const out: Option[] = []
    const linearTotals: Record<string, number> = {}
    for (const t of items) {
      const cost = t.cost ?? 0
      out.push({
        key: `item:${t.id}`,
        label: t.name,
        sublabel: 'סעיף שלם',
        budget: cost,
        rate: t.quantity ? cost / t.quantity : null,
        unit: t.notes || null,
        quantity: t.quantity ?? null,
      })
      if (!t.costBreakdown) continue
      let bd: Record<string, number> = {}
      try { bd = JSON.parse(t.costBreakdown) } catch { bd = {} }
      for (const [label, val] of Object.entries(bd)) {
        if (!val) continue
        if (LINEAR_METER_CATEGORIES.includes(label)) {
          linearTotals[label] = (linearTotals[label] ?? 0) + val
          continue
        }
        out.push({
          key: `cat:${t.id}:${label}`,
          label,
          sublabel: t.name,
          budget: val,
          rate: t.quantity ? val / t.quantity : null,
          unit: t.notes || null,
          quantity: t.quantity ?? null,
        })
      }
    }
    for (const [label, total] of Object.entries(linearTotals)) {
      out.push({
        key: `linear:${label}`,
        label,
        sublabel: 'כל הפרויקט',
        budget: total,
        rate: perimeterLength ? total / perimeterLength : null,
        unit: 'מ״א',
        quantity: perimeterLength,
      })
    }
    return out
  }, [items, perimeterLength])

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return options.filter(o =>
      o.label.toLowerCase().includes(q) || o.sublabel.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [options, query])

  const selected = options.find(o => o.key === selectedKey) ?? null
  const usingPerUnit = priceMode === 'perUnit' && selected?.rate != null

  const fmt = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`

  const parsedOffer = parseFloat(offeredPrice)
  const parsedQty   = parseFloat(offeredQuantity)
  const hasOffer    = selected != null && !isNaN(parsedOffer) && parsedOffer > 0
    && (!usingPerUnit || (!isNaN(parsedQty) && parsedQty > 0))

  let comparisonBudget: number | null = null
  let totalOffer: number | null = null
  let offerRate: number | null = null
  if (selected && hasOffer) {
    if (usingPerUnit) {
      offerRate = parsedOffer
      totalOffer = parsedOffer * parsedQty
      comparisonBudget = selected.rate! * parsedQty
    } else {
      totalOffer = parsedOffer
      comparisonBudget = selected.budget
    }
  }

  const diff    = comparisonBudget != null && totalOffer != null ? comparisonBudget - totalOffer : null
  const diffPct = comparisonBudget != null && comparisonBudget !== 0 && diff != null
    ? (diff / comparisonBudget) * 100 : null

  function selectOption(o: Option) {
    setSelectedKey(o.key)
    setQuery(o.label)
    setPriceMode(o.rate != null ? 'perUnit' : 'total')
    setOfferedPrice('')
    setOfferedQuantity(o.quantity != null ? String(o.quantity) : '')
  }

  function reset() {
    setSelectedKey(null)
    setQuery('')
    setOfferedPrice('')
    setOfferedQuantity('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        טוען נתוני תקציב...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <div className="bg-white rounded-xl shadow p-8">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 text-sm">לא נמצאו סעיפי עלות בפרויקט הלוגיסטיקה.</p>
          <p className="text-gray-400 text-xs mt-1">ודא שיש פרויקט ששמו מכיל "לוגיסטיקה" ושיש בו משימות עם פאזה <strong>{PHASE}</strong>.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '3px solid #1F3864', paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>כלי עזר לרכש</div>
        <h1 style={{ fontSize: 22, color: '#1F3864', margin: '4px 0', fontWeight: 800 }}>🧮 בדיקת הצעת מחיר מול תקציב</h1>
        <div style={{ fontSize: 13, color: '#666' }}>
          בחרו סעיף/קטגוריה מהתקציב, הכניסו את מה שהוצע לכם, וקבלו תשובה — עומד בתקציב או חורג
        </div>
      </div>

      {/* Step 1: search */}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1F3864', marginBottom: 6 }}>
        על מה קיבלתם הצעת מחיר?
      </label>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setSelectedKey(null) }}
        placeholder="לדוגמה: מחסום עשן, בולנוז, זכוכית..."
        style={{ width: '100%', padding: '10px 12px', fontSize: 15, border: '1.5px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box', marginBottom: 4 }}
      />
      {query && !selected && filteredOptions.length > 0 && (
        <div style={{ border: '1px solid #D1D5DB', borderRadius: 6, marginBottom: 16, maxHeight: 260, overflowY: 'auto', background: 'white' }}>
          {filteredOptions.map(o => (
            <div
              key={o.key}
              onClick={() => selectOption(o)}
              onMouseDown={e => e.preventDefault()}
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}
            >
              <span style={{ fontWeight: 700, color: '#333' }}>{o.label}</span>
              <span style={{ color: '#999', marginRight: 8, fontSize: 12 }}> — {o.sublabel}</span>
            </div>
          ))}
        </div>
      )}
      {query && !selected && filteredOptions.length === 0 && (
        <div style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>לא נמצא סעיף מתאים בתקציב</div>
      )}

      {selected && (
        <>
          {/* Budget card */}
          <div style={{ background: '#E8EEF7', border: '1px solid #B9CBE3', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#1F3864', fontWeight: 700 }}>💼 תקציב מתוכנן — {selected.label}</div>
              <div style={{ fontSize: 11, color: '#667' }}>
                {selected.sublabel}{selected.quantity != null ? ` · ${selected.quantity.toLocaleString('he-IL')} ${selected.unit || 'יח׳'}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1F3864', fontVariantNumeric: 'tabular-nums' }}>{fmt(selected.budget)}</div>
              {selected.rate != null && (
                <div style={{ fontSize: 12, color: '#667' }}>
                  ({selected.rate.toLocaleString('he-IL', { maximumFractionDigits: 2 })} ₪/{selected.unit || 'יח׳'})
                </div>
              )}
            </div>
          </div>

          {/* Step 2: price mode */}
          {selected.rate != null && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {(['perUnit', 'total'] as const).map(m => (
                <button key={m} onClick={() => { setPriceMode(m); setOfferedPrice('') }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12.5,
                    fontWeight: priceMode === m ? 700 : 400,
                    background: priceMode === m ? '#1F3864' : 'white',
                    color: priceMode === m ? 'white' : '#444',
                    border: `1.5px solid ${priceMode === m ? '#1F3864' : '#D1D5DB'}`,
                    cursor: 'pointer',
                  }}>
                  {m === 'perUnit' ? `מחיר ליחידה (₪/${selected.unit || 'יח׳'})` : 'מחיר קומפלט (סכום כולל)'}
                </button>
              ))}
            </div>
          )}

          {usingPerUnit ? (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#444', marginBottom: 4 }}>מחיר ליחידה שהוצע (₪/{selected.unit || 'יח׳'})</label>
                <input type="number" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} placeholder="לדוגמה: 115"
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', textAlign: 'left' }} />
              </div>
              <div style={{ width: 140 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#444', marginBottom: 4 }}>כמות</label>
                <input type="number" value={offeredQuantity} onChange={e => setOfferedQuantity(e.target.value)} placeholder={selected.unit || 'יח׳'}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', textAlign: 'left' }} />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#444', marginBottom: 4 }}>מחיר כולל שהוצע (קומפלט)</label>
              <input type="number" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} placeholder="₪"
                style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', textAlign: 'left' }} />
            </div>
          )}

          {/* Verdict */}
          {hasOffer && diff != null && diffPct != null && (
            <div style={{
              borderRadius: 8, padding: '16px 18px', marginBottom: 8,
              background: diff >= 0 ? '#EAF7ED' : '#FBEEEE',
              border: `1.5px solid ${diff >= 0 ? '#8FCB9B' : '#E3A5A5'}`,
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: diff >= 0 ? '#1E7A34' : '#C00000', marginBottom: 6 }}>
                {diff >= 0
                  ? `✅ עומד בתקציב — חוסך ${fmt(diff)} (${diffPct.toFixed(1)}%)`
                  : `⚠️ חורג מהתקציב ב-${fmt(Math.abs(diff))} (${Math.abs(diffPct).toFixed(1)}%)`}
              </div>
              <div style={{ fontSize: 12.5, color: '#555' }}>
                תקציב להשוואה: <b>{fmt(comparisonBudget!)}</b>
                {comparisonBudget !== selected.budget ? ' (מוערך לפי הכמות שהוזנה)' : ''}
                {' '}· הצעה: <b>{fmt(totalOffer!)}</b>
                {offerRate != null && (
                  <> · מחיר ליחידה בהצעה: <b>{offerRate.toLocaleString('he-IL', { maximumFractionDigits: 2 })} ₪/{selected.unit || 'יח׳'}</b>{' '}
                  לעומת <b>{selected.rate!.toLocaleString('he-IL', { maximumFractionDigits: 2 })} ₪/{selected.unit || 'יח׳'}</b> בתקציב</>
                )}
              </div>
            </div>
          )}

          <button onClick={reset}
            style={{ background: '#999', color: 'white', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>
            בדיקה חדשה
          </button>
        </>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────

function FinancePageInner() {
  const [tab, setTab] = useState<TabKey>('report')

  return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', background: '#EFF2F5', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: '#111', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/schedule" style={{ color: '#9DC3E6', fontSize: 14, textDecoration: 'none' }}>← חזרה ללוח הזמנים</Link>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13,
                fontWeight: tab === t.key ? 700 : 400,
                background: tab === t.key ? '#1F3864' : 'white',
                color: tab === t.key ? 'white' : '#444',
                border: `1.5px solid ${tab === t.key ? '#1F3864' : '#D1D5DB'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 8 }}>
        {tab === 'quote'
          ? <QuoteCheckTab />
          : <PlaceholderTab label={TABS.find(t => t.key === tab)?.label ?? ''} />
        }
      </div>
    </div>
  )
}
