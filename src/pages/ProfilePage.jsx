import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'
import NumberStepper from '../components/NumberStepper'
import { CARD_ROUNDED, BTN_PRIMARY, ERROR_MESSAGE } from '../lib/commonStyles'

const GOALS = [
  { key: 'perte', label: 'Perte de poids' },
  { key: 'maintien', label: 'Maintien' },
  { key: 'prise', label: 'Prise de masse' },
]

const SEXES = [
  { key: 'homme', label: 'Homme' },
  { key: 'femme', label: 'Femme' },
]

// Niveaux d'activité (facteur appliqué au BMR) — non persisté, sert au calcul auto.
const ACTIVITIES = [
  { key: 1.2, label: 'Sédentaire' },
  { key: 1.375, label: 'Léger' },
  { key: 1.55, label: 'Modéré' },
  { key: 1.725, label: 'Actif' },
  { key: 1.9, label: 'Très actif' },
]

const GOAL_FACTOR = { perte: 0.85, maintien: 1, prise: 1.1 }

// BMR Mifflin-St Jeor → cibles macros. Renvoie null si données insuffisantes.
function computeTargets({ sex, age, weight, height, goal, activity }) {
  const a = parseFloat(age)
  const w = parseFloat(weight)
  const h = parseFloat(height)
  if (!a || !w || !h) return null

  const bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'femme' ? -161 : 5)
  const calories = Math.round(bmr * activity * (GOAL_FACTOR[goal] ?? 1))
  const protein = Math.round((goal === 'perte' ? 2.2 : 2) * w)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))

  return { calories, protein, carbs, fat }
}

