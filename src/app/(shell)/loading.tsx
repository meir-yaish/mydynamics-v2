export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border, #e6e8f0)',
          borderTopColor: 'var(--primary, #4f46e5)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}
