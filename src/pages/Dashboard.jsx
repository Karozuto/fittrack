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

const TARGET_KEYS = ['target_calories', 'target_protein_g', 'target_carbs_g', 'target_fat_g']

// ─── composant ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [workouts,    setWorkouts]    = useState([])
  const [setsCounts,  setSetsCounts]  = useState({})
  const [recentMeals, setRecentMeals] = useState([])
  const [todayMacros, setTodayMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [metrics,     setMetrics]     = useState({ seances: 0, series: 0 })
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [hoveredBtn,  setHoveredBtn]  = useState(null) // 'seance' | 'repas' | null

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchWorkouts(), fetchTodayMacros(), fetchRecentMeals(), fetchProfile()])
    setLoading(false)
  }

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('username, target_calories, target_protein_g, target_carbs_g, target_fat_g')
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

  // Macros consommées aujourd'hui (pour les objectifs).
  async function fetchTodayMacros() {
    const dayStart = startOfDay()
    const { data } = await supabase
      .from('meals')
      .select('food_items(calories, protein_g, carbohydrates_g, fat_g)')
      .eq('user_id', user.id)
      .gte('eaten_at', dayStart)

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ;(data ?? []).forEach(meal => {
      ;(meal.food_items ?? []).forEach(fi => {
        totals.calories += fi.calories ?? 0
        totals.protein  += fi.protein_g ?? 0
        totals.carbs    += fi.carbohydrates_g ?? 0
        totals.fat      += fi.fat_g ?? 0
      })
    })
    setTodayMacros(totals)
  }

  // 3 derniers repas enregistrés (toutes dates confondues).
  async function fetchRecentMeals() {
    const { data } = await supabase
      .from('meals')
      .select('id, name, type, eaten_at, food_items(calories)')
      .eq('user_id', user.id)
      .order('eaten_at', { ascending: false })
      .limit(3)
    setRecentMeals(data ?? [])
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

  // ─── dérivés ──────────────────────────────────────────────────────────────

  const hasAnyTarget = TARGET_KEYS.some(k => profile?.[k] != null && profile[k] > 0)
  const objStats = [
    { key: 'calories', label: 'Calories', value: todayMacros.calories, target: profile?.target_calories,  unit: '',  color: '#A8FF3E' },
    { key: 'protein',  label: 'Protéines', value: todayMacros.protein, target: profile?.target_protein_g, unit: 'g', color: '#3EE0FF' },
    { key: 'carbs',    label: 'Glucides',  value: todayMacros.carbs,   target: profile?.target_carbs_g,   unit: 'g', color: '#FFD93E' },
    { key: 'fat',      label: 'Lipides',   value: todayMacros.fat,     target: profile?.target_fat_g,     unit: 'g', color: '#FF8A5C' },
  ]

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

        {/* Objectifs du jour — mis en avant */}
        <div style={s.objCard}>
          <div style={s.objHead}>
            <span style={s.objTitle}>Objectifs du jour</span>
            <button style={s.objLink} onClick={() => navigate(hasAnyTarget ? '/nutrition' : '/profile')}>
              {hasAnyTarget ? 'Détail →' : 'Configurer →'}
            </button>
          </div>

          {hasAnyTarget ? (
            <div style={s.objGrid}>
              {objStats.map((m, i) => {
                const val = Math.round(m.value)
                const hasT = m.target != null && m.target > 0
                const over = hasT && m.value > m.target
                const pct = hasT ? Math.min(100, (m.value / m.target) * 100) : 0
                return (
                  <div key={m.key} style={{ ...s.objItem, ...(i > 0 ? s.objItemBorder : {}) }}>
                    <span style={s.objLabel}>{m.label}</span>
                    <span style={s.objValue}>
                      {loading ? '—' : val}
                      {hasT
                        ? <span style={s.objTarget}> / {Math.round(m.target)}{m.unit}</span>
                        : (m.unit && <span style={s.objTarget}>{m.unit}</span>)}
                    </span>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: over ? '#FF5757' : m.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={s.objEmpty}>
              <p style={s.objEmptyText}>Définis tes objectifs nutritionnels pour suivre ta progression chaque jour.</p>
              <button style={s.objCtaBtn} onClick={() => navigate('/profile')}>Définir mes objectifs</button>
            </div>
          )}
        </div>

        {/* Métriques séances */}
        <div style={s.metrics}>
          {[
            { lbl: 'Séances / semaine', val: metrics.seances, unit: 'cette semaine', accent: true },
            { lbl: 'Séries totales',    val: metrics.series,  unit: 'cette semaine' },
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
              workouts.slice(0, 3).map(w => (
                <div key={w.id} style={s.row}>
                  <div style={s.rowMain}>
                    <p style={s.rowTitle}>{w.name}</p>
                    <p style={s.rowMeta}>
                      {formatDate(w.performed_at)}
                      {w.duration_min ? ` · ${w.duration_min} min` : ''}
                    </p>
                  </div>
                  <div style={s.rowRight}>
                    <span style={s.badge}>
                      {setsCounts[w.id] ?? 0} série{(setsCounts[w.id] ?? 0) !== 1 ? 's' : ''}
                    </span>
                    <button
                      style={s.goBtn}
                      title="Voir la séance"
                      aria-label="Voir la séance"
                      onClick={() => navigate('/workouts', { state: { focusId: w.id } })}
                      onMouseEnter={e => { e.currentTarget.style.color = '#A8FF3E'; e.currentTarget.style.borderColor = '#A8FF3E' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6B7068'; e.currentTarget.style.borderColor = '#252620' }}
                    >
                      ›
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Repas */}
          <div style={s.card}>
            <span style={s.cardTitle}>Derniers repas</span>
            {loading ? (
              <p style={s.empty}>Chargement…</p>
            ) : recentMeals.length === 0 ? (
              <p style={s.empty}>Aucun repas enregistré pour le moment.</p>
            ) : (
              recentMeals.map(m => (
                <div key={m.id} style={s.row}>
                  <div style={s.rowMain}>
                    <p style={s.rowTitle}>{m.name}</p>
                    <p style={s.rowMeta}>{formatDate(m.eaten_at)} · {m.type}</p>
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
  greeting: { marginBottom: '1.25rem' },
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

  // Objectifs (mis en avant)
  objCard: {
    ...CARD_ROUNDED,
    border: '1px solid rgba(168, 255, 62, 0.22)',
    background: 'linear-gradient(180deg, rgba(168,255,62,0.04), rgba(168,255,62,0) 60%), #111310',
    padding: '1rem 1.1rem',
    marginBottom: '1.5rem',
  },
  objHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  objTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#A8FF3E',
  },
  objLink: {
    background: 'transparent',
    border: 'none',
    color: '#8A8E88',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
  },
  objGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  objItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0 16px',
  },
  objItemBorder: {
    borderLeft: '1px solid #252924',
  },
  objLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#6B7068',
  },
  objValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#F0F0EE',
    lineHeight: 1,
  },
  objTarget: {
    fontSize: '0.8rem',
    color: '#6B7068',
    fontWeight: 700,
  },
  barTrack: {
    height: '5px',
    borderRadius: '3px',
    background: '#252924',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  objEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  objEmptyText: {
    fontSize: '13px',
    color: '#8A8E88',
    margin: 0,
    lineHeight: 1.5,
    flex: 1,
    minWidth: '180px',
  },
  objCtaBtn: {
    background: '#A8FF3E',
    color: '#0D0F0E',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
  rowMain: {
    minWidth: 0,
  },
  rowRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  goBtn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid #252620',
    borderRadius: '6px',
    color: '#6B7068',
    fontSize: '16px',
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'color 0.15s, border-color 0.15s',
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
