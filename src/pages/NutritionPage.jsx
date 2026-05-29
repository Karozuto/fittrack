import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MealSection from '../components/MealSection'
import CreateMealModal from '../components/CreateMealModal'
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
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '0.75rem',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryLabel: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#666',
    margin: 0,
  },
  summaryValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#A8FF3E',
    margin: 0,
    lineHeight: 1,
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
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    fetchMeals()
    fetchMonthMeals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

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
              <div style={s.summaryItem}>
                <p style={s.summaryLabel}>Calories</p>
                <p style={s.summaryValue}>{Math.round(totals.calories)}</p>
              </div>
              <div style={s.summaryItem}>
                <p style={s.summaryLabel}>Protéines</p>
                <p style={s.summaryValue}>{totals.protein.toFixed(1)}g</p>
              </div>
              <div style={s.summaryItem}>
                <p style={s.summaryLabel}>Glucides</p>
                <p style={s.summaryValue}>{totals.carbs.toFixed(1)}g</p>
              </div>
              <div style={s.summaryItem}>
                <p style={s.summaryLabel}>Lipides</p>
                <p style={s.summaryValue}>{totals.fat.toFixed(1)}g</p>
              </div>
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
    </PageLayout>
  )
}
