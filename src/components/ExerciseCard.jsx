import { useState } from 'react'
import MuscleVisualization from './MuscleVisualization'

const TYPE_LABELS = {
  polyarticulaire: 'Polyarticulaire',
  isolation: 'Isolation',
  cardio: 'Cardio',
  gainage: 'Gainage',
  mobilité: 'Mobilité',
}

const TYPE_COLORS = {
  polyarticulaire: { bg: '#A8FF3E18', text: '#A8FF3E' },
  isolation: { bg: '#3EE0FF18', text: '#3EE0FF' },
  cardio: { bg: '#FF9B3E18', text: '#FF9B3E' },
  gainage: { bg: '#C03EFF18', text: '#C03EFF' },
  mobilité: { bg: '#FFD93E18', text: '#FFD93E' },
}

function TypeBadge({ type }) {
  if (!type) return null
  const c = TYPE_COLORS[type] || { bg: '#ffffff18', text: '#aaa' }
  return (
    <span style={{
      fontSize: '10px',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: c.bg,
      color: c.text,
      padding: '2px 8px',
      borderRadius: '4px',
      display: 'inline-block',
    }}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

export default function ExerciseCard({ exercise, onSelect }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      style={{
        background: '#161917',
        border: hover ? '1px solid #A8FF3E' : '1px solid #252924',
        borderRadius: '8px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '280px',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(exercise)}
    >
      {/* Muscle Visualization */}
      <div style={{ marginBottom: '1rem' }}>
        <MuscleVisualization muscles={exercise.muscle_groups || []} size={100} />
      </div>

      {/* Exercise Info */}
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#F0F0EE',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {exercise.name}
          </h3>
          <TypeBadge type={exercise.exercise_type} />
        </div>

        {/* Muscles */}
        {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              justifyContent: 'center',
            }}>
              {exercise.muscle_groups.map(muscle => (
                <span
                  key={muscle}
                  style={{
                    fontSize: '10px',
                    fontFamily: "'DM Sans', sans-serif",
                    background: '#0D0F0E',
                    color: '#8A8E88',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid #1E2320',
                  }}
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover Button */}
      {hover && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 10, 9, 0.8)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(2px)',
        }}>
          <button
            style={{
              background: '#A8FF3E',
              color: '#0D0F0E',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
            onClick={e => {
              e.stopPropagation()
              onSelect(exercise)
            }}
          >
            Sélectionner
          </button>
        </div>
      )}
    </div>
  )
}
