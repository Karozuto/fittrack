import { TYPOGRAPHY } from '../lib/typography'

export default function PageHeader({ eyebrow, title }) {
  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        {eyebrow && <p style={s.eyebrow}>{eyebrow}</p>}
        <h1 style={s.title}>{title}</h1>
      </div>
    </div>
  )
}

const s = {
  wrapper: {
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: '52px',
  },
  eyebrow: {
    ...TYPOGRAPHY.label,
    color: '#A8FF3E',
    margin: '0 0 2px',
    fontSize: '10px',
  },
  title: {
    ...TYPOGRAPHY.pageTitle,
    color: '#fff',
    margin: 0,
    lineHeight: 1.1,
  },
}
