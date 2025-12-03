import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          margin: '0 auto 1rem',
          backgroundColor: '#fee2e2',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            {statusCode || '?'}
          </span>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
          {statusCode === 404 ? 'Página no encontrada' : 'Error del servidor'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          {statusCode === 404
            ? 'La página que buscas no existe o ha sido movida.'
            : 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'
          }
        </p>
        <a
          href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            backgroundColor: '#eb1034',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            transition: 'background-color 0.2s',
          }}
        >
          Ir al inicio
        </a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
