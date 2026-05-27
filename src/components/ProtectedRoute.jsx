import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0D0F0E',
        color: '#A8FF3E',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '14px',
        letterSpacing: '0.05em',
      }}>
        Chargement...
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return children
}
