import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MealSection from '../components/MealSection'
import CreateMealModal from '../components/CreateMealModal'
import EditFoodModal from '../components/EditFoodModal'
import DateSelector from '../components/DateSelector'
import PageHeader from '../components/PageHeader'
import PageLayout from '../components/PageLayout'
import { BTN_PRIMARY, CARD_ROUNDED, ERROR_MESSAGE } from '../lib/commonStyles'

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Encas', 'Dîner']

const s = {
  yearWithBtn: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  dateInput: {
    background: '#111310',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#fff',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    height: '36px',
    alignSelf: 'center',
  },
  btnAdd: {
    ...BTN_PRIMARY,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  summaryCard: {
    ...CARD_ROUNDED,
    padding: '0.7rem 1rem',
    marginBottom: '1.5rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  statCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    padding: '0 14px',
  },
  statCellBorder: {
    borderLeft: '1px solid #252924',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#6B7068',
    margin: 0,
  },
  summaryValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#F0F0EE',
    margin: 0,
    lineHeight: 1,
  },
  summaryUnit: {
    fontSize: '0.8rem',
    color: '#6B7068',
    marginLeft: '1px',
    fontWeight: 700,
  },
  summaryTarget: {
    fontSize: '0.85rem',
    color: '#6B7068',
    fontWeight: 700,
  },
  barTrack: {
    height: '4px',
    borderRadius: '3px',
    background: '#252924',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  emptyTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#777',
    margin: '0 0 6px',
  },
  emptyText: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
    lineHeight: 1.5,
  },
  error: {
    ...ERROR_MESSAGE,
    marginBottom: '0.75rem',
    fontSize: '12px',
    padding: '10px 12px',
  },
}

export default function NutritionPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [displayedMeals, setDisplayedMeals] = useState({})
  const [daysWithMeals, setDaysWithMeals] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [btnHover, setBtnHover] = useState(false)
  const [targets, setTargets] = useState(null)

  useEffect(() => {
    fetchMeals()
    fetchMonthMeals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  useEffect(() => {
    fetchTargets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function fetchMeals() {
    setLoading(true)
    setError('')
    try {
      const dateStart = new Date(selectedDate)
      dateStart.setHours(0, 0, 0, 0)
      const dateEnd = new Date(selectedDate)
      dateEnd.setHours(23, 59, 59, 999)

      const { data, error: err } = await supabase
        .from('meals')
        .select('id, type, name, eaten_at, food_items(*)')
        .eq('user_id', user.id)
        .gte('eaten_at', dateStart.toISOString())
        .lt('eaten_at', dateEnd.toISOString())
        .order('eaten_at', { ascending: true })

      if (err) throw err

      // Group meals by type
      const grouped = {}
      MEAL_TYPES.forEach(type => {
        grouped[type] = data.filter(m => m.type === type) || []
      })
      setDisplayedMeals(grouped)
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement des données')
    }
    setLoading(false)
  }

  async function fetchMonthMeals() {
    try {
      const year = new Date(selectedDate).getFullYear()
      const month = new Date(selectedDate).getMonth()
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)

      const { data, error: err } = await supabase
        .from('meals')
        .select('eaten_at')
        .eq('user_id', user.id)
        .gte('eaten_at', monthStart.toISOString())
        .lte('eaten_at', monthEnd.toISOString())

      if (err) throw err

      const days = new Set()
      data.forEach(meal => {
        const mealDate = new Date(meal.eaten_at).toISOString().split('T')[0]
        days.add(mealDate)
      })
      setDaysWithMeals(days)
    } catch (e) {
      console.error('Erreur chargement mois:', e.message)
    }
  }

  async function fetchTargets() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('target_calories, target_protein_g, target_carbs_g, target_fat_g')
        .eq('id', user.id)
        .maybeSingle()
      setTargets(data || null)
    } catch (e) {
      console.error('Erreur chargement objectifs:', e.message)
    }
  }

  function calculateTotals() {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    Object.values(displayedMeals).forEach(mealList => {
      mealList.forEach(meal => {
        (meal.food_items || []).forEach(item => {
          totals.calories += item.calories || 0
          totals.protein += item.protein_g || 0
          totals.carbs += item.carbohydrates_g || 0
          totals.fat += item.fat_g || 0
        })
      })
    })
    return totals
  }

  const totals = calculateTotals()
  const hasData = Object.values(displayedMeals).some(list => list.length > 0)

  const macroStats = [
    { key: 'calories', label: 'Calories', value: totals.calories, target: targets?.target_calories, unit: '', color: '#A8FF3E', decimals: 0 },
    { key: 'protein', label: 'Protéines', value: totals.protein, target: targets?.target_protein_g, unit: 'g', color: '#3EE0FF', decimals: 1 },
    { key: 'carbs', label: 'Glucides', value: totals.carbs, target: targets?.target_carbs_g, unit: 'g', color: '#FFD93E', decimals: 1 },
    { key: 'fat', label: 'Lipides', value: totals.fat, target: targets?.target_fat_g, unit: 'g', color: '#FF8A5C', decimals: 1 },
  ]

  return (
    <PageLayout>
      <div>
        <PageHeader eyebrow="NUTRITION" title="MACROS" />

        <div style={s.yearWithBtn}>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} daysWithMeals={daysWithMeals} />
          <button
            style={{ ...s.btnAdd, opacity: btnHover ? 0.85 : 1 }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={() => setShowModal(true)}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
            Ajouter
          </button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {!loading && hasData && (
          <div style={s.summaryCard}>
            <div style={s.summaryGrid}>
              {macroStats.map((m, i) => {
                const val = m.decimals === 0 ? Math.round(m.value) : Math.round(m.value * 10) / 10
                const hasTarget = m.target != null && m.target > 0
                const over = hasTarget && m.value > m.target
                const pct = hasTarget ? Math.min(100, (m.value / m.target) * 100) : 0
                return (
                  <div key={m.key} style={{ ...s.statCell, ...(i > 0 ? s.statCellBorder : {}) }}>
                    <p style={s.summaryLabel}>{m.label}</p>
                    <p style={s.summaryValue}>
                      {val}{m.unit && <span style={s.summaryUnit}>{m.unit}</span>}
                      {hasTarget && (
                        <span style={s.summaryTarget}> / {Math.round(m.target)}{m.unit}</span>
                      )}
                    </p>
                    {hasTarget && (
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${pct}%`, background: over ? '#FF5757' : m.color }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!hasData ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🍽️</div>
            <p style={s.emptyTitle}>Aucun aliment</p>
            <p style={s.emptyText}>Ajoute tes premiers aliments pour tracker tes macros.</p>
          </div>
        ) : (
          <div style={s.sectionsContainer}>
            {MEAL_TYPES.map(type => (
              <MealSection
                key={type}
                type={type}
                meals={displayedMeals[type] || []}
                onMealDeleted={fetchMeals}
                onEditFood={setEditingFood}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateMealModal
          selectedDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            fetchMeals()
          }}
        />
      )}

      {editingFood && (
        <EditFoodModal
          item={editingFood}
          onClose={() => setEditingFood(null)}
          onSaved={() => {
            setEditingFood(null)
            fetchMeals()
          }}
        />
      )}
    </PageLayout>
  )
}
