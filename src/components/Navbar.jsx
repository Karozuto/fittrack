import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
      <div style={s.logo} onClick={() => navigate('/')} title="Accueil">
        FIT<span style={{ color: '#A8FF3E' }}>TRACK</span>
      </div>
      <div style={s.links}>
        {navLinks.map(({ label, path }, i) => {
          const active = location.pathname === path
          return (
            <div key={path} style={s.linkWrap}>
              {i > 0 && <span style={s.sep} />}
              <button
                style={{ ...s.navLink, ...(active ? s.navLinkActive : {}) }}
                onClick={() => navigate(path)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#A8A8A8' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#666' }}
              >
                {label}
              </button>
            </div>
          )
        })}
      </div>
      <div style={s.right}>
        <button
          style={{ ...s.email, ...(location.pathname === '/profile' ? s.emailActive : {}) }}
          onClick={() => navigate('/profile')}
          title="Mon profil"
          onMouseEnter={e => { if (location.pathname !== '/profile') e.currentTarget.style.color = '#A8A8A8' }}
          onMouseLeave={e => { if (location.pathname !== '/profile') e.currentTarget.style.color = '#444' }}
        >
          {user?.email}
        </button>
        <button style={s.btn} onClick={handleSignOut}>
          Se déconnecter
        </button>
      </div>
    </nav>
  )
}

const s = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
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
    cursor: 'pointer',
    userSelect: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  linkWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  sep: {
    width: '1px',
    height: '14px',
    background: '#252620',
    margin: '0 0.6rem',
    flexShrink: 0,
  },
  navLink: {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    padding: '5px 12px',
    borderRadius: '6px',
    transition: 'color 0.2s, background 0.2s',
    outline: 'none',
  },
  navLinkActive: {
    color: '#A8FF3E',
    fontWeight: 600,
    background: 'rgba(168, 255, 62, 0.1)',
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
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'color 0.2s',
    outline: 'none',
  },
  emailActive: {
    color: '#A8FF3E',
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
