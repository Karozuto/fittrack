import { useState } from 'react'
import { supabase } from '../lib/supabase'

function formatQuantity(qty, unit) {
  if (qty == null || qty === '') return null
  const u = unit || 'g'
  if (u === 'unité') return `× ${qty}`
  return `${qty} ${u}`
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

const s = {
  section: {
    background: '#161917',
    border: '1px solid #252924',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chevronBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1E2320',
    border: '1px solid #2A2E28',
    borderRadius: '7px',
    color: '#A8FF3E',
    fontSize: '10px',
    lineHeight: 1,
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
    flexShrink: 0,
  },
  header: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#F0F0EE',
    textTransform: 'uppercase',
    margin: 0,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  foodsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  foodItem: {
    background: '#0D0F0E',
    border: '1px solid #1E2320',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  foodName: {
    flex: '0 1 auto',
    minWidth: '60px',
    maxWidth: '180px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: '#F0F0EE',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  vDivider: {
    width: '1px',
    alignSelf: 'stretch',
    background: '#1E2320',
    flexShrink: 0,
  },
  foodMacros: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    flexShrink: 1,
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
  },
  spacer: {
    flex: 1,
    minWidth: '8px',
  },
  foodActions: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  editBtn: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1E2320',
    border: '1px solid #2A2E28',
    borderRadius: '7px',
    color: '#8A8E88',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
  },
  macroChip: {
    padding: '3px 9px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  deleteBtn: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1E2320',
    border: '1px solid #2A2E28',
    borderRadius: '7px',
    color: '#8A8E88',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
  },
  sectionTotal: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #252924',
    display: 'flex',
    alignItems: 'center',
  },
  totalItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '5px',
    padding: '0 6px',
  },
  totalLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#6B7068',
  },
  totalValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#A8FF3E',
    lineHeight: 1,
  },
  totalUnit: {
    fontSize: '0.8rem',
    color: '#6B7068',
    fontWeight: 700,
  },
  vSepSm: {
    width: '1px',
    height: '14px',
    background: '#252924',
    flexShrink: 0,
  },
  emptyMessage: {
    fontSize: '13px',
    color: '#6B7068',
    fontStyle: 'italic',
    padding: '1rem 0',
  },
}

