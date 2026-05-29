import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ExerciseSelector from './ExerciseSelector'
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
      fontSize: '10px',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      background: '#1E2320',
      color: '#A8B0A6',
      border: '1px solid #2A2E28',
      padding: '3px 10px',
      borderRadius: '4px',
      display: 'inline-block',
      flexShrink: 0,
    }}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

function MuscleTags({ muscles }) {
  if (!muscles || muscles.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {muscles.map(m => (
        <span key={m} style={{
          fontSize: '11px',
          fontFamily: "'DM Sans', sans-serif",
          background: getMuscleColor(m) + '18',
          color: getMuscleColor(m),
          padding: '2px 8px',
          borderRadius: '4px',
        }}>{m}</span>
      ))}
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
    width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto',
    padding: '1.75rem', fontFamily: "'DM Sans', sans-serif",
  },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  modalTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: '#F0F0EE', textTransform: 'uppercase', margin: 0 },
  closeBtn: { background: 'transparent', border: 'none', color: '#6B7068', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7068', marginBottom: '6px' },
  input: { width: '100%', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 14px', color: '#F0F0EE', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  divider: { border: 'none', borderTop: '1px solid #1E2320', margin: '1.25rem 0' },
  sectionTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: '#F0F0EE', margin: '0 0 1rem' },
  setRow: { background: '#0D0F0E', border: '1px solid #1E2320', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' },
  setHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  setNum: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#A8FF3E', letterSpacing: '0.05em', textTransform: 'uppercase' },
  removeBtn: { background: 'transparent', border: 'none', color: '#3A3E38', cursor: 'pointer', fontSize: '14px', padding: '2px', transition: 'color 0.15s' },
  selectedInfo: { background: '#161917', border: '1px solid #252924', borderRadius: '6px', padding: '8px 12px', marginTop: '8px' },
  numInput: { width: '100%', background: '#161917', border: '1px solid #252924', borderRadius: '5px', padding: '7px 10px', color: '#F0F0EE', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  fieldLabel: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A4E48', display: 'block', marginBottom: '4px' },
  addSetBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px dashed #252924', borderRadius: '6px', padding: '8px 14px', color: '#6B7068', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", width: '100%', justifyContent: 'center', transition: 'border-color 0.15s' },
  footer: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' },
  cancelBtn: { background: 'transparent', border: '1px solid #252924', borderRadius: '6px', padding: '10px 20px', color: '#6B7068', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' },
  saveBtn: { background: '#A8FF3E', border: 'none', borderRadius: '6px', padding: '10px 24px', color: '#0D0F0E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' },
  error: { background: '#2A1515', border: '1px solid #4A2020', borderRadius: '6px', padding: '10px 14px', color: '#FF7070', fontSize: '13px', marginBottom: '1rem' },
}

function emptySet() { return { exercise: null, reps: '', weight_kg: '' } }

function setsFromWorkout(workout) {
  const ws = workout?.workout_sets
  if (!ws || ws.length === 0) return [emptySet()]
  return ws.map(s => ({
    exercise: s.exercises || null,
    reps: s.reps != null ? String(s.reps) : '',
    weight_kg: s.weight_kg != null ? String(s.weight_kg) : '',
  }))
}

export default function CreateWorkoutModal({ onClose, onCreated, workout }) {
  const { user } = useAuth()
  const isEdit = !!workout
  const [title, setTitle] = useState(workout?.name || '')
  const [notes, setNotes] = useState(workout?.notes || '')
  const [date, setDate] = useState(
    (workout?.performed_at ? new Date(workout.performed_at) : new Date()).toISOString().split('T')[0]
  )
  const [sets, setSets] = useState(() => setsFromWorkout(workout))
  const [exercises, setExercises] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSelector, setShowSelector] = useState(false)
  const [selectorSetIndex, setSelectorSetIndex] = useState(null)

  useEffect(() => {
    supabase.from('exercises').select('id, name, exercise_type, muscle_groups').order('name')
      .then(({ data }) => setExercises(data || []))
  }, [])

  function updateSet(i, field, value) {
    setSets(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n })
  }

  function addSet() {
    setSets(prev => [...prev, emptySet()])
  }

  function removeSet(i) {
    setSets(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!title.trim()) { setError('Le titre est requis.'); return }
    if (sets.some(s => !s.exercise || !s.reps)) { setError('Sélectionne un exercice et renseigne les reps pour chaque set.'); return }
    setSaving(true); setError('')
    try {
      const payload = { name: title.trim(), notes: notes.trim() || null, performed_at: new Date(date).toISOString() }
      let workoutId

      if (isEdit) {
        const { error: wErr } = await supabase.from('workouts').update(payload).eq('id', workout.id)
        if (wErr) throw wErr
        workoutId = workout.id
        const { error: delErr } = await supabase.from('workout_sets').delete().eq('workout_id', workoutId)
        if (delErr) throw delErr
      } else {
        const { data: created, error: wErr } = await supabase
          .from('workouts')
          .insert({ user_id: user.id, ...payload })
          .select('id').single()
        if (wErr) throw wErr
        workoutId = created.id
      }

      const setsToInsert = sets.map((s, idx) => ({
        workout_id: workoutId,
        exercise_id: s.exercise.id,
        set_number: idx + 1,
        reps: parseInt(s.reps) || 0,
        weight_kg: parseFloat(s.weight_kg) || null,
      }))
      const { error: sErr } = await supabase.from('workout_sets').insert(setsToInsert)
      if (sErr) throw sErr
      onCreated({ id: workoutId })
    } catch (e) {
      setError(e.message || 'Erreur lors de la sauvegarde.')
      setSaving(false)
    }
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{isEdit ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={s.label}>Titre *</label>
          <input style={s.input} placeholder="ex : Push Day, Full Body…" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
          <div>
            <label style={s.label}>Date</label>
            <input type="date" style={s.input} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>Notes</label>
            <input style={s.input} placeholder="Optionnel…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <hr style={s.divider} />
        <p style={s.sectionTitle}>Exercices & Sets</p>

        {sets.map((set, i) => (
          <div key={i} style={s.setRow}>
            <div style={s.setHeader}>
              <span style={s.setNum}>Set {i + 1}</span>
              {sets.length > 1 && (
                <button style={s.removeBtn} onClick={() => removeSet(i)}
                  onMouseEnter={e => e.currentTarget.style.color = '#FF5757'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3A3E38'}>✕</button>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={s.fieldLabel}>Exercice *</label>
              {set.exercise ? (
                <div>
                  <div style={{
                    background: '#0D0F0E',
                    border: '1px solid #252924',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0F0EE' }}>{set.exercise.name}</span>
                      <button
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6B7068',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '2px 6px',
                        }}
                        onClick={() => updateSet(i, 'exercise', null)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div style={s.selectedInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: set.exercise.muscle_groups?.length ? '0' : '0' }}>
                      <span style={{ fontSize: '12px', color: '#6B7068' }}>Type :</span>
                      <TypeBadge type={set.exercise.exercise_type} />
                    </div>
                    {set.exercise.muscle_groups?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7068' }}>Muscles :</span>
                        <MuscleTags muscles={set.exercise.muscle_groups} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  style={{
                    width: '100%',
                    background: '#0D0F0E',
                    border: '1px solid #252924',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: '#6B7068',
                    fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    setSelectorSetIndex(i)
                    setShowSelector(true)
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#A8FF3E'
                    e.currentTarget.style.color = '#A8FF3E'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#252924'
                    e.currentTarget.style.color = '#6B7068'
                  }}
                >
                  Sélectionner un exercice…
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={s.fieldLabel}>Reps *</label>
                <input type="number" min="1" placeholder="10" style={s.numInput} value={set.reps} onChange={e => updateSet(i, 'reps', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>Poids (kg)</label>
                <input type="number" min="0" step="0.5" placeholder="60" style={s.numInput} value={set.weight_kg} onChange={e => updateSet(i, 'weight_kg', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <button style={s.addSetBtn} onClick={addSet}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#A8FF3E'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#252924'}>
          <span style={{ fontSize: '16px' }}>+</span> Ajouter un set
        </button>

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {showSelector && (
        <ExerciseSelector
          exercises={exercises}
          onSelect={ex => {
            if (selectorSetIndex !== null) {
              updateSet(selectorSetIndex, 'exercise', ex)
              setShowSelector(false)
              setSelectorSetIndex(null)
            }
          }}
          onClose={() => {
            setShowSelector(false)
            setSelectorSetIndex(null)
          }}
        />
      )}
    </div>
  )
}
