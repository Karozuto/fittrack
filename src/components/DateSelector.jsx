import { useState, useRef } from 'react'

const s = {
  container: {
    marginBottom: '2rem',
  },
  yearSection: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  yearLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: '#6B7068',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  yearSelect: {
    background: '#0D0F0E',
    border: '1px solid #252924',
    color: '#F0F0EE',
    padding: '10px 14px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7068' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '16px',
    paddingRight: '32px',
  },
  monthSection: {
    marginBottom: '1rem',
    background: '#161917',
    border: '1px solid #252924',
    borderRadius: '8px',
    padding: '1rem',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '8px',
  },
  monthItem: {
    background: '#0D0F0E',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#F0F0EE',
    textAlign: 'center',
    transition: 'all 0.15s',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  monthItemSelected: {
    background: '#A8FF3E',
    color: '#0D0F0E',
    fontWeight: 700,
  },
  monthItemHover: {
    boxShadow: 'inset 0 0 0 2px #A8FF3E',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#161917',
    border: '1px solid #252924',
    borderRadius: '8px',
    padding: '1rem',
  },
  scrollBtn: {
    background: '#0D0F0E',
    border: 'none',
    color: '#6B7068',
    padding: '8px 12px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.15s',
    flexShrink: 0,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  scrollBtnHover: {
    boxShadow: 'inset 0 0 0 2px #A8FF3E',
  },
  scrollContainer: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
    flex: 1,
    paddingBottom: '4px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  dayItem: {
    background: '#0D0F0E',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#F0F0EE',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    minWidth: 'max-content',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  dayItemSelected: {
    background: '#A8FF3E',
    color: '#0D0F0E',
    fontWeight: 700,
  },
  dayItemHover: {
    boxShadow: 'inset 0 0 0 2px #A8FF3E',
  },
  dayItemWithMeals: {
    background: '#1E2320',
    borderLeft: '3px solid #A8FF3E',
  },
}

export default function DateSelector({ selectedDate, onDateChange, daysWithMeals = new Set() }) {
  const [hoveredMonth, setHoveredMonth] = useState(null)
  const [hoveredDay, setHoveredDay] = useState(null)
  const dayRef = useRef(null)
  const selectedDateObj = new Date(selectedDate)

  function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    return `${y}-${m}-${d}`
  }

  function getDayLabel(date) {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    return dayNames[date.getDay()]
  }

  function getMonthShortLabel(monthIdx) {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return months[monthIdx]
  }

  function getYearsList() {
    const years = []
    for (let i = 2026; i <= 2040; i++) {
      years.push(i)
    }
    return years
  }

  function getMonthsList() {
    const months = []
    for (let i = 0; i < 12; i++) {
      months.push(new Date(selectedDateObj.getFullYear(), i, 1))
    }
    return months
  }

  function getDaysList() {
    const year = selectedDateObj.getFullYear()
    const month = selectedDateObj.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  function handleScroll(direction) {
    if (dayRef.current) {
      dayRef.current.scrollLeft += direction === 'left' ? -200 : 200
    }
  }

  function handleSelectYear(year) {
    onDateChange(formatDate(new Date(year, selectedDateObj.getMonth(), 1)))
  }

  function handleSelectMonth(date) {
    onDateChange(formatDate(new Date(date.getFullYear(), date.getMonth(), 1)))
  }

  function handleSelectDay(date) {
    onDateChange(formatDate(date))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div style={s.container}>
      {/* Année */}
      <div style={s.yearSection}>
        <label style={s.yearLabel}>Année</label>
        <select
          value={selectedDateObj.getFullYear()}
          onChange={e => handleSelectYear(parseInt(e.target.value))}
          style={s.yearSelect}
        >
          {getYearsList().map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Mois */}
      <div style={s.monthSection}>
        <div style={s.monthGrid}>
          {getMonthsList().map((date) => {
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const isSelected = monthStr === selectedDate.substring(0, 7)
            const isHovered = hoveredMonth === monthStr

            return (
              <button
                key={monthStr}
                style={{
                  ...s.monthItem,
                  ...(isSelected ? s.monthItemSelected : {}),
                  ...(isHovered && !isSelected ? s.monthItemHover : {}),
                }}
                onClick={() => handleSelectMonth(date)}
                onMouseEnter={() => setHoveredMonth(monthStr)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {getMonthShortLabel(date.getMonth())}
              </button>
            )
          })}
        </div>
      </div>

      {/* Jours */}
      <div style={s.navbar}>
        <button
          style={{
            ...s.scrollBtn,
            ...(hoveredMonth === 'scroll-left' ? s.scrollBtnHover : {}),
          }}
          onClick={() => handleScroll('left')}
          onMouseEnter={() => setHoveredMonth('scroll-left')}
          onMouseLeave={() => setHoveredMonth(null)}
        >
          ←
        </button>

        <div style={s.scrollContainer} ref={dayRef}>
          {getDaysList().map((date) => {
            const dateStr = formatDate(date)
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === formatDate(today)
            const isHovered = hoveredDay === dateStr

            return (
              <button
                key={dateStr}
                style={{
                  ...s.dayItem,
                  ...(daysWithMeals.has(dateStr) && !isSelected ? s.dayItemWithMeals : {}),
                  ...(isSelected ? s.dayItemSelected : {}),
                  ...(isHovered && !isSelected ? s.dayItemHover : {}),
                }}
                onClick={() => handleSelectDay(date)}
                onMouseEnter={() => setHoveredDay(dateStr)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div style={{ fontSize: '10px', color: isSelected ? '#0D0F0E' : '#6B7068', fontWeight: 600 }}>
                  {getDayLabel(date)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{date.getDate()}</div>
              </button>
            )
          })}
        </div>

        <button
          style={{
            ...s.scrollBtn,
            ...(hoveredMonth === 'scroll-right' ? s.scrollBtnHover : {}),
          }}
          onClick={() => handleScroll('right')}
          onMouseEnter={() => setHoveredMonth('scroll-right')}
          onMouseLeave={() => setHoveredMonth(null)}
        >
          →
        </button>
      </div>
    </div>
  )
}
