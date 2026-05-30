import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { TYPOGRAPHY } from '../lib/typography'
import PageLayout from '../components/PageLayout'
import {
  GRID_2COL, CARD_ROUNDED, METRIC_CARD,
  METRIC_LABEL, METRIC_VALUE, METRIC_UNIT, ROW, ROW_TITLE, ROW_META, BADGE,
  BTN_SECONDARY,
} from '../lib/commonStyles'

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
  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [hoveredBtn, setHoveredBtn] = useState(null) // 'seance' | 'repas' | null

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchWorkouts(), fetchMeals(), fetchProfile()])
    setLoading(false)
  }

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('username, target_calories, target_protein_g')
      .eq('id', user.id)
      .maybeSingle()
    setProfile(data ?? null)
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

  // Chargement initial des données (et au changement d'utilisateur).
  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ─── rendu ────────────────────────────────────────────────────────────────

  return (
    <PageLayout>
      <div>
        {/* Salutation */}
        <div style={s.greeting}>
          <p style={s.greetingSub}>{todayLabel()}</p>
          <h1 style={s.greetingName}>
            Bonjour, <span style={{ color: '#A8FF3E' }}>{profile?.username || firstNameFrom(user?.email)}</span> 💪
          </h1>
        </div>

        {/* Métriques */}
        <div style={s.metrics}>
          {[
            { lbl: 'Séances / semaine', val: metrics.seances, unit: 'cette semaine', accent: true },
            { lbl: 'Séries totales',    val: metrics.series,  unit: 'cette semaine' },
            {
              lbl: "Calories aujourd'hui",
              val: profile?.target_calories
                ? `${metrics.calories} / ${Math.round(profile.target_calories)}`
                : metrics.calories.toLocaleString('fr-FR'),
              unit: 'kcal',
            },
            {
              lbl: 'Protéines',
              val: profile?.target_protein_g
                ? `${metrics.proteines} / ${Math.round(profile.target_protein_g)}`
                : metrics.proteines,
              unit: profile?.target_protein_g ? 'g' : "g aujourd'hui",
            },
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
            <span style={s.cardTitle}>Dernières séances</span>
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
            <span style={s.cardTitle}>Repas du jour</span>
            {loading ? (
              <p style={s.empty}>Chargement…</p>
            ) : meals.length === 0 ? (
              <p style={s.empty}>Aucun repas enregistré aujourd'hui.</p>
            ) : (
              meals.map(m => (
                <div key={m.id} style={s.row}>
                  <div>
                    <p style={s.rowTitle}>{m.name}</p>
                    <p style={s.rowMeta}>{m.type}</p>
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
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            Ajouter une séance
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
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            Ajouter un repas
          </button>
        </div>
      </div>
    </PageLayout>
  )
}

// ─── styles ─────────────────────────────────────────────────────────────────

const s = {
  greeting: { marginBottom: '1rem' },
  greetingSub: {
    color: '#666',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '2px',
    fontWeight: 500,
  },
  greetingName: {
    ...TYPOGRAPHY.pageTitle,
    color: '#fff',
    fontSize: '28px',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  metricCard: {
    ...METRIC_CARD,
    padding: '12px 14px',
  },
  metricLbl: {
    ...METRIC_LABEL,
    fontSize: '10px',
    marginBottom: '4px',
  },
  metricVal: {
    ...METRIC_VALUE,
    fontSize: '24px',
  },
  metricUnit: {
    ...METRIC_UNIT,
    fontSize: '11px',
    marginTop: '2px',
  },
  grid2: GRID_2COL,
  card: {
    ...CARD_ROUNDED,
    padding: '1rem',
  },
  cardTitle: {
    ...TYPOGRAPHY.cardTitle,
    marginBottom: '12px',
    fontSize: '11px',
    display: 'block',
  },
  row: {
    ...ROW,
    padding: '8px 0',
  },
  rowTitle: {
    ...ROW_TITLE,
    fontSize: '12px',
  },
  rowMeta: {
    ...ROW_META,
    fontSize: '10px',
    marginTop: '1px',
  },
  badge: {
    ...BADGE,
    fontSize: '10px',
    padding: '2px 6px',
  },
  empty: {
    color: '#555',
    fontSize: '12px',
    textAlign: 'center',
    padding: '1rem 0',
    lineHeight: 1.6,
  },
  fab: {
    ...GRID_2COL,
    marginTop: '1.5rem',
    gap: '8px',
  },
  fabBtn: {
    ...BTN_SECONDARY,
    padding: '11px 16px',
    fontSize: '13px',
    fontWeight: 500,
    flex: 1,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
}
