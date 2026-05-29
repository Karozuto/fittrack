import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { TYPOGRAPHY } from '../lib/typography'
import PageHeader from '../components/PageHeader'
import PageLayout from '../components/PageLayout'
import { CARD_ROUNDED } from '../lib/commonStyles'
import { getMuscleColor } from '../lib/muscleColors'

// ─── helpers ────────────────────────────────────────────────────────────────

function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `S${weekNum}`
}

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    color: '#F0F0EE',
    fontSize: '12px',
    padding: '8px 12px',
  },
  labelStyle: { color: '#A8FF3E', fontSize: '11px', fontWeight: 600 },
}

// Titre d'axe Y (vertical). side: 'left' (par défaut) ou 'right' pour un double axe.
function yAxisLabel(value, color = '#8A8E88', side = 'left') {
  return {
    value,
    angle: side === 'left' ? -90 : 90,
    position: side === 'left' ? 'insideLeft' : 'insideRight',
    style: {
      fill: color,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textAnchor: 'middle',
    },
  }
}

// ─── dropdown custom ────────────────────────────────────────────────────────

function ExerciseDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={dd.wrap}>
      <button
        style={{ ...dd.trigger, borderColor: open ? '#A8FF3E' : '#252924' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={dd.triggerText}>{value}</span>
        <span style={{ ...dd.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && (
        <div style={dd.menu}>
          {options.map(name => {
            const active = name === value
            return (
              <button
                key={name}
                style={{ ...dd.item, ...(active ? dd.itemActive : null) }}
                onClick={() => { onChange(name); setOpen(false) }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1E2320' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const dd = {
  wrap: { position: 'relative', minWidth: '180px', maxWidth: '60%' },
  trigger: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
    width: '100%', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px',
    padding: '8px 12px', color: '#F0F0EE', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'border-color 0.15s', outline: 'none',
  },
  triggerText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chevron: { color: '#A8FF3E', fontSize: '10px', transition: 'transform 0.15s', flexShrink: 0 },
  menu: {
    position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0, zIndex: 20,
    background: '#161917', border: '1px solid #252924', borderRadius: '8px',
    padding: '4px', maxHeight: '172px', overflowY: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  item: {
    display: 'block', width: '100%', textAlign: 'left', background: 'transparent',
    border: 'none', borderRadius: '5px', padding: '8px 10px', color: '#C8CBC6',
    fontSize: '12px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
    transition: 'background 0.12s',
  },
  itemActive: { background: '#A8FF3E18', color: '#A8FF3E', fontWeight: 600 },
}

// ─── composant ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('workouts')
  const [loading, setLoading] = useState(true)
  const [workoutData, setWorkoutData] = useState([])
  const [exerciseStats, setExerciseStats] = useState({})
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [nutritionData, setNutritionData] = useState([])
  const [muscleData, setMuscleData] = useState([])
  const [macroData, setMacroData] = useState([])
  const [mealCalData, setMealCalData] = useState([])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([
      fetchWorkoutTrends(),
      fetchExerciseProgression(),
      fetchNutritionTrends(),
      fetchMuscleTrends(),
      fetchNutritionBreakdown(),
    ])
    setLoading(false)
  }

  async function fetchWorkoutTrends() {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    const { data } = await supabase
      .from('workouts')
      .select('performed_at')
      .eq('user_id', user.id)
      .gte('performed_at', twoMonthsAgo.toISOString())
      .order('performed_at')

    const weekMap = {}
    ;(data ?? []).forEach(w => {
      const weekNum = getWeekNumber(w.performed_at)
      weekMap[weekNum] = (weekMap[weekNum] ?? 0) + 1
    })

    const result = Object.entries(weekMap).map(([week, count]) => ({ week, count }))
    setWorkoutData(result)
  }

  async function fetchExerciseProgression() {
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id, performed_at')
      .eq('user_id', user.id)

    if (!workouts || workouts.length === 0) {
      setExerciseStats({}); setExerciseOptions([])
      return
    }

    const workoutDates = Object.fromEntries(workouts.map(w => [w.id, w.performed_at]))

    const { data: sets } = await supabase
      .from('workout_sets')
      .select('weight_kg, reps, workout_id, exercise:exercises(name)')
      .in('workout_id', workouts.map(w => w.id))

    if (!sets || sets.length === 0) {
      setExerciseStats({}); setExerciseOptions([])
      return
    }

    // exerciseName → { sessionDate → meilleur set (poids max) }
    const byExercise = {}
    sets.forEach(s => {
      const name = s.exercise?.name
      const date = workoutDates[s.workout_id]
      if (!name || !date) return
      if (!byExercise[name]) byExercise[name] = {}
      const w = s.weight_kg ?? 0
      const current = byExercise[name][date]
      if (!current || w > current.weight) {
        byExercise[name][date] = { weight: w, reps: s.reps ?? 0 }
      }
    })

    const stats = {}
    Object.entries(byExercise).forEach(([name, sessions]) => {
      stats[name] = Object.entries(sessions)
        .map(([date, v]) => ({ date: formatDateFr(date), weight: v.weight, reps: v.reps, ts: new Date(date).getTime() }))
        .sort((a, b) => a.ts - b.ts)
    })

    const options = Object.keys(stats).sort((a, b) => stats[b].length - stats[a].length)
    setExerciseStats(stats)
    setExerciseOptions(options)
    setSelectedExercise(prev => (prev && stats[prev]) ? prev : (options[0] ?? ''))
  }

  async function fetchNutritionTrends() {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const { data } = await supabase
      .from('meals')
      .select('eaten_at, food_items(calories, protein_g)')
      .eq('user_id', user.id)
      .gte('eaten_at', fourWeeksAgo.toISOString())
      .order('eaten_at')

    const dayMap = {}
    ;(data ?? []).forEach(meal => {
      const date = formatDateFr(meal.eaten_at)
      if (!dayMap[date]) dayMap[date] = { calories: 0, protein: 0 }

      ;(meal.food_items ?? []).forEach(fi => {
        dayMap[date].calories += fi.calories ?? 0
        dayMap[date].protein += fi.protein_g ?? 0
      })
    })

    const result = Object.entries(dayMap).map(([date, { calories, protein }]) => ({
      date,
      calories: Math.round(calories),
      protein: Math.round(protein),
    }))
    setNutritionData(result)
  }

  async function fetchMuscleTrends() {
    // Fetch all workouts for this user first
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', user.id)

    if (!workouts || workouts.length === 0) {
      setMuscleData([])
      return
    }

    const workoutIds = workouts.map(w => w.id)

    // Then fetch all sets for these workouts
    const { data: sets } = await supabase
      .from('workout_sets')
      .select('exercise:exercises(muscle_groups)')
      .in('workout_id', workoutIds)

    const muscleMap = {}
    ;(sets ?? []).forEach(s => {
      const groups = s.exercise?.muscle_groups ?? []
      groups.forEach(muscle => {
        if (muscle && muscle.trim()) {
          muscleMap[muscle] = (muscleMap[muscle] ?? 0) + 1
        }
      })
    })

    const result = Object.entries(muscleMap)
      .map(([muscle, count]) => ({
        name: muscle,
        value: count,
        color: getMuscleColor(muscle),
      }))
      .sort((a, b) => b.value - a.value)
    setMuscleData(result)
  }

  async function fetchNutritionBreakdown() {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const { data } = await supabase
      .from('meals')
      .select('type, food_items(calories, protein_g, carbohydrates_g, fat_g)')
      .eq('user_id', user.id)
      .gte('eaten_at', fourWeeksAgo.toISOString())

    let protein = 0, carbs = 0, fat = 0
    const mealCal = {}
    ;(data ?? []).forEach(meal => {
      ;(meal.food_items ?? []).forEach(fi => {
        protein += fi.protein_g ?? 0
        carbs += fi.carbohydrates_g ?? 0
        fat += fi.fat_g ?? 0
        if (meal.type) mealCal[meal.type] = (mealCal[meal.type] ?? 0) + (fi.calories ?? 0)
      })
    })

    setMacroData(
      [
        { name: 'Protéines', value: Math.round(protein), color: '#3EE0FF' },
        { name: 'Glucides', value: Math.round(carbs), color: '#FFD93E' },
        { name: 'Lipides', value: Math.round(fat), color: '#FF5757' },
      ].filter(m => m.value > 0)
    )

    const MEAL_ORDER = ['Petit-déjeuner', 'Déjeuner', 'Encas', 'Dîner']
    const MEAL_COLORS = {
      'Petit-déjeuner': '#FFD93E',
      'Déjeuner': '#A8FF3E',
      'Encas': '#3EE0FF',
      'Dîner': '#C03EFF',
    }
    setMealCalData(
      MEAL_ORDER
        .filter(t => mealCal[t])
        .map(t => ({ name: t, calories: Math.round(mealCal[t]), color: MEAL_COLORS[t] }))
    )
  }

  // Chargement initial des données (et au changement d'utilisateur).
  // fetchAll appelle setLoading en interne : pattern de fetch-on-mount légitime.
  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const workoutHasData = workoutData.length > 0 || exerciseOptions.length > 0 || muscleData.length > 0
  const nutritionHasData = nutritionData.length > 0 || macroData.length > 0 || mealCalData.length > 0

  // ─── rendu ────────────────────────────────────────────────────────────────

  return (
    <PageLayout>
      <style>{`
        .recharts-wrapper, .recharts-wrapper * { outline: none !important; user-select: none; }
        .recharts-wrapper *:focus, .recharts-wrapper *:focus-visible { outline: none !important; }
      `}</style>
      <div>
        <PageHeader eyebrow="ANALYSE" title="PROGRESSION" />

        <div style={s.tabs}>
          <div
            role="button"
            style={{ ...s.tab, ...(tab === 'workouts' ? s.tabActive : null) }}
            onClick={() => setTab('workouts')}
          >Workouts</div>
          <div
            role="button"
            style={{ ...s.tab, ...(tab === 'nutrition' ? s.tabActive : null) }}
            onClick={() => setTab('nutrition')}
          >Nutrition</div>
        </div>

        {loading ? (
          <p style={s.loading}>Chargement des données…</p>
        ) : tab === 'workouts' ? (
          !workoutHasData ? (
            <p style={s.empty}>Pas assez de données. Enregistrez des séances pour voir vos progrès !</p>
          ) : (
            <div style={s.grid}>
              {/* Évolution poids & reps par exercice */}
              {exerciseOptions.length > 0 && (
                <div style={s.cardFull}>
                  <div style={s.cardHeader}>
                    <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Évolution par exercice</h3>
                    <ExerciseDropdown
                      options={exerciseOptions}
                      value={selectedExercise}
                      onChange={setSelectedExercise}
                    />
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={exerciseStats[selectedExercise] ?? []} margin={{ top: 20, right: 18, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0" stroke="transparent" vertical={false} />
                      <XAxis dataKey="date" stroke="#555" fontSize={12} />
                      <YAxis yAxisId="weight" stroke="#555" fontSize={12} label={yAxisLabel('POIDS (KG)', '#A8FF3E', 'left')} />
                      <YAxis yAxisId="reps" orientation="right" stroke="#555" fontSize={12} label={yAxisLabel('REPS', '#3EE0FF', 'right')} />
                      <Tooltip {...TOOLTIP_STYLE} cursor={{ stroke: 'rgba(168, 255, 62, 0.1)', strokeWidth: 1 }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line yAxisId="weight" type="linear" dataKey="weight" name="Poids (kg)" stroke="#A8FF3E" strokeWidth={2.5} dot={{ fill: '#A8FF3E', r: 4 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                      <Line yAxisId="reps" type="linear" dataKey="reps" name="Reps" stroke="#3EE0FF" strokeWidth={2.5} dot={{ fill: '#3EE0FF', r: 4 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Séances par semaine */}
              <div style={s.card}>
                <h3 style={s.cardTitle}>Séances par semaine</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={workoutData} margin={{ top: 20, right: 10, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="transparent" vertical={false} />
                    <XAxis dataKey="week" stroke="#555" fontSize={12} />
                    <YAxis stroke="#555" fontSize={12} allowDecimals={false} label={yAxisLabel('SÉANCES', '#A8FF3E', 'left')} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={{ stroke: 'rgba(168, 255, 62, 0.1)', strokeWidth: 1 }} />
                    <Line type="linear" dataKey="count" name="Séances" stroke="#A8FF3E" strokeWidth={2.5} dot={{ fill: '#A8FF3E', r: 4 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Distribution par groupe musculaire (nb de sets) */}
              {muscleData.length > 0 && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Distribution par groupe musculaire</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={muscleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name }) => name}
                        outerRadius={75}
                        fill="#A8FF3E"
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {muscleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const total = muscleData.reduce((sum, m) => sum + m.value, 0)
                          const pct = total ? ((payload[0].value / total) * 100).toFixed(0) : 0
                          const color = payload[0].payload?.color || '#F0F0EE'
                          return (
                            <div style={{ ...TOOLTIP_STYLE.contentStyle, color, fontWeight: 700 }}>{pct}%</div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )
        ) : (
          !nutritionHasData ? (
            <p style={s.empty}>Pas assez de données. Enregistrez vos repas pour voir vos tendances !</p>
          ) : (
            <div style={s.grid}>
              {/* Tendances nutritionnelles */}
              {nutritionData.length > 0 && (
                <div style={s.cardFull}>
                  <h3 style={s.cardTitle}>Tendances nutritionnelles (28 derniers jours)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={nutritionData} margin={{ top: 20, right: 18, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0" stroke="transparent" vertical={false} />
                      <XAxis dataKey="date" stroke="#555" fontSize={12} />
                      <YAxis yAxisId="cal" stroke="#555" fontSize={12} label={yAxisLabel('CALORIES (KCAL)', '#A8FF3E', 'left')} />
                      <YAxis yAxisId="prot" orientation="right" stroke="#555" fontSize={12} label={yAxisLabel('PROTÉINES (G)', '#3EE0FF', 'right')} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area yAxisId="cal" type="monotone" dataKey="calories" name="Calories" fill="#A8FF3E" stroke="#A8FF3E" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                      <Area yAxisId="prot" type="monotone" dataKey="protein" name="Protéines (g)" fill="#3EE0FF" stroke="#3EE0FF" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Répartition des macros */}
              {macroData.length > 0 && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Répartition des macros (28 jours)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name }) => name}
                        outerRadius={75}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`macro-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const total = macroData.reduce((sum, m) => sum + m.value, 0)
                          const pct = total ? ((payload[0].value / total) * 100).toFixed(0) : 0
                          const color = payload[0].payload?.color || '#F0F0EE'
                          return (
                            <div style={{ ...TOOLTIP_STYLE.contentStyle, color, fontWeight: 700 }}>
                              {payload[0].value} g · {pct}%
                            </div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Calories par type de repas */}
              {mealCalData.length > 0 && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Calories par type de repas (28 jours)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={mealCalData} margin={{ top: 20, right: 10, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0" stroke="transparent" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" fontSize={11} />
                      <YAxis stroke="#555" fontSize={12} label={yAxisLabel('CALORIES (KCAL)', '#8A8E88', 'left')} />
                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <div style={TOOLTIP_STYLE.contentStyle}>
                              <div style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: 2 }}>{d.name}</div>
                              <div style={{ color: d.color, fontWeight: 700 }}>{d.calories} kcal</div>
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="calories" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                        {mealCalData.map((entry, index) => (
                          <Cell key={`mc-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </PageLayout>
  )
}

// ─── styles ─────────────────────────────────────────────────────────────────

const s = {
  tabs: {
    display: 'flex',
    gap: '6px',
    marginBottom: '1.25rem',
  },
  tab: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8A8E88',
    background: '#161917',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: '8px',
    padding: '8px 20px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  tabActive: {
    color: '#0D0F0E',
    background: '#A8FF3E',
    borderColor: '#A8FF3E',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  card: {
    ...CARD_ROUNDED,
    padding: '1.2rem',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'default',
    outline: 'none',
  },
  cardFull: {
    ...CARD_ROUNDED,
    padding: '1.2rem',
    gridColumn: '1 / -1',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'default',
    outline: 'none',
  },
  cardTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: '#A8FF3E',
    fontSize: '11px',
    marginBottom: '1rem',
    fontWeight: 700,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '1rem',
  },
  loading: {
    color: '#666',
    fontSize: '13px',
    textAlign: 'center',
    padding: '2rem',
  },
  empty: {
    color: '#666',
    fontSize: '13px',
    textAlign: 'center',
    padding: '2rem 1rem',
    lineHeight: 1.6,
  },
}
