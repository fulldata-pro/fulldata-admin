'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

type BillingType = 'INDIVIDUAL' | 'BUSINESS'

interface BillingData {
  name: string
  taxId: string
  type: BillingType
  address: string
  city: string
  zip: string
  state: string
  stateId: string
  country: string
  countryId: string
  activity: string
  vatType: string
}

interface InitialBillingData {
  name?: string
  taxId?: string
  type?: string
  address?: string
  city?: string
  zip?: string
  state?: any
  stateId?: string
  country?: any
  countryId?: string
  activity?: string
  vatType?: string
}

interface Country {
  _id: string
  name: string
  alpha2Code?: string
}

interface State {
  _id: string
  name: string
}

interface CountrySettings {
  activities?: Array<{ id: string; name: string }>
  vatType?: Array<{ id: string; name: string }>
  incomeTaxType?: Array<{ id: string; name: string }>
}

interface EditBillingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: BillingData) => Promise<void>
  accountName: string
  initialData?: InitialBillingData
}

const billingTypeOptions = [
  { value: 'INDIVIDUAL', label: 'Persona Fisica' },
  { value: 'BUSINESS', label: 'Empresa' }
]

// Removed hardcoded vatTypeOptions - will load dynamically

export function EditBillingModal({
  isOpen,
  onClose,
  onConfirm,
  accountName,
  initialData
}: EditBillingModalProps) {
  const [formData, setFormData] = useState<BillingData>({
    name: '',
    taxId: '',
    type: 'INDIVIDUAL',
    address: '',
    city: '',
    zip: '',
    state: '',
    stateId: '',
    country: '',
    countryId: '',
    activity: '',
    vatType: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Location data
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [countrySettings, setCountrySettings] = useState<CountrySettings | null>(null)
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingStates, setLoadingStates] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load countries when modal opens
  useEffect(() => {
    if (isOpen && countries.length === 0) {
      loadCountries()
    }
  }, [isOpen, countries.length])

  // Load states and country settings when country changes
  useEffect(() => {
    if (formData.countryId) {
      loadStates(formData.countryId)
      loadCountrySettings(formData.countryId)
    } else {
      setStates([])
      setCountrySettings(null)
    }
  }, [formData.countryId])

  // Set initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      const stateName = typeof initialData.state === 'object' ? initialData.state?.name : initialData.state
      const countryName = typeof initialData.country === 'object' ? initialData.country?.name : initialData.country
      const countryId = typeof initialData.country === 'object' ? initialData.country?._id : initialData.countryId
      const stateId = typeof initialData.state === 'object' ? initialData.state?._id : initialData.stateId

      setFormData({
        name: initialData.name || '',
        taxId: initialData.taxId || '',
        type: (initialData.type?.toUpperCase() as BillingType) || 'INDIVIDUAL',
        address: initialData.address || '',
        city: initialData.city || '',
        zip: initialData.zip || '',
        state: stateName || '',
        stateId: stateId || '',
        country: countryName || '',
        countryId: countryId || '',
        activity: initialData.activity || '',
        vatType: initialData.vatType || ''
      })
      setError('')

      // Load states and settings for initial country
      if (countryId) {
        loadStates(countryId)
        loadCountrySettings(countryId)
      }
    }
  }, [isOpen, initialData])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const loadCountries = async () => {
    setLoadingCountries(true)
    try {
      const response = await fetch('/api/locations/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
      }
    } catch (error) {
      console.error('Error loading countries:', error)
    } finally {
      setLoadingCountries(false)
    }
  }

  const loadStates = async (countryId: string) => {
    setLoadingStates(true)
    try {
      const response = await fetch(`/api/locations/states?countryId=${countryId}`)
      if (response.ok) {
        const data = await response.json()
        setStates(data)
      }
    } catch (error) {
      console.error('Error loading states:', error)
    } finally {
      setLoadingStates(false)
    }
  }

  const loadCountrySettings = async (countryId: string) => {
    try {
      const response = await fetch(`/api/country-settings?countryId=${countryId}`)
      if (response.ok) {
        const result = await response.json()
        setCountrySettings(result.data)
      }
    } catch (error) {
      console.error('Error loading country settings:', error)
    }
  }

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations
    if (!formData.name.trim()) {
      setError('El nombre o razon social es requerido')
      return
    }

    if (!formData.taxId.trim()) {
      setError('El CUIT/CUIL/DNI es requerido')
      return
    }

    if (!formData.address.trim()) {
      setError('La direccion es requerida')
      return
    }

    if (!formData.city.trim()) {
      setError('La ciudad es requerida')
      return
    }

    if (!formData.countryId) {
      setError('El pais es requerido')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar datos de facturacion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof BillingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c._id === countryId)
    setFormData(prev => ({
      ...prev,
      country: country?.name || '',
      countryId: countryId,
      state: '',
      stateId: ''
    }))
  }

  const handleStateChange = (stateId: string) => {
    const state = states.find(s => s._id === stateId)
    setFormData(prev => ({
      ...prev,
      state: state?.name || '',
      stateId: stateId
    }))
  }

  const countryOptions = [
    { value: '', label: 'Seleccionar pais...' },
    ...countries.map(c => ({ value: c._id, label: c.name }))
  ]

  const stateOptions = [
    { value: '', label: 'Seleccionar provincia...' },
    ...states.map(s => ({ value: s._id, label: s.name }))
  ]

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6 text-white flex-shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <i className="ki-duotone ki-cross text-2xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>

          <div className="relative">
            <div className="mx-auto w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
              <i className="ki-duotone ki-document text-3xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h3 className="text-xl font-bold text-center mb-1">Editar Datos de Facturacion</h3>
            <p className="text-white/90 text-sm text-center">{accountName}</p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Billing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de entidad
              </label>
              <div className="grid grid-cols-2 gap-3">
                {billingTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('type', option.value)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      formData.type === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.type === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <i className={`ki-duotone ${option.value === 'INDIVIDUAL' ? 'ki-profile-user' : 'ki-office-bag'} text-lg`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                        </i>
                      </div>
                      <span className={`text-sm font-medium ${
                        formData.type === option.value ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Tax ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={formData.type === 'BUSINESS' ? 'Razon Social' : 'Nombre Completo'}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={formData.type === 'BUSINESS' ? 'Mi Empresa S.A.' : 'Juan Perez'}
                required
                disabled={isLoading}
              />
              <Input
                label={formData.type === 'BUSINESS' ? 'CUIT' : 'CUIT/CUIL/DNI'}
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="20-12345678-9"
                required
                disabled={isLoading}
              />
            </div>

            {/* Address */}
            <Input
              label="Direccion Fiscal"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Av. Corrientes 1234, Piso 5"
              required
              disabled={isLoading}
            />

            {/* City & Zip */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ciudad"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Buenos Aires"
                required
                disabled={isLoading}
              />
              <Input
                label="Codigo Postal"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                placeholder="1234"
                disabled={isLoading}
              />
            </div>

            {/* Country & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pais <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.countryId}
                  onChange={handleCountryChange}
                  options={countryOptions}
                  disabled={isLoading || loadingCountries}
                  placeholder={loadingCountries ? 'Cargando...' : 'Seleccionar pais...'}
                  searchable
                  searchPlaceholder="Buscar pais..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Provincia
                </label>
                <Select
                  value={formData.stateId}
                  onChange={handleStateChange}
                  options={stateOptions}
                  disabled={isLoading || loadingStates || !formData.countryId}
                  placeholder={loadingStates ? 'Cargando...' : 'Seleccionar provincia...'}
                  searchable
                  searchPlaceholder="Buscar provincia..."
                />
              </div>
            </div>

            {/* Tax Configuration - Only for business */}
            {formData.type === 'BUSINESS' && (
              <>
                {/* VAT Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Condición ante IVA
                  </label>
                  <Select
                    value={formData.vatType}
                    onChange={(value) => handleChange('vatType', value)}
                    options={[
                      { value: '', label: 'Seleccionar condición...' },
                      ...(countrySettings?.vatType?.map(v => ({
                        value: v.id,
                        label: v.name
                      })) || [])
                    ]}
                    disabled={isLoading || !formData.countryId}
                    placeholder="Seleccionar condición"
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <i className="ki-duotone ki-information-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
