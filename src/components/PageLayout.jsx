export default function PageLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0E', fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <main style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
