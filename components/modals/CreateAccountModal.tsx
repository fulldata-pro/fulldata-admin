'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

type BillingType = 'INDIVIDUAL' | 'BUSINESS'

interface CreateAccountData {
  // User data
  email: string
  password: string
  phone: string
  phoneCountryCode: string
  firstName: string
  lastName: string

  // Billing data
  billingName: string
  taxId: string
  billingType: BillingType
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

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: CreateAccountData) => Promise<void>
}

const billingTypeOptions = [
  { value: 'INDIVIDUAL', label: 'Persona Fisica' },
  { value: 'BUSINESS', label: 'Empresa' }
]

const phoneCountryCodes = [
  { value: '+54', label: '🇦🇷 +54' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+55', label: '🇧🇷 +55' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+56', label: '🇨🇱 +56' },
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+51', label: '🇵🇪 +51' },
  { value: '+598', label: '🇺🇾 +598' },
  { value: '+34', label: '🇪🇸 +34' }
]

export function CreateAccountModal({
  isOpen,
  onClose,
  onConfirm
}: CreateAccountModalProps) {
  const [formData, setFormData] = useState<CreateAccountData>({
    // User data
    email: '',
    password: '',
    phone: '',
    phoneCountryCode: '+54',
    firstName: '',
    lastName: '',

    // Billing data
    billingName: '',
    taxId: '',
    billingType: 'INDIVIDUAL',
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
  const [currentStep, setCurrentStep] = useState(1) // 1: User data, 2: Billing data

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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        password: '',
        phone: '',
        phoneCountryCode: '+54',
        firstName: '',
        lastName: '',
        billingName: '',
        taxId: '',
        billingType: 'INDIVIDUAL',
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
      setCurrentStep(1)
      setError('')
    }
  }, [isOpen])

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

  const validateStep1 = () => {
    if (!formData.email.trim()) {
      setError('El email es requerido')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El email no es válido')
      return false
    }
    if (!formData.password.trim()) {
      setError('La contraseña es requerida')
      return false
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es requerido')
      return false
    }
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.billingName.trim()) {
      setError('El nombre o razón social es requerido')
      return false
    }
    if (!formData.taxId.trim()) {
      setError('El CUIT/CUIL/DNI es requerido')
      return false
    }
    if (!formData.address.trim()) {
      setError('La dirección es requerida')
      return false
    }
    if (!formData.city.trim()) {
      setError('La ciudad es requerida')
      return false
    }
    if (!formData.countryId) {
      setError('El país es requerido')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    if (currentStep === 1 && validateStep1()) {
      // Auto-fill billing name with user's full name if individual
      if (formData.billingType === 'INDIVIDUAL' && !formData.billingName) {
        setFormData(prev => ({
          ...prev,
          billingName: `${prev.firstName} ${prev.lastName}`.trim()
        }))
      }
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    setError('')
    setCurrentStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (currentStep === 1) {
      handleNextStep()
      return
    }

    if (!validateStep2()) {
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateAccountData, value: string) => {
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
    { value: '', label: 'Seleccionar país...' },
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
              <i className={`ki-duotone ${currentStep === 1 ? 'ki-user' : 'ki-document'} text-3xl`}>
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
              </i>
            </div>
            <h3 className="text-xl font-bold text-center mb-1">Crear Nueva Cuenta</h3>
            <p className="text-white/90 text-sm text-center">
              {currentStep === 1 ? 'Paso 1: Nuevo Usuario (Owner)' : 'Paso 2: Datos de Facturación'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-2 h-2 rounded-full ${currentStep === 1 ? 'bg-white' : 'bg-white/40'}`}></div>
            <div className={`w-2 h-2 rounded-full ${currentStep === 2 ? 'bg-white' : 'bg-white/40'}`}></div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {currentStep === 1 ? (
              <>
                {/* User Data */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                  <div className="flex items-start gap-2 text-blue-700 text-sm">
                    <i className="ki-duotone ki-information-2 text-lg mt-0.5">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <p>Se creará un nuevo usuario con rol de Owner para esta cuenta. Este usuario tendrá acceso completo a todas las funcionalidades.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Juan"
                    required
                    disabled={isLoading}
                  />
                  <Input
                    label="Apellido"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Pérez"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="juan.perez@ejemplo.com"
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={isLoading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.phoneCountryCode}
                      onChange={(value) => handleChange('phoneCountryCode', value)}
                      options={phoneCountryCodes}
                      disabled={isLoading}
                      className="w-28"
                    />
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="11 1234-5678"
                      required
                      disabled={isLoading}
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Billing Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo de entidad
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {billingTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('billingType', option.value)}
                        disabled={isLoading}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          formData.billingType === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            formData.billingType === option.value
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
                            formData.billingType === option.value ? 'text-blue-700' : 'text-gray-700'
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
                    label={formData.billingType === 'BUSINESS' ? 'Razón Social' : 'Nombre Completo'}
                    value={formData.billingName}
                    onChange={(e) => handleChange('billingName', e.target.value)}
                    placeholder={formData.billingType === 'BUSINESS' ? 'Mi Empresa S.A.' : 'Juan Pérez'}
                    required
                    disabled={isLoading}
                  />
                  <Input
                    label={formData.billingType === 'BUSINESS' ? 'CUIT' : 'CUIT/CUIL/DNI'}
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    placeholder="20-12345678-9"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Address */}
                <Input
                  label="Dirección Fiscal"
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
                    label="Código Postal"
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
                      País <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.countryId}
                      onChange={handleCountryChange}
                      options={countryOptions}
                      disabled={isLoading || loadingCountries}
                      placeholder={loadingCountries ? 'Cargando...' : 'Seleccionar país...'}
                      searchable
                      searchPlaceholder="Buscar país..."
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
                {formData.billingType === 'BUSINESS' && (
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
                )}
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
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`${currentStep === 1 ? 'w-full' : 'flex-1'} px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                currentStep === 1 ? 'Siguiente' : 'Crear Cuenta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}