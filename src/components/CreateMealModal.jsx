import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Encas', 'Dîner']

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#161917',
    border: '1px solid #252924',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1.75rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#F0F0EE',
    textTransform: 'uppercase',
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6B7068',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: 1,
    padding: '4px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #252924',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    borderBottom: 'none',
    color: '#6B7068',
    padding: '10px 16px',
    fontSize: '13px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#A8FF3E',
    borderBottom: '2px solid #A8FF3E',
  },
  searchInput: {
    width: '100%',
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#F0F0EE',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '1rem',
  },
  button: {
    background: '#A8FF3E',
    color: '#0D0F0E',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    marginBottom: '1.5rem',
  },
  resultItem: {
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  resultImage: {
    width: '80px',
    height: '80px',
    borderRadius: '4px',
    background: '#161917',
    flexShrink: 0,
    objectFit: 'contain',
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#F0F0EE',
    margin: 0,
    wordBreak: 'break-word',
  },
  resultBrand: {
    fontSize: '11px',
    color: '#8A8E88',
    margin: '4px 0 0',
    wordBreak: 'break-word',
  },
  selectedProduct: {
    background: '#161917',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  selectedProductImage: {
    maxWidth: '150px',
    maxHeight: '150px',
    borderRadius: '6px',
    background: '#0D0F0E',
    flexShrink: 0,
    objectFit: 'contain',
  },
  selectedProductInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#F0F0EE',
    margin: '0 0 8px',
    fontFamily: "'DM Sans', sans-serif",
  },
  nutrientGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    fontSize: '12px',
    color: '#8A8E88',
  },
  formField: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6B7068',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#F0F0EE',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  },
  numberInput: {
    width: '100%',
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#F0F0EE',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  },
  macrosPreview: {
    background: '#0D0F0E',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '12px 14px',
    marginBottom: '1.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    fontSize: '12px',
  },
  macroItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  macroLabel: {
    fontSize: '10px',
    color: '#6B7068',
    fontWeight: 600,
  },
  macroValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#A8FF3E',
  },
  footer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid #252924',
    borderRadius: '6px',
    padding: '10px 20px',
    color: '#6B7068',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  error: {
    background: '#2A1515',
    border: '1px solid #4A2020',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#FF7070',
    fontSize: '13px',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6B7068',
  },
}

