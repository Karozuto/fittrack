import { useState, useRef, useEffect } from 'react'

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

const yd = {
  wrap: { position: 'relative', minWidth: '120px' },
  trigger: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
    width: '100%', background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px',
    padding: '10px 14px', color: '#F0F0EE', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.15s', outline: 'none',
  },
  chevron: { color: '#6B7068', fontSize: '10px', transition: 'transform 0.15s', flexShrink: 0 },
  menu: {
    position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0, zIndex: 30,
    background: '#161917', border: '1px solid #252924', borderRadius: '8px',
    padding: '4px', maxHeight: '188px', overflowY: 'auto',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  item: {
    display: 'block', width: '100%', textAlign: 'left', background: 'transparent',
    border: 'none', borderRadius: '5px', padding: '8px 10px', color: '#C8CBC6',
    fontSize: '13px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
    transition: 'background 0.12s',
  },
  itemActive: { background: '#A8FF3E18', color: '#A8FF3E', fontWeight: 600 },
}

function YearDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={yd.wrap}>
      <button
        style={{ ...yd.trigger, borderColor: open ? '#A8FF3E' : '#252924' }}
        onClick={() => setOpen(o => !o)}
      >
        <span>{value}</span>
        <span style={{ ...yd.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && (
        <div className="yd-menu-scroll" style={yd.menu}>
          <style>{`.yd-menu-scroll::-webkit-scrollbar{display:none}`}</style>
          {options.map(year => {
            const active = year === value
            return (
              <button
                key={year}
                style={{ ...yd.item, ...(active ? yd.itemActive : null) }}
                onClick={() => { onChange(year); setOpen(false) }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1E2320' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {year}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DateSelector({ selectedDate, onDateChange, daysWithMeals = new Set() }) {
  const [hoveredMonth, setHoveredMonth] = useState(null)
  const [hoveredDay, setHoveredDay] = useState(null)
  const dayRef = useRef(null)
  const selectedDateObj = new Date(selectedDate)

  useEffect(() => {
    // Scroll to selected day when component mounts or selectedDate changes
    if (dayRef.current) {
      const selectedDayBtn = dayRef.current.querySelector('[data-selected="true"]')
      if (selectedDayBtn) {
        selectedDayBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedDate])

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
        <YearDropdown
          options={getYearsList()}
          value={selectedDateObj.getFullYear()}
          onChange={handleSelectYear}
        />
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
            const isHovered = hoveredDay === dateStr

            return (
              <button
                key={dateStr}
                data-selected={isSelected ? 'true' : 'false'}
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
