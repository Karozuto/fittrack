import { useState } from 'react'
import { supabase } from '../lib/supabase'

const MUSCLE_COLOR_MAP = {
  pectoraux:          '#3EE0FF',
  'pectoraux haut':   '#3EE0FF',
  'pectoraux bas':    '#3EE0FF',
  triceps:            '#FF9B3E',
  épaules:            '#C03EFF',
  'épaules antérieur':'#C03EFF',
  'épaules médial':   '#C03EFF',
  'épaules postérieur':'#C03EFF',
  'grand dorsal':     '#A8FF3E',
  rhomboïdes:         '#A8FF3E',
  trapèzes:           '#A8FF3E',
  'érecteurs du rachis':'#A8FF3E',
  biceps:             '#FF3E7A',
  brachial:           '#FF3E7A',
  'brachio-radial':   '#FF3E7A',
  quadriceps:         '#FFD93E',
  fessiers:           '#FF9B3E',
  'ischio-jambiers':  '#FFD93E',
  gastrocnémiens:     '#FFD93E',
  soléaire:           '#FFD93E',
  abdominaux:         '#3EFFB0',
  obliques:           '#3EFFB0',
  transverse:         '#3EFFB0',
  'cardio-vasculaire':'#FF5757',
  'full body':        '#A8FF3E',
}

function getMuscleColor(m) {
  return MUSCLE_COLOR_MAP[m?.toLowerCase()] || '#6B7068'
}

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

export default function WorkoutCard({ workout, onDeleted }) {
  const [hover, setHover] = useState(false)
  const [delHover, setDelHover] = useState(false)

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

  function summarizeSets(sets) {
    const maxW = Math.max(...sets.map(s => s.weight_kg || 0))
    const txt = `${sets.length} × ${sets[0]?.reps || '?'} reps`
    return maxW > 0 ? `${txt} · ${maxW} kg` : txt
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8FF3E', margin: '0 0 4px' }}>
            {formatDate(workout.performed_at)}
          </p>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#F0F0EE', textTransform: 'uppercase', margin: 0 }}>
            {workout.name}
          </h2>
        </div>
        <button
          style={{ background: 'transparent', border: 'none', color: delHover ? '#FF5757' : '#3A3E38', cursor: 'pointer', fontSize: '16px', padding: '4px', transition: 'color 0.15s', lineHeight: 1 }}
          onMouseEnter={() => setDelHover(true)}
          onMouseLeave={() => setDelHover(false)}
          onClick={handleDelete}
          title="Supprimer"
        >✕</button>
      </div>

      {workout.notes && (
        <p style={{ fontSize: '13px', color: '#4A4E48', fontStyle: 'italic', margin: '0 0 0.75rem' }}>{workout.notes}</p>
      )}

      {/* Liste exercices */}
      {exerciseGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
          {exerciseGroups.map(eg => (
            <div key={eg.name} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getMuscleColor(eg.exercise?.muscle_groups?.[0]), flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#C8CBC6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {eg.name}
                  </span>
                </div>
                {eg.exercise?.muscle_groups?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '3px', marginLeft: '12px' }}>
                    {eg.exercise.muscle_groups.map(m => (
                      <span key={m} style={{ fontSize: '10px', color: getMuscleColor(m), background: getMuscleColor(m) + '18', padding: '1px 6px', borderRadius: '3px', fontFamily: "'DM Sans', sans-serif" }}>{m}</span>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', color: '#6B7068', flexShrink: 0, marginTop: '1px' }}>
                {summarizeSets(eg.sets)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer muscles */}
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
