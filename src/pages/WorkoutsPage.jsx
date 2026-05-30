import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import WorkoutCard from '../components/WorkoutCard'
import CreateWorkoutModal from '../components/CreateWorkoutModal'
import PageHeader from '../components/PageHeader'
import PageLayout from '../components/PageLayout'
import { TYPOGRAPHY } from '../lib/typography'
import { BTN_PRIMARY, GRID_3COL, CARD_ROUNDED } from '../lib/commonStyles'

const s = {
  statsWithBtn: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  statsRow: {
    ...GRID_3COL,
    gap: '8px',
    flex: 1,
    display: 'grid',
  },
  btnCreate: {
    ...BTN_PRIMARY,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minWidth: 'auto',
    padding: '0 20px',
  },
  statCard: {
    ...CARD_ROUNDED,
    padding: '12px 14px',
  },
  statLabel: {
    ...TYPOGRAPHY.label,
    fontSize: '10px',
  },
  statValue: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '22px',
    fontWeight: 600,
    color: '#fff',
    margin: '4px 0 0',
    lineHeight: 1,
  },
  statAccent: {
    color: '#A8FF3E',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 0',
    color: '#555',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  emptyTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: '#666',
    margin: '0 0 6px',
  },
  emptyText: {
    fontSize: '12px',
    color: '#777',
    margin: 0,
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gap: '10px',
  },
  cardWrap: {
    borderRadius: '8px',
    scrollMarginTop: '70px',
    transition: 'box-shadow 0.3s ease',
  },
  cardWrapHi: {
    boxShadow: '0 0 0 2px #A8FF3E',
  },
  loadingRow: {
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
  },
  skeleton: {
    background: '#161917',
    border: '1px solid #1E2320',
    borderRadius: '8px',
    height: '100px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}

export default function WorkoutsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const focusId = location.state?.focusId
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [btnHover, setBtnHover] = useState(false)
  const [highlightId, setHighlightId] = useState(null)

  useEffect(() => {
    fetchWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mise en avant + scroll vers une séance ciblée depuis l'accueil.
  useEffect(() => {
    if (!focusId || loading) return
    const el = document.getElementById(`workout-${focusId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightId(focusId)
    const t = setTimeout(() => setHighlightId(null), 2200)
    return () => clearTimeout(t)
  }, [focusId, loading])

  async function fetchWorkouts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id, name, notes, performed_at,
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

  function handleWorkoutSaved() {
    setShowModal(false)
    setEditingWorkout(null)
    fetchWorkouts()
  }

  function handleWorkoutDeleted(workoutId) {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId))
  }

  function handleEdit(workout) {
    setEditingWorkout(workout)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingWorkout(null)
  }

  const totalSets = workouts.reduce((acc, w) => acc + (w.workout_sets?.length || 0), 0)
  const thisWeek = workouts.filter(w => {
    const d = new Date(w.performed_at)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length

  return (
    <PageLayout>
      <div>
        <PageHeader eyebrow="MES SÉANCES" title="WORKOUTS" />

        <div style={s.statsWithBtn}>
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
              <div
                key={workout.id}
                id={`workout-${workout.id}`}
                style={{ ...s.cardWrap, ...(highlightId === workout.id ? s.cardWrapHi : {}) }}
              >
                <WorkoutCard
                  workout={workout}
                  onDeleted={handleWorkoutDeleted}
                  onEdit={handleEdit}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateWorkoutModal
          workout={editingWorkout}
          onClose={closeModal}
          onCreated={handleWorkoutSaved}
        />
      )}
    </PageLayout>
  )
}
