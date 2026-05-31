import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function DuplicateWorkoutModal({ workout, onClose, onCreated }) {
  const { user } = useAuth()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function duplicate() {
    if (!date) { setError('Choisis une date.'); return }
    setSaving(true)
    setError('')
    try {
      // 1. Récupérer la séance source complète (la liste ne charge pas tous les champs).
      const { data: src, error: e0 } = await supabase
        .from('workouts')
        .select('name, notes, duration_min')
        .eq('id', workout.id)
        .single()
      if (e0) throw e0

      // 2. Créer la nouvelle séance à la date choisie.
      const { data: newW, error: e1 } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: src.name,
          notes: src.notes ?? null,
          duration_min: src.duration_min ?? null,
          performed_at: new Date(date).toISOString(),
        })
        .select('id')
        .single()
      if (e1) throw e1

      // 3. Copier les séries de la séance source.
      const { data: srcSets, error: e2 } = await supabase
        .from('workout_sets')
        .select('exercise_id, set_number, reps, weight_kg')
        .eq('workout_id', workout.id)
        .order('set_number', { ascending: true })
      if (e2) throw e2

      if (srcSets && srcSets.length > 0) {
        const copies = srcSets.map(st => ({
          workout_id: newW.id,
          exercise_id: st.exercise_id,
          set_number: st.set_number,
          reps: st.reps,
          weight_kg: st.weight_kg,
        }))
        const { error: e3 } = await supabase.from('workout_sets').insert(copies)
        if (e3) throw e3
      }

      onCreated()
    } catch (e) {
      setError(e.message || 'Erreur lors de la duplication')
      setSaving(false)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.title}>Dupliquer la séance</h2>
          <button style={s.closeBtn} onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <p style={s.sourceName}>{workout.name}</p>
        <p style={s.hint}>Une nouvelle séance sera créée à la date choisie avec les mêmes exercices et séries.</p>

        <label style={s.label}>Nouvelle date</label>
        <input
          type="date"
          style={s.input}
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        {error && <p style={s.error}>{error}</p>}

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose} disabled={saving}>Annuler</button>
          <button style={{ ...s.confirmBtn, opacity: saving ? 0.6 : 1 }} onClick={duplicate} disabled={saving}>
            {saving ? 'Duplication…' : 'Dupliquer'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: '#161917', border: '1px solid #252924', borderRadius: '12px',
    width: '100%', maxWidth: '400px', padding: '1.25rem 1.5rem', fontFamily: "'DM Sans', sans-serif",
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  title: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#F0F0EE', textTransform: 'uppercase', margin: 0 },
  closeBtn: { background: 'transparent', border: 'none', color: '#6B7068', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' },
  sourceName: {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.05rem', fontWeight: 700,
    color: '#A8FF3E', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px',
  },
  hint: { fontSize: '12px', color: '#6B7068', lineHeight: 1.5, margin: '0 0 1.25rem' },
  label: { display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7068', marginBottom: '5px' },
  input: {
    width: '100%', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px',
    padding: '9px 12px', color: '#F0F0EE', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box', colorScheme: 'dark',
  },
  error: { color: '#FF7070', fontSize: '13px', margin: '0.75rem 0 0' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
  cancelBtn: {
    background: 'transparent', border: '1px solid #252924', borderRadius: '6px', padding: '9px 16px',
    color: '#8A8E88', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', outline: 'none',
  },
  confirmBtn: {
    background: '#A8FF3E', color: '#0D0F0E', border: 'none', borderRadius: '6px', padding: '9px 18px',
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem',
    letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', outline: 'none',
  },
}
