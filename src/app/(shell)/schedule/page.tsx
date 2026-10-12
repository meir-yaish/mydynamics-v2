export default function SchedulePage() {
  return (
    <div style={{ position: 'fixed', inset: 0, top: '56px' }}>
      <iframe
        src="https://terminal3-scheduler-nine.vercel.app/"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="לוח זמנים — טרמינל 3"
      />
    </div>
  )
}
