'use client'

import { ExternalLink } from 'lucide-react'

function ScheduleSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gantt chart bars */}
      <rect x="10" y="10" width="100" height="6" rx="3" fill="#e0e7ff" />
      <rect x="10" y="10" width="60" height="6" rx="3" fill="#4f46e5" />
      <rect x="10" y="22" width="100" height="6" rx="3" fill="#e0e7ff" />
      <rect x="25" y="22" width="45" height="6" rx="3" fill="#6366f1" />
      <rect x="10" y="34" width="100" height="6" rx="3" fill="#e0e7ff" />
      <rect x="40" y="34" width="50" height="6" rx="3" fill="#818cf8" />
      <rect x="10" y="46" width="100" height="6" rx="3" fill="#e0e7ff" />
      <rect x="55" y="46" width="35" height="6" rx="3" fill="#a5b4fc" />
      {/* Diamond milestone */}
      <rect x="85" y="55" width="8" height="8" rx="1" fill="#4f46e5" transform="rotate(45 89 59)" />
      {/* Calendar icon */}
      <rect x="10" y="60" width="18" height="16" rx="3" stroke="#4f46e5" strokeWidth="1.5" fill="white" />
      <line x1="10" y1="66" x2="28" y2="66" stroke="#4f46e5" strokeWidth="1.5" />
      <line x1="15" y1="57" x2="15" y2="62" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23" y1="57" x2="23" y2="62" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ScheduleStudioSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Excel file being dragged */}
      <rect x="5" y="8" width="35" height="44" rx="3" fill="white" stroke="#059669" strokeWidth="1.5" />
      <rect x="5" y="8" width="35" height="12" rx="3" fill="#059669" />
      <text x="22" y="17" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">XLSX</text>
      {/* Table rows in file */}
      <line x1="10" y1="28" x2="35" y2="28" stroke="#a7f3d0" strokeWidth="1" />
      <line x1="10" y1="34" x2="35" y2="34" stroke="#a7f3d0" strokeWidth="1" />
      <line x1="10" y1="40" x2="35" y2="40" stroke="#a7f3d0" strokeWidth="1" />
      <line x1="10" y1="46" x2="35" y2="46" stroke="#a7f3d0" strokeWidth="1" />
      <line x1="20" y1="22" x2="20" y2="50" stroke="#a7f3d0" strokeWidth="1" />
      {/* Arrow from file to project */}
      <path d="M42 30 Q55 20 65 30" stroke="#059669" strokeWidth="2" fill="none" strokeDasharray="4 3" />
      <polygon points="65,26 70,30 65,34" fill="#059669" />
      {/* Plus icon */}
      <circle cx="56" cy="14" r="8" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
      <line x1="52" y1="14" x2="60" y2="14" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="10" x2="56" y2="18" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      {/* New project Gantt */}
      <rect x="70" y="10" width="45" height="55" rx="4" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
      <text x="92" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#059669">פרויקט חדש</text>
      <rect x="76" y="28" width="22" height="4" rx="2" fill="#34d399" />
      <rect x="82" y="36" width="18" height="4" rx="2" fill="#6ee7b7" />
      <rect x="78" y="44" width="25" height="4" rx="2" fill="#a7f3d0" />
      <rect x="85" y="52" width="15" height="4" rx="2" fill="#d1fae5" />
      {/* WBS label */}
      <rect x="5" y="58" width="30" height="14" rx="3" fill="#059669" />
      <text x="20" y="68" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">WBS</text>
    </svg>
  )
}

function EquipmentSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crane tower */}
      <rect x="30" y="15" width="4" height="60" fill="#2563eb" />
      {/* Crane arm */}
      <rect x="30" y="15" width="55" height="3" fill="#2563eb" />
      {/* Counter weight arm */}
      <rect x="15" y="15" width="19" height="3" fill="#2563eb" />
      {/* Cable */}
      <line x1="75" y1="18" x2="75" y2="40" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Hook */}
      <path d="M72 40 Q75 47 78 40" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Load */}
      <rect x="68" y="47" width="14" height="10" rx="2" fill="#93c5fd" stroke="#2563eb" strokeWidth="1" />
      {/* Base */}
      <rect x="20" y="72" width="24" height="4" rx="1" fill="#2563eb" />
      {/* Support lines */}
      <line x1="32" y1="18" x2="20" y2="72" stroke="#93c5fd" strokeWidth="1" />
      <line x1="32" y1="18" x2="44" y2="72" stroke="#93c5fd" strokeWidth="1" />
      {/* Building in background */}
      <rect x="85" y="35" width="25" height="40" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
      <rect x="90" y="42" width="5" height="5" rx="1" fill="#60a5fa" />
      <rect x="100" y="42" width="5" height="5" rx="1" fill="#60a5fa" />
      <rect x="90" y="52" width="5" height="5" rx="1" fill="#60a5fa" />
      <rect x="100" y="52" width="5" height="5" rx="1" fill="#60a5fa" />
      <rect x="90" y="62" width="5" height="5" rx="1" fill="#60a5fa" />
      <rect x="100" y="62" width="5" height="5" rx="1" fill="#60a5fa" />
    </svg>
  )
}

function BuyoutSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document stack */}
      <rect x="18" y="12" width="50" height="62" rx="4" fill="#f3e8ff" stroke="#9333ea" strokeWidth="1.5" />
      <rect x="14" y="8" width="50" height="62" rx="4" fill="#ede9fe" stroke="#9333ea" strokeWidth="1.5" />
      <rect x="10" y="4" width="50" height="62" rx="4" fill="white" stroke="#9333ea" strokeWidth="1.5" />
      {/* Lines on document */}
      <line x1="18" y1="16" x2="50" y2="16" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="24" x2="45" y2="24" stroke="#ddd6fe" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="31" x2="48" y2="31" stroke="#ddd6fe" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="38" x2="40" y2="38" stroke="#ddd6fe" strokeWidth="1.5" strokeLinecap="round" />
      {/* Price tag / shekel */}
      <circle cx="85" cy="30" r="20" fill="#f3e8ff" stroke="#9333ea" strokeWidth="1.5" />
      <text x="85" y="36" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#9333ea">₪</text>
      {/* Checkmark */}
      <circle cx="85" cy="62" r="10" fill="#9333ea" />
      <path d="M80 62 L83 65 L90 58" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DrawingsSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blueprint background */}
      <rect x="5" y="5" width="110" height="70" rx="4" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
      {/* Grid */}
      <line x1="5" y1="25" x2="115" y2="25" stroke="#bbf7d0" strokeWidth="0.5" />
      <line x1="5" y1="45" x2="115" y2="45" stroke="#bbf7d0" strokeWidth="0.5" />
      <line x1="5" y1="65" x2="115" y2="65" stroke="#bbf7d0" strokeWidth="0.5" />
      <line x1="30" y1="5" x2="30" y2="75" stroke="#bbf7d0" strokeWidth="0.5" />
      <line x1="60" y1="5" x2="60" y2="75" stroke="#bbf7d0" strokeWidth="0.5" />
      <line x1="90" y1="5" x2="90" y2="75" stroke="#bbf7d0" strokeWidth="0.5" />
      {/* Facade drawing */}
      <rect x="20" y="20" width="80" height="45" rx="1" stroke="#16a34a" strokeWidth="1.5" fill="none" />
      <rect x="30" y="28" width="15" height="15" stroke="#4ade80" strokeWidth="1" fill="#dcfce7" />
      <rect x="52" y="28" width="15" height="15" stroke="#4ade80" strokeWidth="1" fill="#dcfce7" />
      <rect x="75" y="28" width="15" height="15" stroke="#4ade80" strokeWidth="1" fill="#dcfce7" />
      <rect x="30" y="48" width="15" height="15" stroke="#4ade80" strokeWidth="1" fill="#dcfce7" />
      <rect x="52" y="48" width="15" height="15" stroke="#4ade80" strokeWidth="1" fill="#dcfce7" />
      {/* Door */}
      <rect x="75" y="48" width="15" height="17" stroke="#16a34a" strokeWidth="1.5" fill="#bbf7d0" />
      {/* Dimension line */}
      <line x1="15" y1="15" x2="15" y2="68" stroke="#16a34a" strokeWidth="1" />
      <line x1="12" y1="20" x2="18" y2="20" stroke="#16a34a" strokeWidth="1" />
      <line x1="12" y1="65" x2="18" y2="65" stroke="#16a34a" strokeWidth="1" />
    </svg>
  )
}

function MeetingsSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Table */}
      <ellipse cx="60" cy="50" rx="40" ry="12" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
      {/* People around table */}
      <circle cx="30" cy="30" r="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="60" cy="22" r="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="90" cy="30" r="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
      {/* Body shapes */}
      <path d="M22 42 Q30 38 38 42" stroke="#d97706" strokeWidth="1.5" fill="none" />
      <path d="M52 35 Q60 31 68 35" stroke="#d97706" strokeWidth="1.5" fill="none" />
      <path d="M82 42 Q90 38 98 42" stroke="#d97706" strokeWidth="1.5" fill="none" />
      {/* Speech bubble */}
      <rect x="70" y="5" width="40" height="20" rx="8" fill="white" stroke="#d97706" strokeWidth="1.5" />
      <path d="M80 25 L76 30 L84 25" fill="white" stroke="#d97706" strokeWidth="1.5" />
      <line x1="78" y1="12" x2="102" y2="12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="18" x2="95" y2="18" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
      {/* Notepad */}
      <rect x="5" y="55" width="20" height="22" rx="2" fill="white" stroke="#d97706" strokeWidth="1" />
      <line x1="10" y1="61" x2="20" y2="61" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="66" x2="18" y2="66" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="71" x2="20" y2="71" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function ProcurementSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Search magnifier */}
      <circle cx="50" cy="35" r="22" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <line x1="66" y1="51" x2="80" y2="65" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
      {/* Items inside magnifier */}
      <rect x="38" y="24" width="20" height="4" rx="2" fill="#fca5a5" />
      <rect x="38" y="32" width="16" height="4" rx="2" fill="#fecaca" />
      <rect x="38" y="40" width="22" height="4" rx="2" fill="#fca5a5" />
      {/* Shopping list */}
      <rect x="82" y="10" width="30" height="40" rx="3" fill="white" stroke="#dc2626" strokeWidth="1.5" />
      <circle cx="89" cy="20" r="2" fill="#dc2626" />
      <line x1="94" y1="20" x2="106" y2="20" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="89" cy="28" r="2" fill="#dc2626" />
      <line x1="94" y1="28" x2="104" y2="28" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="89" cy="36" r="2" fill="#fecaca" />
      <line x1="94" y1="36" x2="108" y2="36" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="89" cy="44" r="2" fill="#fecaca" />
      <line x1="94" y1="44" x2="102" y2="44" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SupplyChainSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Truck */}
      <rect x="5" y="35" width="40" height="25" rx="3" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.5" />
      <rect x="35" y="45" width="18" height="15" rx="2" fill="white" stroke="#0d9488" strokeWidth="1.5" />
      {/* Windows */}
      <rect x="38" y="48" width="10" height="7" rx="1" fill="#99f6e4" />
      {/* Wheels */}
      <circle cx="18" cy="62" r="5" fill="white" stroke="#0d9488" strokeWidth="2" />
      <circle cx="45" cy="62" r="5" fill="white" stroke="#0d9488" strokeWidth="2" />
      {/* Boxes on truck */}
      <rect x="10" y="40" width="10" height="10" rx="1" fill="#5eead4" stroke="#0d9488" strokeWidth="1" />
      <rect x="22" y="40" width="10" height="10" rx="1" fill="#2dd4bf" stroke="#0d9488" strokeWidth="1" />
      <rect x="15" y="30" width="10" height="10" rx="1" fill="#99f6e4" stroke="#0d9488" strokeWidth="1" />
      {/* Arrow path */}
      <path d="M58 50 Q70 50 75 40 Q80 30 90 30" stroke="#0d9488" strokeWidth="2" fill="none" strokeLinecap="round" />
      <polygon points="90,25 98,30 90,35" fill="#0d9488" />
      {/* Destination building */}
      <rect x="100" y="20" width="16" height="40" rx="2" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.5" />
      <rect x="104" y="26" width="4" height="4" fill="#5eead4" />
      <rect x="104" y="34" width="4" height="4" fill="#5eead4" />
      <rect x="104" y="42" width="4" height="4" fill="#5eead4" />
      <rect x="104" y="50" width="8" height="10" rx="1" fill="#14b8a6" />
    </svg>
  )
}

