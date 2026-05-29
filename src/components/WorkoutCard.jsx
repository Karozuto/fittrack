import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getMuscleColor } from '../lib/muscleColors'

const TYPE_LABELS = {
  polyarticulaire: 'Polyarticulaire',
  isolation: 'Isolation',
  cardio: 'Cardio',
  gainage: 'Gainage',
  mobilité: 'Mobilité',
}

function TypeBadge({ type }) {
  if (!type) return null
  return (
    <span style={{
      fontSize: '9px',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      background: '#1E2320',
      color: '#A8B0A6',
      border: '1px solid #2A2E28',
      padding: '1px 7px',
      borderRadius: '4px',
      flexShrink: 0,
      lineHeight: 1.4,
    }}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

const Divider = () => (
  <div style={{ width: '1px', height: '14px', background: '#2A2E28', flexShrink: 0 }} />
)

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupSetsByExercise(sets) {
  const map = {}
  for (const set of sets || []) {
    const name = set.exercises?.name || 'Exercice inconnu'
    if (!map[name]) map[name] = { name, exercise: set.exercises, sets: [] }
    map[name].sets.push(set)
  }
  return Object.values(map)
}

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

export default function WorkoutCard({ workout, onDeleted, onEdit }) {
  const [hover, setHover] = useState(false)
  const [delHover, setDelHover] = useState(false)
  const [editHover, setEditHover] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const exerciseGroups = groupSetsByExercise(workout.workout_sets)

  // Tous les muscles uniques de la séance
  const allMuscles = [...new Set(
    exerciseGroups.flatMap(eg => eg.exercise?.muscle_groups || [])
  )]

  async function handleDelete() {
    if (!window.confirm(`Supprimer "${workout.name}" ?`)) return
    await supabase.from('workout_sets').delete().eq('workout_id', workout.id)
    await supabase.from('workouts').delete().eq('id', workout.id)
    onDeleted(workout.id)
  }

  return (
    <div
      style={{
        background: '#161917',
        border: `1px solid ${hover ? '#2A2E28' : '#1E2320'}`,
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Header */}
      <div style={{ marginBottom: expanded ? 0 : '0.5rem', transition: 'margin-bottom 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            style={{
              width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1E2320',
              border: '1px solid #2A2E28',
              borderRadius: '7px',
              color: '#A8FF3E',
              fontSize: '11px', lineHeight: 1,
              cursor: 'pointer', transition: 'all 0.15s', padding: 0, flexShrink: 0,
              marginRight: '8px',
            }}
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Replier' : 'Déplier'}
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
          </button>
          <div onClick={() => setExpanded(e => !e)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8FF3E', margin: '0 0 2px' }}>
              {formatDate(workout.performed_at)}
            </p>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#F0F0EE', textTransform: 'uppercase', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
              {workout.name}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: editHover ? '#A8FF3E18' : '#1E2320',
                border: `1px solid ${editHover ? '#A8FF3E' : '#2A2E28'}`,
                borderRadius: '7px',
                color: editHover ? '#A8FF3E' : '#8A8E88',
                cursor: 'pointer', transition: 'all 0.15s', padding: 0,
              }}
              onMouseEnter={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
              onClick={() => onEdit(workout)}
              title="Modifier"
            ><PencilIcon /></button>
            <button
              style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: delHover ? '#FF575718' : '#1E2320',
                border: `1px solid ${delHover ? '#FF5757' : '#2A2E28'}`,
                borderRadius: '7px',
                color: delHover ? '#FF5757' : '#8A8E88',
                cursor: 'pointer', transition: 'all 0.15s', padding: 0,
              }}
              onMouseEnter={() => setDelHover(true)}
              onMouseLeave={() => setDelHover(false)}
              onClick={handleDelete}
              title="Supprimer"
            ><TrashIcon /></button>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        opacity: expanded ? 1 : 0,
        transition: 'grid-template-rows 0.3s ease, opacity 0.25s ease',
      }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{ paddingTop: '0.75rem' }}>
      {workout.notes && (
        <p style={{ fontSize: '13px', color: '#4A4E48', fontStyle: 'italic', margin: '0 0 0.75rem' }}>{workout.notes}</p>
      )}

      {/* Liste exercices */}
      {exerciseGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
          {exerciseGroups.map(eg => (
            <div key={eg.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                {/* Nom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getMuscleColor(eg.exercise?.muscle_groups?.[0]), flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, color: '#F0F0EE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {eg.name}
                  </span>
                </div>
                {/* Type */}
                {eg.exercise?.exercise_type && (
                  <>
                    <Divider />
                    <TypeBadge type={eg.exercise.exercise_type} />
                  </>
                )}
                {/* Muscles */}
                {eg.exercise?.muscle_groups?.length > 0 && (
                  <>
                    <Divider />
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      {eg.exercise.muscle_groups.map(m => (
                        <span key={m} style={{ fontSize: '10px', color: getMuscleColor(m), background: getMuscleColor(m) + '18', padding: '1px 6px', borderRadius: '3px', fontFamily: "'DM Sans', sans-serif" }}>{m}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {(() => {
                const maxW = Math.max(...eg.sets.map(s => s.weight_kg || 0))
                const reps = eg.sets[0]?.reps || '?'
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {/* Reps */}
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 700, color: '#C8CBC6', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                      {eg.sets.length}<span style={{ color: '#6B7068', margin: '0 1px' }}>×</span>{reps}
                      <span style={{ fontSize: '11px', color: '#6B7068', marginLeft: '3px' }}>reps</span>
                    </span>
                    {/* Poids */}
                    {maxW > 0 && (
                      <>
                        <Divider />
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em',
                          color: '#A8FF3E', background: '#A8FF3E15',
                          border: '1px solid #A8FF3E33',
                          padding: '1px 8px', borderRadius: '5px', whiteSpace: 'nowrap',
                        }}>
                          {maxW} kg
                        </span>
                      </>
                    )}
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      )}

          </div>
        </div>
      </div>

      {/* Recap muscles — toujours visible, même replié */}
      {allMuscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '0.75rem', borderTop: '1px solid #1E2320' }}>
          {allMuscles.slice(0, 8).map(m => (
            <span key={m} style={{ fontSize: '10px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: getMuscleColor(m), background: getMuscleColor(m) + '15', padding: '2px 8px', borderRadius: '4px' }}>
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
