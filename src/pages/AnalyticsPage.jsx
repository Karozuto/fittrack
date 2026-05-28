import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

// ─── helpers ────────────────────────────────────────────────────────────────

function startOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

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

const MUSCLE_COLOR_MAP = {
  pectoraux: '#FF6B6B', dorsaux: '#4ECDC4', épaules: '#45B7D1',
  triceps: '#FFA07A', biceps: '#98D8C8', avant_bras: '#F7DC6F',
  abdominaux: '#BB8FCE', quadriceps: '#85C1E2', ischio_jambiers: '#F8B88B',
  mollets: '#ABEBC6', lombaires: '#F5B7B1', trapèze: '#D7BDE2',
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(17, 19, 16, 0.95)',
    border: '0.5px solid rgba(37, 38, 32, 0.5)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '12px',
    padding: '8px 10px',
  },
  labelStyle: { color: '#666', fontSize: '11px' },
}

// ─── composant ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [workoutData, setWorkoutData] = useState([])
  const [weightData, setWeightData] = useState([])
  const [nutritionData, setNutritionData] = useState([])
  const [muscleData, setMuscleData] = useState([])

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([
      fetchWorkoutTrends(),
      fetchWeightProgression(),
      fetchNutritionTrends(),
      fetchMuscleTrends(),
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

  async function fetchWeightProgression() {
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id, performed_at')
      .eq('user_id', user.id)

    if (!workouts || workouts.length === 0) {
      setWeightData([])
      return
    }

    const workoutMap = Object.fromEntries(workouts.map(w => [w.id, w]))

    const { data: sets } = await supabase
      .from('workout_sets')
      .select('weight_kg, workout_id, exercise:exercises(name)')
      .not('weight_kg', 'is', null)

    if (!sets || sets.length === 0) {
      setWeightData([])
      return
    }

    const exerciseMap = {}
    ;(sets ?? []).forEach(s => {
      const exerciseName = s.exercise?.name ?? 'Exercice'
      const workout = workoutMap[s.workout_id]
      const date = workout?.performed_at ?? new Date().toISOString()
      if (!exerciseMap[exerciseName]) {
        exerciseMap[exerciseName] = []
      }
      exerciseMap[exerciseName].push({ weight: s.weight_kg, date })
    })

    // Top 5 par volume
    const topExercises = Object.entries(exerciseMap)
      .map(([name, reps]) => ({ name, volume: reps.length }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
      .map(e => e.name)

    const weekMap = {}
    Object.entries(exerciseMap).forEach(([exerciseName, reps]) => {
      if (!topExercises.includes(exerciseName)) return

      reps.forEach(({ weight, date }) => {
        const weekNum = getWeekNumber(date)
        if (!weekMap[weekNum]) weekMap[weekNum] = {}
        if (!weekMap[weekNum][exerciseName]) weekMap[weekNum][exerciseName] = 0
        weekMap[weekNum][exerciseName] = Math.max(weekMap[weekNum][exerciseName], weight)
      })
    })

    const result = Object.entries(weekMap).map(([week, exercises]) => ({
      week,
      ...exercises,
    }))
    setWeightData(result)
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
        color: MUSCLE_COLOR_MAP[muscle] || '#999',
      }))
      .sort((a, b) => b.value - a.value)
    setMuscleData(result)
  }

  const hasData = workoutData.length > 0 || nutritionData.length > 0

  // ─── rendu ────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <main style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>Analyse et progression</h1>
          <p style={s.subtitle}>Vois ta progression au fil du temps</p>
        </div>

        {loading ? (
          <p style={s.loading}>Chargement des données…</p>
        ) : !hasData ? (
          <p style={s.empty}>Pas assez de données. Commencez à enregistrer vos données !</p>
        ) : (
          <div style={s.grid}>
            {/* Séances par semaine */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Séances par semaine</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252620" />
                  <XAxis dataKey="week" stroke="#444" />
                  <YAxis stroke="#444" />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="count" stroke="#A8FF3E" strokeWidth={2} dot={{ fill: '#A8FF3E' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Progression des poids max */}
            {weightData.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Poids max par exercice</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252620" />
                    <XAxis dataKey="week" stroke="#444" />
                    <YAxis stroke="#444" />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend />
                    {Object.keys(weightData[0] ?? {})
                      .filter(k => k !== 'week')
                      .map((exercise, i) => (
                        <Bar key={exercise} dataKey={exercise} fill={`hsl(${i * 60}, 70%, 60%)`} />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Nutrition trends */}
            {nutritionData.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Tendances nutritionnelles (28 derniers jours)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={nutritionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252620" />
                    <XAxis dataKey="date" stroke="#444" />
                    <YAxis stroke="#444" />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend />
                    <Area type="monotone" dataKey="calories" stackId="1" fill="#A8FF3E" stroke="#A8FF3E" opacity={0.7} />
                    <Area type="monotone" dataKey="protein" stackId="1" fill="#85C1E2" stroke="#85C1E2" opacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Muscle groups distribution */}
            {muscleData.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Distribution par groupe musculaire</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={muscleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#A8FF3E"
                      dataKey="value"
                    >
                      {muscleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '32px',
    fontWeight: 500,
    color: '#fff',
    fontFamily: "'Barlow Condensed', sans-serif",
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#111310',
    border: '0.5px solid #1e201d',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#A8FF3E',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '1rem',
  },
  loading: {
    color: '#444',
    fontSize: '14px',
    textAlign: 'center',
    padding: '3rem',
  },
  empty: {
    color: '#444',
    fontSize: '14px',
    textAlign: 'center',
    padding: '3rem',
    lineHeight: 1.7,
  },
}
