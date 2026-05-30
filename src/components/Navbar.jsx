import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/auth')
  }

  const go = (path) => { setMenuOpen(false); navigate(path) }

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Séances', path: '/workouts' },
    { label: 'Nutrition', path: '/nutrition' },
    { label: 'Analyse', path: '/analytics' },
  ]

  const menuItems = [
    { label: 'Éditer le profil', icon: '👤', onClick: () => go('/profile') },
    { label: 'Sécurité', icon: '🔒', soon: true },
  ]

  return (
    <>
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
        {/* Espace réservé pour le bouton toggle (rendu en position fixe au-dessus du drawer) */}
        <div style={s.burgerSpacer} />
      </nav>

      {/* Drawer latéral droit (calque plein écran qui clippe le panneau hors-écran) */}
      <div style={{ ...s.drawerLayer, pointerEvents: menuOpen ? 'auto' : 'none' }}>
        <div
          style={{ ...s.backdrop, opacity: menuOpen ? 1 : 0 }}
          onClick={() => setMenuOpen(false)}
        />
        <aside style={{ ...s.drawer, transform: menuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={s.drawerHead}>
          <span style={s.drawerTitle}>Mon compte</span>
        </div>

        <div style={s.account}>
          <div style={s.avatar}>{(user?.email?.[0] || '?').toUpperCase()}</div>
          <div style={s.accountInfo}>
            <span style={s.accountLabel}>Connecté en tant que</span>
            <span style={s.accountEmail} title={user?.email}>{user?.email}</span>
          </div>
        </div>

        <div style={s.menuList}>
          {menuItems.map(item => (
            <button
              key={item.label}
              style={{ ...s.menuItem, ...(item.soon ? s.menuItemSoon : {}) }}
              onClick={item.onClick}
              disabled={item.soon}
            >
              <span style={s.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.soon && <span style={s.soonBadge}>Bientôt</span>}
            </button>
          ))}
        </div>

        <button style={s.signOut} onClick={handleSignOut}>
          <span style={s.menuIcon}>⏻</span>
          Se déconnecter
        </button>
        </aside>
      </div>

      {/* Bouton unique : hamburger ↔ croix (au-dessus du drawer) */}
      <button
        style={s.toggle}
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={menuOpen}
        title={menuOpen ? 'Fermer' : 'Menu'}
      >
        <span style={{ ...s.tLine, ...(menuOpen ? s.tLineTopOpen : {}) }} />
        <span style={{ ...s.tLine, ...(menuOpen ? s.tLineMidOpen : {}) }} />
        <span style={{ ...s.tLine, ...(menuOpen ? s.tLineBotOpen : {}) }} />
      </button>
    </>
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
  burgerSpacer: {
    width: '34px',
    height: '34px',
    flexShrink: 0,
  },
  toggle: {
    position: 'fixed',
    top: '9px',
    right: '2rem',
    zIndex: 202,
    width: '34px',
    height: '34px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    padding: '0 7px',
    boxSizing: 'border-box',
    background: '#111310',
    border: '1px solid #252620',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  tLine: {
    display: 'block',
    height: '2px',
    width: '100%',
    background: '#A8A8A8',
    borderRadius: '2px',
    transition: 'transform 0.25s ease, opacity 0.18s ease, background 0.2s ease',
  },
  tLineTopOpen: {
    transform: 'translateY(6px) rotate(45deg)',
    background: '#A8FF3E',
  },
  tLineMidOpen: {
    opacity: 0,
  },
  tLineBotOpen: {
    transform: 'translateY(-6px) rotate(-45deg)',
    background: '#A8FF3E',
  },
  // Drawer
  drawerLayer: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    transition: 'opacity 0.25s ease',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: '300px',
    maxWidth: '85vw',
    background: '#111310',
    borderLeft: '0.5px solid #1e201d',
    boxShadow: '-12px 0 32px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    boxSizing: 'border-box',
    transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'DM Sans', sans-serif",
  },
  drawerHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  drawerTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#A8FF3E',
  },
  account: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#0D0F0E',
    border: '1px solid #1E2320',
    borderRadius: '10px',
    marginBottom: '1.25rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(168, 255, 62, 0.12)',
    color: '#A8FF3E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    flexShrink: 0,
  },
  accountInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  accountLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6B7068',
  },
  accountEmail: {
    fontSize: '13px',
    color: '#F0F0EE',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 12px',
    color: '#F0F0EE',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  menuItemSoon: {
    color: '#6B7068',
    cursor: 'default',
  },
  menuIcon: {
    fontSize: '15px',
    width: '18px',
    textAlign: 'center',
  },
  soonBadge: {
    marginLeft: 'auto',
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6B7068',
    border: '1px solid #252620',
    borderRadius: '4px',
    padding: '2px 6px',
  },
  signOut: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    background: 'transparent',
    border: '1px solid #3A2020',
    borderRadius: '8px',
    padding: '11px 12px',
    color: '#FF7070',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background 0.15s',
  },
}
