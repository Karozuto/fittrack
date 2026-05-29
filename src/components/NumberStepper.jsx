// Champ numérique avec boutons +/− discrets, empilés à droite (+ au-dessus, − en dessous).
// Masque les flèches natives via la classe .no-spin (voir index.css).

export default function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  placeholder = '0',
  accent,
  autoFocus = false,
}) {
  function update(delta) {
    const current = parseFloat(value) || 0
    let next = current + delta
    if (next < min) next = min
    next = Math.round(next * 1000) / 1000
    onChange(String(next))
  }

  const borderColor = accent || '#252924'

  return (
    <div style={{ ...s.wrap, borderColor }}>
      <input
        className="no-spin"
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        style={s.input}
      />
      <div style={s.col}>
        <button
          type="button"
          aria-label="Augmenter"
          style={s.btn}
          onClick={() => update(step)}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Diminuer"
          style={{ ...s.btn, borderTop: '1px solid #1E2320' }}
          onClick={() => update(-step)}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          −
        </button>
      </div>
    </div>
  )
}

function hoverIn(e) {
  e.currentTarget.style.color = '#A8FF3E'
}
function hoverOut(e) {
  e.currentTarget.style.color = '#6B7068'
}

const s = {
  wrap: {
    display: 'flex',
    alignItems: 'stretch',
    flex: '1 1 0%',
    width: '100%',
    minWidth: 0,
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  input: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    background: 'transparent',
    border: 'none',
    color: '#F0F0EE',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    padding: '8px 12px',
    boxSizing: 'border-box',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    width: '38px',
    flexShrink: 0,
    borderLeft: '1px solid #1E2320',
  },
  btn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#6B7068',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s',
    fontFamily: "'DM Sans', sans-serif",
    userSelect: 'none',
    padding: 0,
  },
}
