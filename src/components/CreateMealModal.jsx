import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import NumberStepper from './NumberStepper'

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Encas', 'Dîner']

// Déduit l'unité (g / ml) d'un produit OpenFoodFacts (les liquides → ml).
function detectUnit(product) {
  const u = (product?.product_quantity_unit || product?.serving_quantity_unit || '').toLowerCase()
  if (u === 'ml' || u === 'cl' || u === 'l') return 'ml'
  if (u === 'g' || u === 'kg' || u === 'mg') return 'g'
  const q = (product?.quantity || '').toLowerCase()
  if (/(\d\s*)(ml|cl|l|litre|liter)\b/.test(q)) return 'ml'
  return 'g'
}

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

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
    padding: '1.25rem 1.5rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.5rem',
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
    marginBottom: '1rem',
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
    marginBottom: '0.75rem',
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
    marginBottom: '1rem',
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
    marginBottom: '0.75rem',
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
  savedDelete: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1E2320',
    border: '1px solid #2A2E28',
    borderRadius: '7px',
    color: '#8A8E88',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    alignSelf: 'center',
    transition: 'all 0.15s',
  },
  basisHint: {
    fontSize: '11px',
    color: '#6B7068',
    margin: '-0.25rem 0 0',
    fontStyle: 'italic',
  },
  savedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#0D0F0E',
    border: '1px solid #1E2320',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  savedImg: {
    width: '44px',
    height: '44px',
    borderRadius: '6px',
    objectFit: 'contain',
    background: '#161917',
    flexShrink: 0,
  },
  savedImgPh: {
    width: '44px',
    height: '44px',
    borderRadius: '6px',
    background: '#161917',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  savedMain: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  savedTop: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    minWidth: 0,
  },
  savedName: {
    flex: '1 1 auto',
    fontSize: '13px',
    fontWeight: 600,
    color: '#F0F0EE',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  basisChip: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#8A8E88',
    border: '1px solid #2A2E28',
    borderRadius: '4px',
    padding: '1px 7px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  savedChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  chip: {
    padding: '3px 9px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
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
  const [quantity, setQuantity] = useState('')
  const [quantityUnit, setQuantityUnit] = useState('g')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualCalories, setManualCalories] = useState('')
  const [manualProtein, setManualProtein] = useState('')
  const [manualCarbs, setManualCarbs] = useState('')
  const [manualFat, setManualFat] = useState('')
  const [manualQuantity, setManualQuantity] = useState('')
  const [manualUnit, setManualUnit] = useState('g')
  const [savedFoods, setSavedFoods] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedQuery, setSavedQuery] = useState('')

  async function fetchSavedFoods() {
    setSavedLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('saved_foods')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false })
      if (err) throw err
      setSavedFoods(data || [])
    } catch (e) {
      setError(`Erreur chargement aliments: ${e.message}`)
    }
    setSavedLoading(false)
  }

  async function deleteSavedFood(id) {
    setSavedFoods(prev => prev.filter(f => f.id !== id))
    await supabase.from('saved_foods').delete().eq('id', id)
  }

  // Réutilise un aliment enregistré via le flux "produit sélectionné" existant.
  function selectSavedFood(sf) {
    setSelectedProduct({
      product_name: sf.name,
      code: sf.barcode,
      image_front_url: sf.image_url,
      manual: sf.quantity_unit === 'unité',
      nutriments: {
        'energy-kcal_100g': sf.calories,
        proteins_100g: sf.protein_g,
        carbohydrates_100g: sf.carbohydrates_g,
        fat_100g: sf.fat_g,
      },
    })
    setQuantity('')
    setQuantityUnit(sf.quantity_unit || 'g')
  }

  // Enregistre (ou met à jour) un aliment dans la bibliothèque. Best-effort.
  async function saveToLibrary(food) {
    try {
      let existing = null
      if (food.barcode) {
        const { data } = await supabase
          .from('saved_foods').select('id')
          .eq('user_id', user.id).eq('barcode', food.barcode)
          .limit(1).maybeSingle()
        existing = data
      } else {
        const { data } = await supabase
          .from('saved_foods').select('id')
          .eq('user_id', user.id).is('barcode', null).ilike('name', food.name)
          .limit(1).maybeSingle()
        existing = data
      }
      const payload = {
        user_id: user.id,
        name: food.name,
        barcode: food.barcode ?? null,
        image_url: food.image_url ?? null,
        calories: food.cal,
        protein_g: food.prot,
        carbohydrates_g: food.carbs,
        fat_g: food.fat,
        quantity_unit: food.unit,
        last_used_at: new Date().toISOString(),
      }
      if (existing) {
        await supabase.from('saved_foods').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('saved_foods').insert(payload)
      }
    } catch (e) {
      console.error('saveToLibrary:', e.message)
    }
  }

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
    setQuantity('')
    setQuantityUnit(detectUnit(product))
  }

  function calculateMacros() {
    if (!selectedProduct) return { cal: 0, prot: 0, carbs: 0, fat: 0 }
    const qtyNum = parseFloat(quantity) || 0
    // Les aliments en "unité" sont définis par unité ; g/ml sont sur une base de 100.
    const factor = qtyNum / (quantityUnit === 'unité' ? 1 : 100)
    const energy = selectedProduct.nutriments?.['energy-kcal_100g'] || 0
    const cal = energy * factor
    const prot = (selectedProduct.nutriments?.proteins_100g || 0) * factor
    const carbs = (selectedProduct.nutriments?.carbohydrates_100g || 0) * factor
    const fat = (selectedProduct.nutriments?.fat_100g || 0) * factor
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
        quantity_g: parseFloat(quantity) || null,
        quantity_unit: quantityUnit,
      })

      if (foodErr) throw foodErr

      await saveToLibrary({
        name: selectedProduct.product_name,
        barcode: selectedProduct.code ?? null,
        image_url: selectedProduct.image_front_url ?? null,
        unit: quantityUnit,
        cal: Math.round(selectedProduct.nutriments?.['energy-kcal_100g'] || 0),
        prot: Math.round((selectedProduct.nutriments?.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((selectedProduct.nutriments?.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((selectedProduct.nutriments?.fat_100g || 0) * 10) / 10,
      })

      onCreated()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  async function saveManual() {
    if (!manualName.trim()) {
      setError('Entre un nom pour l\'aliment')
      return
    }
    setSaving(true)
    setError('')
    try {
      const qtyNum = parseFloat(manualQuantity) || 0
      // En "unité" : valeurs par unité. En g/ml : valeurs pour 100.
      const factor = qtyNum / (manualUnit === 'unité' ? 1 : 100)
      const cal = (parseFloat(manualCalories) || 0) * factor
      const prot = (parseFloat(manualProtein) || 0) * factor
      const carbs = (parseFloat(manualCarbs) || 0) * factor
      const fat = (parseFloat(manualFat) || 0) * factor
      const mealDate = new Date(`${selectedDate}T12:00:00`)

      const { data: meal, error: mealErr } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          type: mealType,
          name: manualName.trim(),
          eaten_at: mealDate.toISOString(),
        })
        .select('id')
        .single()

      if (mealErr) throw mealErr

      const { error: foodErr } = await supabase.from('food_items').insert({
        meal_id: meal.id,
        name: manualName.trim(),
        product_name: manualName.trim(),
        calories: Math.round(cal),
        protein_g: Math.round(prot * 10) / 10,
        carbohydrates_g: Math.round(carbs * 10) / 10,
        fat_g: Math.round(fat * 10) / 10,
        quantity_g: parseFloat(manualQuantity) || null,
        quantity_unit: manualUnit,
      })

      if (foodErr) throw foodErr

      await saveToLibrary({
        name: manualName.trim(),
        barcode: null,
        image_url: null,
        unit: manualUnit,
        cal: Math.round(parseFloat(manualCalories) || 0),
        prot: Math.round((parseFloat(manualProtein) || 0) * 10) / 10,
        carbs: Math.round((parseFloat(manualCarbs) || 0) * 10) / 10,
        fat: Math.round((parseFloat(manualFat) || 0) * 10) / 10,
      })

      onCreated()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const macros = calculateMacros()
  const filteredSaved = savedFoods.filter(f =>
    f.name.toLowerCase().includes(savedQuery.trim().toLowerCase())
  )

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="no-scrollbar" style={s.modal}>
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
              <button
                style={{ ...s.tab, ...(activeTab === 'saved' ? s.tabActive : {}) }}
                onClick={(e) => {
                  setActiveTab('saved')
                  fetchSavedFoods()
                  e.currentTarget.blur()
                }}
              >
                📚 Mes aliments
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
                    <NumberStepper value={manualCalories} onChange={setManualCalories} step={10} />
                  </div>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Protéines (g)</label>
                    <NumberStepper value={manualProtein} onChange={setManualProtein} step={1} />
                  </div>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Glucides (g)</label>
                    <NumberStepper value={manualCarbs} onChange={setManualCarbs} step={1} />
                  </div>
                  <div style={s.formField}>
                    <label style={{ ...s.label, fontSize: '9px' }}>Lipides (g)</label>
                    <NumberStepper value={manualFat} onChange={setManualFat} step={1} />
                  </div>
                </div>

                <p style={s.basisHint}>
                  {manualUnit === 'unité' ? 'Valeurs saisies par unité' : `Valeurs saisies pour 100 ${manualUnit}`}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                      <NumberStepper
                        value={manualQuantity}
                        onChange={setManualQuantity}
                        step={manualUnit === 'unité' ? 1 : 10}
                        placeholder={manualUnit === 'unité' ? '1' : '100'}
                      />
                      <select
                        style={{ ...s.select, width: '90px' }}
                        value={manualUnit}
                        onChange={e => setManualUnit(e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unité">unités</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  style={{ ...s.button, width: '100%', opacity: saving ? 0.6 : 1 }}
                  onClick={saveManual}
                  disabled={saving}
                >
                  {saving ? 'Ajout...' : 'Ajouter l\'aliment'}
                </button>
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <input
                  type="text"
                  style={s.searchInput}
                  placeholder="Filtrer mes aliments..."
                  value={savedQuery}
                  onChange={e => setSavedQuery(e.target.value)}
                  autoFocus
                />
                {savedLoading ? (
                  <div style={s.loading}>Chargement...</div>
                ) : filteredSaved.length === 0 ? (
                  <div style={s.loading}>
                    {savedQuery
                      ? 'Aucun aliment correspondant.'
                      : 'Aucun aliment enregistré. Ajoute-en via Recherche, Code-barre ou Manuel : ils seront mémorisés ici.'}
                  </div>
                ) : (
                  <div style={s.resultsList}>
                    {filteredSaved.map(sf => {
                      const basis = sf.quantity_unit === 'unité' ? 'Par unité' : `Pour 100 ${sf.quantity_unit}`
                      return (
                        <div
                          key={sf.id}
                          style={s.savedItem}
                          onClick={() => selectSavedFood(sf)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#1A1D19')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#0D0F0E')}
                        >
                          {sf.image_url
                            ? <img src={sf.image_url} alt={sf.name} style={s.savedImg} />
                            : <div style={s.savedImgPh}>🍽️</div>}
                          <div style={s.savedMain}>
                            <div style={s.savedTop}>
                              <span style={s.savedName}>{sf.name}</span>
                              <span style={s.basisChip}>{basis}</span>
                            </div>
                            <div style={s.savedChips}>
                              <span style={{ ...s.chip, color: '#A8FF3E', background: '#A8FF3E18' }}>{Math.round(sf.calories || 0)} kcal</span>
                              <span style={{ ...s.chip, color: '#3EE0FF', background: '#3EE0FF18' }}>{(sf.protein_g || 0).toFixed(1)} g protéines</span>
                              <span style={{ ...s.chip, color: '#FFD93E', background: '#FFD93E18' }}>{(sf.carbohydrates_g || 0).toFixed(1)} g glucides</span>
                              <span style={{ ...s.chip, color: '#FF5757', background: '#FF575718' }}>{(sf.fat_g || 0).toFixed(1)} g lipides</span>
                            </div>
                          </div>
                          <button
                            style={s.savedDelete}
                            title="Retirer de mes aliments"
                            onClick={e => { e.stopPropagation(); deleteSavedFood(sf.id) }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#FF575718'
                              e.currentTarget.style.borderColor = '#FF5757'
                              e.currentTarget.style.color = '#FF5757'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#1E2320'
                              e.currentTarget.style.borderColor = '#2A2E28'
                              e.currentTarget.style.color = '#8A8E88'
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ ...s.selectedProduct, display: 'grid', gridTemplateColumns: '130px 1fr', gap: '1.5rem', marginBottom: '1rem', alignItems: 'stretch' }}>
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
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{Math.round(macros.cal)} kcal</div>
                  </div>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Protéines</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{macros.prot.toFixed(1)} g</div>
                  </div>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Glucides</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{macros.carbs.toFixed(1)} g</div>
                  </div>
                  <div style={{ background: '#0D0F0E', border: '1px solid #252924', borderRadius: '6px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#6B7068', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>Lipides</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#A8FF3E' }}>{macros.fat.toFixed(1)} g</div>
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
                  <NumberStepper
                    value={quantity}
                    onChange={setQuantity}
                    step={quantityUnit === 'unité' ? 1 : 10}
                    placeholder={quantityUnit === 'unité' ? '1' : '100'}
                  />
                  <select
                    style={{ ...s.select, width: '90px' }}
                    value={quantityUnit}
                    onChange={e => setQuantityUnit(e.target.value)}
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    {selectedProduct.manual && <option value="unité">unités</option>}
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
