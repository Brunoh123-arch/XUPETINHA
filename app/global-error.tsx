'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          margin: 0,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Algo deu errado
          </h2>
          <button
            onClick={reset}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