export default function CreateMealModal({ selectedDate, onClose, onCreated }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [results, setResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [mealType, setMealType] = useState(MEAL_TYPES[0])
  const [quantity, setQuantity] = useState('100')
  const [quantityUnit, setQuantityUnit] = useState('g')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualCalories, setManualCalories] = useState('')
  const [manualProtein, setManualProtein] = useState('')
  const [manualCarbs, setManualCarbs] = useState('')
  const [manualFat, setManualFat] = useState('')
  const [manualQuantity, setManualQuantity] = useState('100')
  const [manualUnit, setManualUnit] = useState('g')

  async function searchOpenfoodFacts() {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Erreur API OpenFoodFacts')
      const data = await response.json()
      setResults(data.products || [])
      if (data.products?.length === 0) {
        setError('Aucun produit trouvé')
      }
    } catch (e) {
      setError(`Erreur de recherche: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function searchByBarcode() {
    if (!barcode.trim()) return
    setLoading(true)
    setError('')
    try {
      const url = `https://fr.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Produit non trouvé')
      const data = await response.json()
      if (data.product) {
        setResults([data.product])
        selectProduct(data.product)
      } else {
        setError('Produit non trouvé')
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function selectProduct(product) {
    setSelectedProduct(product)
    setQuantity('100')
  }

  function calculateMacros() {
    if (!selectedProduct) return { cal: 0, prot: 0, carbs: 0, fat: 0 }
    const qtyNum = parseFloat(quantity) || 100
    const energy = selectedProduct.nutriments?.['energy-kcal_100g'] || 0
    const cal = energy * (qtyNum / 100)
    const prot = (selectedProduct.nutriments?.proteins_100g || 0) * (qtyNum / 100)
    const carbs = (selectedProduct.nutriments?.carbohydrates_100g || 0) * (qtyNum / 100)
    const fat = (selectedProduct.nutriments?.fat_100g || 0) * (qtyNum / 100)
    return { cal, prot, carbs, fat }
  }

  async function handleSave() {
    if (!selectedProduct) {
      setError('Sélectionne un produit')
      return
    }
    setSaving(true)
    setError('')
    try {
      const macros = calculateMacros()
      const mealDate = new Date(`${selectedDate}T12:00:00`)

      // Create meal
      const { data: meal, error: mealErr } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          type: mealType,
          name: selectedProduct.product_name,
          eaten_at: mealDate.toISOString(),
        })
        .select('id')
        .single()

      if (mealErr) throw mealErr

      // Create food item
      const { error: foodErr } = await supabase.from('food_items').insert({
        meal_id: meal.id,
        name: selectedProduct.product_name,
        product_name: selectedProduct.product_name,
        barcode: selectedProduct.code,
        calories: Math.round(macros.cal),
        protein_g: Math.round(macros.prot * 10) / 10,
        carbohydrates_g: Math.round(macros.carbs * 10) / 10,
        fat_g: Math.round(macros.fat * 10) / 10,
      })

      if (foodErr) throw foodErr
      onCreated()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const macros = calculateMacros()

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>Ajouter un aliment</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {!selectedProduct ? (
          <>
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(activeTab === 'search' ? s.tabActive : {}) }}
                onClick={(e) => {
                  setActiveTab('search')
                  e.currentTarget.blur()
                }}
              >
                🔍 Recherche
              </button>
              <button
                style={{ ...s.tab, ...(activeTab === 'barcode-manual' ? s.tabActive : {}) }}
                onClick={(e) => {
                  setActiveTab('barcode-manual')
                  e.currentTarget.blur()
                }}
              >
                📱 Code-barre
              </button>
              <button
                style={{ ...s.tab, ...(activeTab === 'manual' ? s.tabActive : {}) }}
                onClick={(e) => {
                  setActiveTab('manual')
                  e.currentTarget.blur()
                }}
              >
                ✏️ Manuel
              </button>
            </div>

            {activeTab === 'search' && (
              <div>
                <input
                  type="text"
                  style={s.searchInput}
                  placeholder="Chercher un aliment..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && searchOpenfoodFacts()}
                  autoFocus
                />
                <button
                  style={{ ...s.button, width: '100%', marginBottom: '1.5rem' }}
                  onClick={searchOpenfoodFacts}
                  disabled={loading}
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
                {loading && <div style={s.loading}>Recherche en cours...</div>}
                {results.length > 0 && (
                  <div style={s.resultsList}>
                    {results.map((product, idx) => (
                      <div
                        key={idx}
                        style={s.resultItem}
                        onClick={() => selectProduct(product)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#252924')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#0D0F0E')}
                      >
                        {product.image_front_url && (
                          <img src={product.image_front_url} alt={product.product_name} style={s.resultImage} />
                        )}
                        <div style={s.resultInfo}>
                          <div style={s.resultName}>{product.product_name}</div>
                          {product.brands && <div style={s.resultBrand}>{product.brands}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'barcode-manual' && (
              <div>
                <input
                  type="text"
                  style={s.searchInput}
                  placeholder="Entrer le code-barre..."
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && searchByBarcode()}
                />
                <button
                  style={{ ...s.button, width: '100%', marginBottom: '1.5rem' }}
                  onClick={searchByBarcode}
                  disabled={loading}
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
                {loading && <div style={s.loading}>Recherche en cours...</div>}
              </div>
            )}

            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={s.formField}>
                  <label style={s.label}>Nom de l'aliment</label>
                  <input
                    type="text"
                    style={s.numberInput}
                    placeholder="Ex: Pomme rouge"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Calories</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      style={s.numberInput}
                      value={manualCalories}
                      onChange={e => setManualCalories(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Protéines (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      style={s.numberInput}
                      value={manualProtein}
                      onChange={e => setManualProtein(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Glucides (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      style={s.numberInput}
                      value={manualCarbs}
                      onChange={e => setManualCarbs(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Lipides (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      style={s.numberInput}
                      value={manualFat}
                      onChange={e => setManualFat(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div style={s.formField}>
                  <label style={s.label}>Quantité</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      style={{ ...s.numberInput, flex: 1 }}
                      value={manualQuantity}
                      onChange={e => setManualQuantity(e.target.value)}
                      placeholder="100"
                    />
                    <select
                      style={{ ...s.select, width: '80px' }}
                      value={manualUnit}
                      onChange={e => setManualUnit(e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                <button
                  style={{ ...s.button, width: '100%' }}
                  onClick={() => {
                    if (!manualName.trim()) {
                      setError('Entre un nom pour l\'aliment')
                      return
                    }
                    const manualProduct = {
                      product_name: manualName,
                      nutriments: {
                        energy_kcal_100g: parseFloat(manualCalories) || 0,
                        proteins_100g: parseFloat(manualProtein) || 0,
                        carbohydrates_100g: parseFloat(manualCarbs) || 0,
                        fat_100g: parseFloat(manualFat) || 0,
                      },
                    }
                    selectProduct(manualProduct)
                    setQuantity(manualQuantity)
                  }}
                >
                  Utiliser cet aliment
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ ...s.selectedProduct, display: 'grid', gridTemplateColumns: '130px 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                {selectedProduct.image_front_url && (
                  <img src={selectedProduct.image_front_url} alt={selectedProduct.product_name} style={{ ...s.selectedProductImage, width: '130px', height: '130px', maxWidth: 'none', maxHeight: 'none' }} />
                )}
                <button
                  style={{ width: '100%', background: '#252924', border: 'none', color: '#F0F0EE', fontSize: '11px', padding: '10px 8px', borderRadius: '4px', transition: 'all 0.15s', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.05em' }}
                  onClick={() => setSelectedProduct(null)}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2A3028')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#252924')}
                >
                  ↻ Changer
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2, color: '#A8FF3E', fontFamily: "'Barlow Condensed', sans-serif" }}>{selectedProduct.product_name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Calories</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{Math.round(macros.cal)}</div>
                  </div>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Protéines</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{macros.prot.toFixed(1)}g</div>
                  </div>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Glucides</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{macros.carbs.toFixed(1)}g</div>
                  </div>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Lipides</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{macros.fat.toFixed(1)}g</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={s.formField}>
                <label style={s.label}>Repas</label>
                <select
                  style={s.select}
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                >
                  {MEAL_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Quantité</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    style={{ ...s.numberInput, flex: 1 }}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="100"
                  />
                  <select
                    style={{ ...s.select, width: '80px' }}
                    value={quantityUnit}
                    onChange={e => setQuantityUnit(e.target.value)}
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={s.footer}>
              <button style={s.cancelBtn} onClick={onClose}>
                Annuler
              </button>
              <button
                style={{ ...s.button, opacity: saving ? 0.6 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