export default function MealSection({ type, meals, onMealDeleted, onEditFood }) {
  const [deleting, setDeleting] = useState(null)
  const [expanded, setExpanded] = useState(false)

  async function deleteFood(itemId, mealId) {
    try {
      setDeleting(itemId)

      // Supprimer l'aliment
      const { error: deleteError } = await supabase
        .from('food_items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      // Vérifier s'il y a d'autres aliments pour ce repas
      const { data: remaining, error: checkError } = await supabase
        .from('food_items')
        .select('id', { count: 'exact' })
        .eq('meal_id', mealId)

      if (checkError) throw checkError

      // Si pas d'aliments restants, supprimer le repas vide
      if (!remaining || remaining.length === 0) {
        const { error: mealError } = await supabase
          .from('meals')
          .delete()
          .eq('id', mealId)

        if (mealError) throw mealError
      }

      setDeleting(null)
      onMealDeleted()
    } catch (e) {
      console.error('Erreur suppression:', e.message)
      setDeleting(null)
    }
  }

  function calculateSectionTotals() {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    meals.forEach(meal => {
      (meal.food_items || []).forEach(item => {
        totals.calories += item.calories || 0
        totals.protein += item.protein_g || 0
        totals.carbs += item.carbohydrates_g || 0
        totals.fat += item.fat_g || 0
      })
    })
    return totals
  }

  const totals = calculateSectionTotals()
  const hasItems = meals.some(meal => (meal.food_items || []).length > 0)

  return (
    <div style={s.section}>
      <div style={s.headerRow}>
        <button
          style={s.chevronBtn}
          onClick={() => setExpanded(e => !e)}
          title={expanded ? 'Replier' : 'Déplier'}
        >
          <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
        </button>
        <h3 style={s.header} onClick={() => setExpanded(e => !e)}>{type}</h3>
      </div>

      {!hasItems ? (
        <div style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          opacity: expanded ? 1 : 0,
          transition: 'grid-template-rows 0.3s ease, opacity 0.25s ease',
        }}>
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <div style={{ paddingTop: '1rem' }}>
              <div style={s.emptyMessage}>Aucun aliment</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            opacity: expanded ? 1 : 0,
            transition: 'grid-template-rows 0.3s ease, opacity 0.25s ease',
          }}>
            <div style={{ overflow: 'hidden', minHeight: 0 }}>
              <div style={{ paddingTop: '1rem' }}>
          <div style={s.foodsList}>
            {meals.map(meal =>
              (meal.food_items || []).map(item => (
                <div key={`${meal.id}-${item.id}`} style={s.foodItem}>
                  <div style={s.foodName}>{item.product_name || 'Produit'}</div>
                  <div style={s.vDivider} />
                  {formatQuantity(item.quantity_g, item.quantity_unit) && (
                    <>
                      <span style={{ ...s.macroChip, color: '#F0F0EE', background: '#F0F0EE16' }}>{formatQuantity(item.quantity_g, item.quantity_unit)}</span>
                      <div style={s.vDivider} />
                    </>
                  )}
                  <div style={s.foodMacros}>
                    <span style={{ ...s.macroChip, color: '#A8FF3E', background: '#A8FF3E18' }}>{Math.round(item.calories || 0)} kcal</span>
                    <span style={{ ...s.macroChip, color: '#3EE0FF', background: '#3EE0FF18' }}>{(item.protein_g || 0).toFixed(1)} g protéines</span>
                    <span style={{ ...s.macroChip, color: '#FFD93E', background: '#FFD93E18' }}>{(item.carbohydrates_g || 0).toFixed(1)} g glucides</span>
                    <span style={{ ...s.macroChip, color: '#FF5757', background: '#FF575718' }}>{(item.fat_g || 0).toFixed(1)} g lipides</span>
                  </div>
                  <div style={s.spacer} />
                  <div style={s.foodActions}>
                    <button
                      style={s.editBtn}
                      onClick={() => onEditFood(item)}
                      title="Modifier"
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#A8FF3E18'
                        e.currentTarget.style.borderColor = '#A8FF3E'
                        e.currentTarget.style.color = '#A8FF3E'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#1E2320'
                        e.currentTarget.style.borderColor = '#2A2E28'
                        e.currentTarget.style.color = '#8A8E88'
                      }}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      style={s.deleteBtn}
                      onClick={() => deleteFood(item.id, meal.id)}
                      disabled={deleting === item.id}
                      title="Supprimer"
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#FF575718'
                        e.currentTarget.style.borderColor = '#FF5757'
                        e.currentTarget.style.color = '#FF5757'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#1E2320'
                        e.currentTarget.style.borderColor = '#2A2E28'
                        e.currentTarget.style.color = '#8A8E88'
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
              </div>
            </div>
          </div>

          <div style={s.sectionTotal}>
            <div style={s.totalItem}>
              <span style={s.totalLabel}>Calories</span>
              <span style={s.totalValue}>{Math.round(totals.calories)}<span style={s.totalUnit}>{' '}kcal</span></span>
            </div>
            <div style={s.vSepSm} />
            <div style={s.totalItem}>
              <span style={s.totalLabel}>Protéines</span>
              <span style={s.totalValue}>{totals.protein.toFixed(1)}<span style={s.totalUnit}>{' '}g</span></span>
            </div>
            <div style={s.vSepSm} />
            <div style={s.totalItem}>
              <span style={s.totalLabel}>Glucides</span>
              <span style={s.totalValue}>{totals.carbs.toFixed(1)}<span style={s.totalUnit}>{' '}g</span></span>
            </div>
            <div style={s.vSepSm} />
            <div style={s.totalItem}>
              <span style={s.totalLabel}>Lipides</span>
              <span style={s.totalValue}>{totals.fat.toFixed(1)}<span style={s.totalUnit}>{' '}g</span></span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
