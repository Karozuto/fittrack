import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MealSection from '../components/MealSection'
import CreateMealModal from '../components/CreateMealModal'
import DateSelector from '../components/DateSelector'
import { TYPOGRAPHY, FONTS } from '../lib/typography'

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Encas', 'Dîner']

const s = {
  page: {
    minHeight: '100vh',
    background: '#0D0F0E',
    padding: '2rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  titleBlock: {},
  eyebrow: {
    ...TYPOGRAPHY.label,
    color: '#A8FF3E',
    margin: '0 0 4px',
  },
  title: {
    ...TYPOGRAPHY.pageTitle,
    color: '#fff',
  },
  dateInput: {
    background: '#111310',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#A8FF3E',
    color: '#0D0F0E',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    flexShrink: 0,
  },
  summaryCard: {
    background: '#111310',
    border: '0.5px solid #1e201d',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#555',
    margin: 0,
  },
  summaryValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#A8FF3E',
    margin: 0,
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#555',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#3A3E38',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#4A4E48',
    margin: 0,
  },
  error: {
    background: '#2A1515',
    border: '1px solid #4A2020',
    borderRadius: '6px',
    padding: '12px 14px',
    color: '#FF7070',
    fontSize: '13px',
    marginBottom: '1rem',
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
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      <main style={s.main}>
        <div style={s.header}>
          <div style={s.titleBlock}>
            <p style={s.eyebrow}>NUTRITION</p>
            <h1 style={s.title}>MACROS</h1>
          </div>
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

        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} daysWithMeals={daysWithMeals} />

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
      </main>

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
    </div>
  )
}
