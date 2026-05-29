// ──── Base Layout ────────────────────────────────────────────────────────────

export const PAGE_BASE = {
  minHeight: '100vh',
  background: '#0D0F0E',
  fontFamily: "'DM Sans', sans-serif",
}

export const MAIN_CONTAINER = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '1.5rem',
}

export const INNER_CONTAINER = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '0 1.5rem',
}

// ──── Header ─────────────────────────────────────────────────────────────────

export const HEADER_WITH_BUTTON = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '1.5rem',
}

// ──── Cards ──────────────────────────────────────────────────────────────────

export const CARD_BASE = {
  background: '#111310',
  border: '0.5px solid #1e201d',
  borderRadius: '8px',
  padding: '1rem',
}

export const CARD_ROUNDED = {
  ...CARD_BASE,
  borderRadius: '10px',
}

// ──── Grids ──────────────────────────────────────────────────────────────────

export const GRID_AUTO = {
  display: 'grid',
  gap: '12px',
}

export const GRID_2COL = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
}

export const GRID_3COL = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
}

export const GRID_4COL = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px',
}

// ──── Buttons ────────────────────────────────────────────────────────────────

export const BTN_PRIMARY = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#A8FF3E',
  color: '#0D0F0E',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'opacity 0.15s, transform 0.15s',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}

export const BTN_SECONDARY = {
  background: 'transparent',
  border: '1px solid #A8FF3E',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'background 0.2s, color 0.2s',
  outline: 'none',
}

export const BTN_TEXT = {
  fontSize: '12px',
  color: '#A8FF3E',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
}

// ──── Badge & Labels ────────────────────────────────────────────────────────

export const BADGE = {
  fontSize: '11px',
  color: '#555',
  background: '#0D0F0E',
  border: '0.5px solid #252620',
  borderRadius: '5px',
  padding: '3px 8px',
  whiteSpace: 'nowrap',
}

export const BADGE_ACCENT = {
  ...BADGE,
  color: '#A8FF3E',
  borderColor: 'rgba(168,255,62,0.15)',
}

// ──── Text States ────────────────────────────────────────────────────────────

export const EMPTY_STATE = {
  textAlign: 'center',
  padding: '4rem 2rem',
  color: '#555',
}

export const LOADING_STATE = {
  color: '#444',
  fontSize: '14px',
  textAlign: 'center',
  padding: '3rem',
}

export const ERROR_MESSAGE = {
  background: '#2A1515',
  border: '1px solid #4A2020',
  borderRadius: '6px',
  padding: '12px 14px',
  color: '#FF7070',
  fontSize: '13px',
  marginBottom: '1rem',
}

// ──── Metric Cards ──────────────────────────────────────────────────────────

export const METRIC_CARD = {
  ...CARD_ROUNDED,
  padding: '14px 16px',
}

export const METRIC_LABEL = {
  color: '#444',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
}

export const METRIC_VALUE = {
  fontSize: '28px',
  fontWeight: 500,
  color: '#fff',
  lineHeight: 1,
}

export const METRIC_UNIT = {
  fontSize: '12px',
  color: '#555',
  marginTop: '4px',
}

// ──── Row/List Items ────────────────────────────────────────────────────────

export const ROW = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '0.5px solid #1a1c19',
}

export const ROW_TITLE = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#fff',
}

export const ROW_META = {
  fontSize: '11px',
  color: '#444',
  marginTop: '2px',
}
