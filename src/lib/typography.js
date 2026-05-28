// Unified typography system for FitTrack

export const FONTS = {
  heading: "'Barlow Condensed', sans-serif",
  body: "'DM Sans', sans-serif",
}

export const SIZES = {
  // Page titles
  pageTitle: '32px',    // h1
  sectionTitle: '20px', // h2
  cardTitle: '13px',    // h3

  // Body text
  body: '14px',
  small: '12px',
  xs: '11px',
}

export const WEIGHTS = {
  regular: 400,
  medium: 500,
  bold: 700,
}

// Reusable style objects
export const TYPOGRAPHY = {
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.pageTitle,
    fontWeight: WEIGHTS.medium,
    lineHeight: 1,
    margin: 0,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.sectionTitle,
    fontWeight: WEIGHTS.medium,
    lineHeight: 1,
    margin: 0,
  },
  cardTitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.xs,
    fontWeight: WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#555',
    margin: 0,
    marginBottom: '1rem',
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    fontWeight: WEIGHTS.regular,
    lineHeight: 1.5,
  },
  small: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    fontWeight: WEIGHTS.regular,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: SIZES.xs,
    fontWeight: WEIGHTS.regular,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#555',
  },
}