const MODULES = [
  {
    num: 1,
    href: 'https://terminal3-scheduler-nine.vercel.app',
    label: 'לוח זמנים — טרמינל 3',
    desc: 'Gantt, תלויות, baselines, דוחות',
    Illustration: ScheduleSvg,
    color: '#4f46e5',
    bg: '#eef2ff',
    external: true,
  },
  {
    num: 2,
    href: 'https://schedule-studio-three.vercel.app',
    label: 'לוח זמנים — סטודיו',
    desc: 'יצירת לוז חדש, יבוא אקסל, WBS',
    Illustration: ScheduleStudioSvg,
    color: '#059669',
    bg: '#ecfdf5',
    external: true,
  },
  {
    num: 3,
    href: 'https://equipment-advisor.vercel.app',
    label: 'ציוד הרמה',
    desc: 'קטלוג, המלצות, הזמנות',
    Illustration: EquipmentSvg,
    color: '#2563eb',
    bg: '#eff6ff',
    external: true,
  },
  {
    num: 4,
    href: 'https://buyout-tool.vercel.app',
    label: 'תמכור',
    desc: 'הצעות מחיר, חבילות, ספקים',
    Illustration: BuyoutSvg,
    color: '#9333ea',
    bg: '#faf5ff',
    external: true,
  },
  {
    num: 8,
    href: 'https://koreh-sd.vercel.app',
    label: 'שרטוטים',
    desc: 'צפייה בשרטוטים וחזיתות',
    Illustration: DrawingsSvg,
    color: '#16a34a',
    bg: '#f0fdf4',
    external: true,
  },
  {
    num: 7,
    href: '/meetings',
    label: 'סיכום ישיבות',
    desc: 'ישיבות צוות, החלטות, מעקב',
    Illustration: MeetingsSvg,
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    num: 6,
    href: '/procurement',
    label: 'חיפוש רכש',
    desc: 'חיפוש בהצעות מחיר',
    Illustration: ProcurementSvg,
    color: '#dc2626',
    bg: '#fef2f2',
  },
  {
    num: 5,
    href: '/supply-chain',
    label: 'שרשרת הספקה',
    desc: 'מעקב הזמנות ואספקה',
    Illustration: SupplyChainSvg,
    color: '#0d9488',
    bg: '#f0fdfa',
  },
]

export default function ModuleCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {MODULES.map(({ num, href, label, desc, Illustration, color, bg, external }) => (
        <a
          key={href}
          href={href}
          target={external ? '_blank' : '_self'}
          rel={external ? 'noopener noreferrer' : undefined}
          className="card no-underline"
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#f3f4f6',
              color: '#6b7280',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {num}
          </span>
          {external && (
            <ExternalLink
              size={14}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'var(--muted)',
                opacity: 0.4,
                zIndex: 1,
              }}
            />
          )}
          <div
            style={{
              background: bg,
              padding: '1.25rem 1rem 0.75rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ width: 140, height: 95 }}>
              <Illustration />
            </div>
          </div>
          <div style={{ padding: '0.75rem 1rem 1rem', textAlign: 'center' }}>
            <div className="font-bold text-base" style={{ color }}>{label}</div>
            <div
              className="text-xs mt-1"
              style={{ color: 'var(--muted)', lineHeight: 1.4 }}
            >
              {desc}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
