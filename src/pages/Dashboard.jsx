import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── helpers ────────────────────────────────────────────────────────────────

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function todayLabel() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function firstNameFrom(email) {
  return email?.split('@')[0] ?? 'toi'
}

// ─── composant ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [workouts,   setWorkouts]   = useState([])
  const [setsCounts, setSetsCounts] = useState({})
  const [meals,      setMeals]      = useState([])
  const [metrics,    setMetrics]    = useState({ seances: 0, series: 0, calories: 0, proteines: 0 })
  const [loading,    setLoading]    = useState(true)
  const [hoveredBtn, setHoveredBtn] = useState(null) // 'seance' | 'repas' | null

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchWorkouts(), fetchMeals()])
    setLoading(false)
  }

  async function fetchWorkouts() {
    const weekStart = startOfWeek()
    const { data: wData } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('performed_at', weekStart)
      .order('performed_at', { ascending: false })

    const workoutList = wData ?? []
    setWorkouts(workoutList)

    if (workoutList.length === 0) {
      setMetrics(m => ({ ...m, seances: 0, series: 0 }))
      return
    }

    const ids = workoutList.map(w => w.id)
    const { data: sData } = await supabase
      .from('workout_sets')
      .select('workout_id')
      .in('workout_id', ids)

    const counts = {}
    let totalSeries = 0
    ;(sData ?? []).forEach(({ workout_id }) => {
      counts[workout_id] = (counts[workout_id] ?? 0) + 1
      totalSeries++
    })

    setSetsCounts(counts)
    setMetrics(m => ({ ...m, seances: workoutList.length, series: totalSeries }))
  }

  async function fetchMeals() {
    const dayStart = startOfDay()
    const { data: mData } = await supabase
      .from('meals')
      .select('*, food_items(*)')
      .eq('user_id', user.id)
      .gte('eaten_at', dayStart)
      .order('eaten_at', { ascending: true })

    const mealList = mData ?? []
    setMeals(mealList)

    let totalKcal = 0
    let totalProt = 0
    mealList.forEach(meal => {
      ;(meal.food_items ?? []).forEach(fi => {
        totalKcal += fi.calories  ?? 0
        totalProt += fi.protein_g ?? 0
      })
    })

    setMetrics(m => ({
      ...m,
      calories:  Math.round(totalKcal),
      proteines: Math.round(totalProt),
    }))
  }

  const mealKcal = (meal) =>
    Math.round((meal.food_items ?? []).reduce((s, fi) => s + (fi.calories ?? 0), 0))

  // ─── rendu ────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <main style={s.main}>
        {/* Salutation */}
        <div style={s.greeting}>
          <p style={s.greetingSub}>{todayLabel()}</p>
          <h1 style={s.greetingName}>
            Bonjour, <span style={{ color: '#A8FF3E' }}>{firstNameFrom(user?.email)}</span> 💪
          </h1>
        </div>

        {/* Métriques */}
        <div style={s.metrics}>
          {[
            { lbl: 'Séances / semaine', val: metrics.seances, unit: 'cette semaine', accent: true },
            { lbl: 'Séries totales',    val: metrics.series,  unit: 'cette semaine' },
            { lbl: "Calories aujourd'hui", val: metrics.calories.toLocaleString('fr-FR'), unit: 'kcal' },
            { lbl: 'Protéines',         val: metrics.proteines, unit: "g aujourd'hui" },
          ].map(({ lbl, val, unit, accent }) => (
            <div key={lbl} style={s.metricCard}>
              <p style={s.metricLbl}>{lbl}</p>
              <p style={{ ...s.metricVal, ...(accent ? { color: '#A8FF3E' } : {}) }}>{loading ? '—' : val}</p>
              <p style={s.metricUnit}>{unit}</p>
            </div>
          ))}
        </div>

        {/* Grille principale */}
        <div style={s.grid2}>
          {/* Séances */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Dernières séances</span>
              <button style={s.cardAction} onClick={() => navigate('/workouts')}>
                + Nouvelle séance
              </button>
            </div>
            {loading ? (
              <p style={s.empty}>Chargement…</p>
            ) : workouts.length === 0 ? (
              <p style={s.empty}>Aucune séance cette semaine.<br />Lance-toi !</p>
            ) : (
              workouts.slice(0, 5).map(w => (
                <div key={w.id} style={s.row}>
                  <div>
                    <p style={s.rowTitle}>{w.name}</p>
                    <p style={s.rowMeta}>
                      {formatDate(w.performed_at)}
                      {w.duration_min ? ` · ${w.duration_min} min` : ''}
                    </p>
                  </div>
                  <span style={s.badge}>
                    {setsCounts[w.id] ?? 0} série{(setsCounts[w.id] ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Repas */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Repas du jour</span>
              <button style={s.cardAction} onClick={() => navigate('/nutrition')}>
                + Ajouter un repas
              </button>
            </div>
            {loading ? (
              <p style={s.empty}>Chargement…</p>
            ) : meals.length === 0 ? (
              <p style={s.empty}>Aucun repas enregistré aujourd'hui.</p>
            ) : (
              meals.map(m => (
                <div key={m.id} style={s.row}>
                  <div>
                    <p style={s.rowTitle}>{m.name}</p>
                    <p style={s.rowMeta}>{formatTime(m.eaten_at)}</p>
                  </div>
                  <span style={{ ...s.badge, color: '#A8FF3E', borderColor: 'rgba(168,255,62,0.15)' }}>
                    {mealKcal(m)} kcal
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div style={s.fab}>
          <button
            style={{
              ...s.fabBtn,
              background: hoveredBtn === 'seance' ? '#A8FF3E' : 'transparent',
              color:      hoveredBtn === 'seance' ? '#0D0F0E' : '#A8FF3E',
            }}
            onMouseEnter={() => setHoveredBtn('seance')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/workouts')}
          >
            + Ajouter une séance
          </button>
          <button
            style={{
              ...s.fabBtn,
              background: hoveredBtn === 'repas' ? '#A8FF3E' : 'transparent',
              color:      hoveredBtn === 'repas' ? '#0D0F0E' : '#A8FF3E',
            }}
            onMouseEnter={() => setHoveredBtn('repas')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/nutrition')}
          >
            + Ajouter un repas
          </button>
        </div>
      </main>
    </div>
  )
}

// ─── styles ─────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    background: '#0D0F0E',
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    padding: '2rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  greeting: { marginBottom: '1.5rem' },
  greetingSub: {
    color: '#444',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
  },
  greetingName: {
    fontSize: '28px',
    fontWeight: 500,
    color: '#fff',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '1.5rem',
  },
  metricCard: {
    background: '#111310',
    border: '0.5px solid #1e201d',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  metricLbl: {
    color: '#444',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  },
  metricVal: {
    fontSize: '28px',
    fontWeight: 500,
    color: '#fff',
    lineHeight: 1,
  },
  metricUnit: {
    fontSize: '12px',
    color: '#555',
    marginTop: '4px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  card: {
    background: '#111310',
    border: '0.5px solid #1e201d',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  cardAction: {
    fontSize: '12px',
    color: '#A8FF3E',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '0.5px solid #1a1c19',
  },
  rowTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff',
  },
  rowMeta: {
    fontSize: '11px',
    color: '#444',
    marginTop: '2px',
  },
  badge: {
    fontSize: '11px',
    color: '#555',
    background: '#0D0F0E',
    border: '0.5px solid #252620',
    borderRadius: '5px',
    padding: '3px 8px',
    whiteSpace: 'nowrap',
  },
  empty: {
    color: '#333',
    fontSize: '12px',
    textAlign: 'center',
    padding: '1.5rem 0',
    lineHeight: 1.7,
  },
  fab: {
    display: 'flex',
    gap: '8px',
    marginTop: '1.5rem',
  },
  fabBtn: {
    flex: 1,
    border: '1px solid #A8FF3E',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s, color 0.2s',
    outline: 'none',
  },
}