export default function ProfilePage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [activity, setActivity] = useState(1.55)

  const [form, setForm] = useState({
    username: '', sex: '', age: '', weight: '', height: '', goal: 'maintien',
    target_calories: '', target_protein_g: '', target_carbs_g: '', target_fat_g: '',
  })

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function fetchProfile() {
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('username, sex, age, weight, height, goal, target_calories, target_protein_g, target_carbs_g, target_fat_g')
        .eq('id', user.id)
        .maybeSingle()
      if (err) throw err
      if (data) {
        setForm({
          username: data.username ?? '',
          sex: data.sex ?? '',
          age: data.age != null ? String(data.age) : '',
          weight: data.weight != null ? String(data.weight) : '',
          height: data.height != null ? String(data.height) : '',
          goal: data.goal ?? 'maintien',
          target_calories: data.target_calories != null ? String(data.target_calories) : '',
          target_protein_g: data.target_protein_g != null ? String(data.target_protein_g) : '',
          target_carbs_g: data.target_carbs_g != null ? String(data.target_carbs_g) : '',
          target_fat_g: data.target_fat_g != null ? String(data.target_fat_g) : '',
        })
      }
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement du profil')
    }
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const num = v => (v === '' || v == null ? null : parseFloat(v))
      const payload = {
        id: user.id,
        username: form.username.trim() || null,
        sex: form.sex || null,
        age: num(form.age),
        weight: num(form.weight),
        height: num(form.height),
        goal: form.goal || null,
        target_calories: num(form.target_calories),
        target_protein_g: num(form.target_protein_g),
        target_carbs_g: num(form.target_carbs_g),
        target_fat_g: num(form.target_fat_g),
      }
      const { error: err } = await supabase.from('profiles').upsert(payload)
      if (err) throw err
      setSaved(true)
    } catch (e) {
      setError(e.message || "Erreur lors de l'enregistrement")
    }
    setSaving(false)
  }

  function autoCalc() {
    const t = computeTargets({
      sex: form.sex, age: form.age, weight: form.weight, height: form.height,
      goal: form.goal, activity,
    })
    if (!t) {
      setError('Renseigne âge, poids et taille pour le calcul automatique.')
      return
    }
    setError('')
    setSaved(false)
    setForm(f => ({
      ...f,
      target_calories: String(t.calories),
      target_protein_g: String(t.protein),
      target_carbs_g: String(t.carbs),
      target_fat_g: String(t.fat),
    }))
  }

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // IMC dérivé
  const w = parseFloat(form.weight)
  const h = parseFloat(form.height)
  const bmi = w && h ? w / Math.pow(h / 100, 2) : null

  return (
    <PageLayout>
      <div>
        <PageHeader eyebrow="PROFIL" title="MES INFOS" />

        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <p style={s.loading}>Chargement…</p>
        ) : (
          <div style={s.stack}>
            {/* Identité */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Identité</h3>

              <label style={s.label}>Nom d'utilisateur</label>
              <input
                style={s.input}
                value={form.username}
                placeholder="Ton pseudo"
                onChange={e => setField('username', e.target.value)}
              />

              <label style={s.label}>Sexe</label>
              <div style={s.segment}>
                {SEXES.map(o => (
                  <button
                    key={o.key}
                    type="button"
                    style={{ ...s.segBtn, ...(form.sex === o.key ? s.segBtnActive : {}) }}
                    onClick={() => setField('sex', o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div style={s.grid3}>
                <div>
                  <label style={s.label}>Âge</label>
                  <NumberStepper value={form.age} onChange={v => setField('age', v)} step={1} min={0} placeholder="25" />
                </div>
                <div>
                  <label style={s.label}>Poids (kg)</label>
                  <NumberStepper value={form.weight} onChange={v => setField('weight', v)} step={0.5} min={0} placeholder="70" />
                </div>
                <div>
                  <label style={s.label}>Taille (cm)</label>
                  <NumberStepper value={form.height} onChange={v => setField('height', v)} step={1} min={0} placeholder="175" />
                </div>
              </div>

              <label style={s.label}>Objectif</label>
              <div style={s.segment}>
                {GOALS.map(o => (
                  <button
                    key={o.key}
                    type="button"
                    style={{ ...s.segBtn, ...(form.goal === o.key ? s.segBtnActive : {}) }}
                    onClick={() => setField('goal', o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              {bmi && (
                <p style={s.bmi}>
                  IMC&nbsp;: <span style={s.bmiValue}>{bmi.toFixed(1)}</span>
                  <span style={s.bmiCat}> · {bmiCategory(bmi)}</span>
                </p>
              )}
            </div>

            {/* Objectifs nutritionnels */}
            <div style={s.card}>
              <div style={s.cardHead}>
                <h3 style={s.cardTitle}>Objectifs nutritionnels</h3>
                <button type="button" style={s.autoBtn} onClick={autoCalc}>Calculer auto</button>
              </div>

              <label style={s.label}>Niveau d'activité (pour le calcul auto)</label>
              <div style={s.segmentWrap}>
                {ACTIVITIES.map(o => (
                  <button
                    key={o.key}
                    type="button"
                    style={{ ...s.segBtnSm, ...(activity === o.key ? s.segBtnActive : {}) }}
                    onClick={() => setActivity(o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div style={s.grid2}>
                <div>
                  <label style={s.label}>Calories (kcal)</label>
                  <NumberStepper value={form.target_calories} onChange={v => setField('target_calories', v)} step={10} min={0} placeholder="2000" accent="#A8FF3E55" />
                </div>
                <div>
                  <label style={s.label}>Protéines (g)</label>
                  <NumberStepper value={form.target_protein_g} onChange={v => setField('target_protein_g', v)} step={5} min={0} placeholder="150" accent="#3EE0FF55" />
                </div>
                <div>
                  <label style={s.label}>Glucides (g)</label>
                  <NumberStepper value={form.target_carbs_g} onChange={v => setField('target_carbs_g', v)} step={5} min={0} placeholder="220" accent="#FFD93E55" />
                </div>
                <div>
                  <label style={s.label}>Lipides (g)</label>
                  <NumberStepper value={form.target_fat_g} onChange={v => setField('target_fat_g', v)} step={5} min={0} placeholder="60" accent="#FF8A5C55" />
                </div>
              </div>
            </div>

            <div style={s.actions}>
              {saved && <span style={s.savedMsg}>✓ Enregistré</span>}
              <button style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Maigreur'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Surpoids'
  return 'Obésité'
}

const s = {
  stack: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { ...CARD_ROUNDED, padding: '1.25rem' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' },
  cardTitle: {
    fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A8FF3E', margin: '0 0 1rem',
  },
  label: {
    display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: '#6B7068', margin: '0 0 6px',
  },
  input: {
    width: '100%', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px',
    padding: '9px 12px', color: '#F0F0EE', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box', marginBottom: '1rem',
  },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  segment: { display: 'flex', gap: '8px', marginBottom: '1rem' },
  segmentWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' },
  segBtn: {
    flex: 1, background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px',
    padding: '9px 12px', color: '#8A8E88', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  segBtnSm: {
    background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px',
    padding: '7px 12px', color: '#8A8E88', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  segBtnActive: {
    background: 'rgba(168, 255, 62, 0.1)', borderColor: '#A8FF3E', color: '#A8FF3E', fontWeight: 600,
  },
  bmi: { fontSize: '13px', color: '#8A8E88', margin: '0.25rem 0 0' },
  bmiValue: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F0F0EE' },
  bmiCat: { color: '#6B7068' },
  autoBtn: {
    background: 'transparent', border: '1px solid #252924', borderRadius: '6px', padding: '6px 12px',
    color: '#A8FF3E', fontSize: '12px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
    marginBottom: '1rem',
  },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' },
  savedMsg: { color: '#A8FF3E', fontSize: '13px', fontWeight: 500 },
  saveBtn: { ...BTN_PRIMARY, padding: '10px 20px' },
  error: { ...ERROR_MESSAGE, fontSize: '13px' },
  loading: { color: '#6B7068', fontSize: '14px', textAlign: 'center', padding: '3rem' },
}
