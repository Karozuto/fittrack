import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const [tab, setTab]         = useState('login')   // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (tab === 'login') {
        await signIn({ email, password })
        navigate('/')
      } else {
        await signUp({ email, password })
        setSuccess('Compte créé ! Vérifie ton email pour confirmer.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Panneau gauche — branding */}
      <div style={styles.left}>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <p style={styles.credit}>par Karozuto</p>
        <div style={styles.logo}>
          FIT<span style={{ color: '#A8FF3E' }}>TRACK</span>
        </div>
        <p style={styles.tagline}>Ton entraînement. Ton rythme.</p>

      </div>

      {/* Panneau droit — formulaire */}
      <div style={styles.right}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={styles.formTitle}>
            {tab === 'login' ? 'Connexion' : 'Inscription'}
          </h1>
          <p style={styles.formSub}>
            {tab === 'login'
              ? <>Pas encore inscrit ?{' '}<button style={styles.link} onClick={() => setTab('register')}>Créer un compte</button></>
              : <>Déjà un compte ?{' '}<button style={styles.link} onClick={() => setTab('login')}>Se connecter</button></>
            }
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}
            >
              {t === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="toi@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error   && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.successMsg}>{success}</p>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter →' : "Créer mon compte →"}
          </button>
        </form>

        <div style={styles.sep}><span style={{ background: '#111310', padding: '0 10px' }}>ou</span></div>

        <button style={styles.oauth} onClick={handleGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <p style={styles.footer}>En continuant, tu acceptes nos CGU</p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0D0F0E',
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    flex: 1,
    background: '#0D0F0E',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: '#A8FF3E',
    opacity: 0.06,
    top: '-120px',
    left: '-120px',
  },
  circle2: {
    position: 'absolute',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    border: '1px solid #A8FF3E',
    opacity: 0.1,
    bottom: '80px',
    left: '60px',
  },
  logo: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '72px',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1,
    letterSpacing: '-2px',
  },
  tagline: {
    color: '#444',
    fontSize: '13px',
    marginTop: '8px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  credit: {
    color: '#2e3028',
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: '0 0 1.5rem',
  },

  right: {
    width: '380px',
    minHeight: '100vh',
    background: '#111310',
    borderLeft: '0.5px solid #1e201d',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '3rem 2.5rem',
  },
  formTitle: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 500,
    margin: 0,
  },
  formSub: {
    color: '#444',
    fontSize: '13px',
    marginTop: '6px',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#A8FF3E',
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
  },
  tabs: {
    display: 'flex',
    background: '#0D0F0E',
    borderRadius: '8px',
    padding: '3px',
    marginBottom: '1.5rem',
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    fontSize: '13px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    color: '#555',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },
  tabActive: {
    background: '#A8FF3E',
    color: '#0D0F0E',
    fontWeight: 500,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#555',
    marginBottom: '5px',
    letterSpacing: '0.03em',
  },
  input: {
    width: '100%',
    background: '#0D0F0E',
    border: '0.5px solid #252620',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  btn: {
    width: '100%',
    background: '#A8FF3E',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    color: '#0D0F0E',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '4px',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.15s',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '12px',
    margin: '0 0 10px',
    background: 'rgba(255,107,107,0.08)',
    border: '0.5px solid rgba(255,107,107,0.2)',
    borderRadius: '6px',
    padding: '8px 12px',
  },
  successMsg: {
    color: '#A8FF3E',
    fontSize: '12px',
    margin: '0 0 10px',
    background: 'rgba(168,255,62,0.06)',
    border: '0.5px solid rgba(168,255,62,0.2)',
    borderRadius: '6px',
    padding: '8px 12px',
  },
  sep: {
    textAlign: 'center',
    color: '#2a2c28',
    fontSize: '12px',
    margin: '16px 0',
    borderTop: '0.5px solid #1e201d',
    position: 'relative',
    top: '8px',
  },
  oauth: {
    width: '100%',
    background: 'transparent',
    border: '0.5px solid #252620',
    borderRadius: '8px',
    padding: '11px',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    marginTop: '16px',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '2rem',
    fontSize: '11px',
    color: '#2a2c28',
    textAlign: 'center',
  },
}
