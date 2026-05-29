import { useState } from 'react'
import ExerciseCard from './ExerciseCard'

export default function ExerciseSelector({ exercises = [], onSelect, onClose }) {
  const [query, setQuery] = useState('')

  // Valeur dérivée : pas besoin d'un effet pour filtrer (calcul pendant le rendu).
  const q = query.trim().toLowerCase()
  const filtered = q.length < 1
    ? exercises
    : exercises.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.muscle_groups || []).some(m => m.toLowerCase().includes(q)) ||
        (e.exercise_type || '').toLowerCase().includes(q)
      )

  const s = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      padding: '1rem',
    },
    modal: {
      background: '#161917',
      border: '1px solid #252924',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '900px',
      maxHeight: '90vh',
      overflowY: 'auto',
      padding: '1.75rem',
      fontFamily: "'DM Sans', sans-serif",
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
    },
    title: {
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: '1.6rem',
      fontWeight: 700,
      color: '#F0F0EE',
      textTransform: 'uppercase',
      margin: 0,
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#6B7068',
      cursor: 'pointer',
      fontSize: '20px',
      lineHeight: 1,
      padding: '4px',
    },
    searchInput: {
      width: '100%',
      background: '#0D0F0E',
      border: '1px solid #252924',
      borderRadius: '6px',
      padding: '10px 14px',
      color: '#F0F0EE',
      fontSize: '14px',
      fontFamily: "'DM Sans', sans-serif",
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: '1.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6B7068',
    },
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>Sélectionner un exercice</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          style={s.searchInput}
          placeholder="Rechercher par nom, type ou muscle…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />

        {filtered.length === 0 ? (
          <div style={s.emptyState}>
            <p style={{ margin: '0 0 8px' }}>Aucun exercice trouvé</p>
            <p style={{ margin: 0, fontSize: '13px' }}>Essaie avec un autre terme de recherche</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onSelect={ex => {
                  onSelect(ex)
                  onClose()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
