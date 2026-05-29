export default function MuscleVisualization({ size = 140 }) {
  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D0F0E',
      borderRadius: '6px',
      border: '2px dashed #252924',
      fontSize: '12px',
      color: '#8A8E88',
      textAlign: 'center',
      padding: '8px',
      boxSizing: 'border-box',
      gap: '6px',
    }}>
      <div style={{ fontSize: '20px' }}>🖼️</div>
      <div style={{ fontSize: '10px', color: '#6B7068' }}>Work in Progress</div>
    </div>
  )
}
