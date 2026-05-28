import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Séances', path: '/workouts' },
    { label: 'Nutrition', path: '/nutrition' },
    { label: 'Analyse', path: '/analytics' },
  ]

  return (
    <nav style={s.nav}>
      <div style={s.logo}>
        FIT<span style={{ color: '#A8FF3E' }}>TRACK</span>
      </div>
      <div style={s.links}>
        {navLinks.map(({ label, path }) => (
          <button
            key={path}
            style={s.navLink}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={s.right}>
        <span style={s.email}>{user?.email}</span>
        <button style={s.btn} onClick={handleSignOut}>
          Se déconnecter
        </button>
      </div>
    </nav>
  )
}

const s = {
  nav: {
    background: '#111310',
    borderBottom: '0.5px solid #1e201d',
    padding: '0 2rem',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'DM Sans', sans-serif",
    gap: '2rem',
  },
  logo: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '20px',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.5px',
    whiteSpace: 'nowrap',
  },
  links: {
    display: 'flex',
    gap: '0.8rem',
    flex: 1,
  },
  navLink: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    padding: '0 6px',
    transition: 'color 0.2s',
    outline: 'none',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    whiteSpace: 'nowrap',
  },
  email: {
    color: '#444',
    fontSize: '12px',
  },
  btn: {
    background: 'transparent',
    border: '0.5px solid #252620',
    borderRadius: '6px',
    color: '#555',
    fontSize: '12px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
}
