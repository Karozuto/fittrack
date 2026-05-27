import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import WorkoutCard from '../components/WorkoutCard'
import CreateWorkoutModal from '../components/CreateWorkoutModal'

const s = {
  page: {
    minHeight: '100vh',
    background: '#0D0F0E',
    padding: '2rem 1.5rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  inner: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  titleBlock: {},
  eyebrow: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#A8FF3E',
    margin: '0 0 4px',
  },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '2.8rem',
    fontWeight: 700,
    color: '#F0F0EE',
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
    lineHeight: 1,
    margin: 0,
  },
  btnCreate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#A8FF3E',
    color: '#0D0F0E',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    flexShrink: 0,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#161917',
    border: '1px solid #1E2320',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
  },
  statLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    color: '#6B7068',
    margin: '0 0 4px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '2rem',
    fontWeight: 700,
    color: '#F0F0EE',
    margin: 0,
    lineHeight: 1,
  },
  statAccent: {
    color: '#A8FF3E',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6B7068',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#3A3E38',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#4A4E48',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gap: '12px',
  },
  loadingRow: {
    display: 'flex',
    gap: '12px',
    flexDirection: 'column',
  },
  skeleton: {
    background: '#161917',
    border: '1px solid #1E2320',
    borderRadius: '8px',
    height: '120px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}

export default function WorkoutsPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id, title, notes, performed_at,
        workout_sets (
          id, reps, weight_kg,
          exercises ( id, name, exercise_type, muscle_groups )
        )
      `)
      .eq('user_id', user.id)
      .order('performed_at', { ascending: false })

    if (!error) setWorkouts(data || [])
    setLoading(false)
  }

  function handleWorkoutCreated(newWorkout) {
    setShowModal(false)
    fetchWorkouts()
  }

  function handleWorkoutDeleted(workoutId) {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId))
  }

  const totalSets = workouts.reduce((acc, w) => acc + (w.workout_sets?.length || 0), 0)
  const thisWeek = workouts.filter(w => {
    const d = new Date(w.performed_at)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length

  return (
    <div style={s.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={s.inner}>
        <div style={s.header}>
          <div style={s.titleBlock}>
            <p style={s.eyebrow}>Mes séances</p>
            <h1 style={s.title}>Workouts</h1>
          </div>
          <button
            style={{ ...s.btnCreate, opacity: btnHover ? 0.85 : 1 }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={() => setShowModal(true)}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
            Nouvelle séance
          </button>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total séances</p>
            <p style={s.statValue}>
              <span style={s.statAccent}>{workouts.length}</span>
            </p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>Cette semaine</p>
            <p style={s.statValue}>
              <span style={s.statAccent}>{thisWeek}</span>
            </p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>Sets totaux</p>
            <p style={s.statValue}>
              <span style={s.statAccent}>{totalSets}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div style={s.loadingRow}>
            {[1, 2, 3].map(i => (
              <div key={i} style={s.skeleton} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🏋️</div>
            <p style={s.emptyTitle}>Aucune séance encore</p>
            <p style={s.emptyText}>Crée ta première séance pour commencer à tracker tes progrès.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {workouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onDeleted={handleWorkoutDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateWorkoutModal
          onClose={() => setShowModal(false)}
          onCreated={handleWorkoutCreated}
        />
      )}
    </div>
  )
}
