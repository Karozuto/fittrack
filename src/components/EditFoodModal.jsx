import { useState } from 'react'
import { supabase } from '../lib/supabase'
import NumberStepper from './NumberStepper'

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#A8FF3E', step: '1' },
  { key: 'protein_g', label: 'Protéines', unit: 'g', color: '#3EE0FF', step: '0.1' },
  { key: 'carbohydrates_g', label: 'Glucides', unit: 'g', color: '#FFD93E', step: '0.1' },
  { key: 'fat_g', label: 'Lipides', unit: 'g', color: '#FF5757', step: '0.1' },
]

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: '#161917', border: '1px solid #252924', borderRadius: '12px',
    width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto',
    padding: '1.25rem 1.5rem', fontFamily: "'DM Sans', sans-serif",
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  title: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#F0F0EE', textTransform: 'uppercase', margin: 0 },
  closeBtn: { background: 'transparent', border: 'none', color: '#6B7068', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' },
  field: { marginBottom: '0.9rem' },
  label: { display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7068', marginBottom: '5px' },
  input: { width: '100%', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '8px 12px', color: '#F0F0EE', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' },
  select: { width: '90px', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '8px 10px', color: '#F0F0EE', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  footer: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' },
  cancelBtn: { background: 'transparent', border: '1px solid #252924', borderRadius: '6px', padding: '10px 20px', color: '#6B7068', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' },
  saveBtn: { background: '#A8FF3E', border: 'none', borderRadius: '6px', padding: '10px 24px', color: '#0D0F0E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' },
  error: { background: '#2A1515', border: '1px solid #4A2020', borderRadius: '6px', padding: '10px 14px', color: '#FF7070', fontSize: '13px', marginBottom: '1rem' },
  productName: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#A8FF3E', margin: '0 0 0.9rem' },
  hint: { fontSize: '11px', color: '#6B7068', margin: '0 0 6px' },
  previewBox: { background: '#0D0F0E', border: '1px solid #1E2320', borderRadius: '6px', padding: '8px 10px' },
  previewLabel: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' },
  previewValue: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700 },
}

export default function EditFoodModal({ item, onClose, onSaved }) {
  // Aliment issu de la recherche/code-barre (a un code-barre) → macros verrouillées,
  // on n'édite que la quantité (les macros sont recalculées proportionnellement).
  const isFromSearch = !!item.barcode
  const oldQty = item.quantity_g
  const canScale = isFromSearch && oldQty != null && oldQty > 0
  const editMacros = !canScale // saisie manuelle des macros si pas d'échelle possible

  // Base "pour 100" pour recalculer les macros quand la quantité change.
  const per100 = canScale
    ? {
        calories: (item.calories || 0) * 100 / oldQty,
        protein_g: (item.protein_g || 0) * 100 / oldQty,
        carbohydrates_g: (item.carbohydrates_g || 0) * 100 / oldQty,
        fat_g: (item.fat_g || 0) * 100 / oldQty,
      }
    : null

  const [name, setName] = useState(item.product_name || item.name || '')
  const [quantity, setQuantity] = useState(item.quantity_g != null ? String(item.quantity_g) : '')
  const [unit, setUnit] = useState(item.quantity_unit || 'g')
  const [values, setValues] = useState({
    calories: item.calories != null ? String(item.calories) : '',
    protein_g: item.protein_g != null ? String(item.protein_g) : '',
    carbohydrates_g: item.carbohydrates_g != null ? String(item.carbohydrates_g) : '',
    fat_g: item.fat_g != null ? String(item.fat_g) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const qtyNum = parseFloat(quantity) || 0
  const preview = per100
    ? {
        calories: Math.round(per100.calories * qtyNum / 100),
        protein_g: Math.round(per100.protein_g * qtyNum / 100 * 10) / 10,
        carbohydrates_g: Math.round(per100.carbohydrates_g * qtyNum / 100 * 10) / 10,
        fat_g: Math.round(per100.fat_g * qtyNum / 100 * 10) / 10,
      }
    : null

  async function handleSave() {
    if (editMacros && !name.trim()) { setError('Le nom est requis.'); return }
    setSaving(true); setError('')
    try {
      const update = {
        quantity_g: parseFloat(quantity) || null,
        quantity_unit: unit,
      }
      if (editMacros) {
        update.name = name.trim()
        update.product_name = name.trim()
        update.calories = Math.round(parseFloat(values.calories) || 0)
        update.protein_g = Math.round((parseFloat(values.protein_g) || 0) * 10) / 10
        update.carbohydrates_g = Math.round((parseFloat(values.carbohydrates_g) || 0) * 10) / 10
        update.fat_g = Math.round((parseFloat(values.fat_g) || 0) * 10) / 10
      } else {
        update.calories = preview.calories
        update.protein_g = preview.protein_g
        update.carbohydrates_g = preview.carbohydrates_g
        update.fat_g = preview.fat_g
      }
      const { error: err } = await supabase.from('food_items').update(update).eq('id', item.id)
      if (err) throw err
      onSaved()
    } catch (e) {
      setError(e.message || 'Erreur lors de la sauvegarde.')
      setSaving(false)
    }
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="no-scrollbar" style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>Modifier l'aliment</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {editMacros ? (
          <div style={s.field}>
            <label style={s.label}>Nom de l'aliment</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
        ) : (
          <p style={s.productName}>{item.product_name || item.name || 'Produit'}</p>
        )}

        <div style={s.field}>
          <label style={s.label}>Quantité</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <NumberStepper
              value={quantity}
              onChange={setQuantity}
              step={unit === 'unité' ? 1 : 10}
              placeholder="100"
              autoFocus={!editMacros}
            />
            <select style={s.select} value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="g">g</option>
              <option value="ml">ml</option>
              {editMacros && <option value="unité">unités</option>}
            </select>
          </div>
        </div>

        {editMacros ? (
          <div style={s.grid}>
            {MACROS.map(m => (
              <div key={m.key} style={s.field}>
                <label style={{ ...s.label, color: m.color }}>{m.label} ({m.unit})</label>
                <NumberStepper
                  value={values[m.key]}
                  onChange={val => setValues(v => ({ ...v, [m.key]: val }))}
                  step={m.key === 'calories' ? 10 : 1}
                  accent={m.color + '55'}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p style={s.hint}>Macros recalculées automatiquement selon la quantité.</p>
            <div style={s.grid}>
              {MACROS.map(m => (
                <div key={m.key} style={s.previewBox}>
                  <div style={{ ...s.previewLabel, color: m.color }}>{m.label}</div>
                  <div style={{ ...s.previewValue, color: m.color }}>
                    {preview[m.key]} {m.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
