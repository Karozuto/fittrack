import { useState } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  section: {
    background: '#161917',
    border: '1px solid #252924',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  header: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#F0F0EE',
    textTransform: 'uppercase',
    margin: '0 0 1rem',
    letterSpacing: '0.05em',
  },
  foodsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1rem',
  },
  foodItem: {
    background: '#0D0F0E',
    border: '1px solid #1E2320',
    borderRadius: '6px',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#F0F0EE',
    margin: '0 0 6px',
    fontFamily: "'DM Sans', sans-serif",
  },
  foodMacros: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
    color: '#8A8E88',
    fontFamily: "'DM Sans', sans-serif",
  },
  foodActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6B7068',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
    transition: 'color 0.15s',
  },
  sectionTotal: {
    paddingTop: '1rem',
    borderTop: '1px solid #252924',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '1rem',
  },
  totalItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  totalLabel: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6B7068',
  },
  totalValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#A8FF3E',
  },
  emptyMessage: {
    fontSize: '13px',
    color: '#6B7068',
    fontStyle: 'italic',
    padding: '1rem 0',
  },
}

export default function MealSection({ type, meals, onMealDeleted }) {
  const [deleting, setDeleting] = useState(null)

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
      <h3 style={s.header}>{type}</h3>

      {!hasItems ? (
        <div style={s.emptyMessage}>Aucun aliment</div>
      ) : (
        <>
          <div style={s.foodsList}>
            {meals.map(meal =>
              (meal.food_items || []).map(item => (
                <div key={`${meal.id}-${item.id}`} style={s.foodItem}>
                  <div style={s.foodInfo}>
                    <div style={s.foodName}>{item.product_name || 'Produit'}</div>
                    <div style={s.foodMacros}>
                      <span>{Math.round(item.calories || 0)} kcal</span>
                      <span>{(item.protein_g || 0).toFixed(1)}g prot</span>
                      <span>{(item.carbohydrates_g || 0).toFixed(1)}g carbs</span>
                      <span>{(item.fat_g || 0).toFixed(1)}g fat</span>
                    </div>
                  </div>
                  <div style={s.foodActions}>
                    <button
                      style={s.deleteBtn}
                      onClick={() => deleteFood(item.id, meal.id)}
                      disabled={deleting === item.id}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FF5757')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6B7068')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={s.sectionTotal}>
            <div style={s.totalItem}>
              <div style={s.totalLabel}>Calories</div>
              <div style={s.totalValue}>{Math.round(totals.calories)}</div>
            </div>
            <div style={s.totalItem}>
              <div style={s.totalLabel}>Protéines</div>
              <div style={s.totalValue}>{totals.protein.toFixed(1)}g</div>
            </div>
            <div style={s.totalItem}>
              <div style={s.totalLabel}>Glucides</div>
              <div style={s.totalValue}>{totals.carbs.toFixed(1)}g</div>
            </div>
            <div style={s.totalItem}>
              <div style={s.totalLabel}>Lipides</div>
              <div style={s.totalValue}>{totals.fat.toFixed(1)}g</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
