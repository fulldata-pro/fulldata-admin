'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { AccountStatus } from '@/lib/constants'

interface AccountForm {
  email: string
  phone: string
  status: string
  billing: {
    name: string
    taxId: string
    type: string
    address: string
    city: string
    zip: string
    activity: string
  }
  maxRequestsPerDay: string
  maxRequestsPerMonth: string
  webhookEnabled: boolean
  apiEnabled: boolean
}

export default function NewAccountPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)
  const [formData, setFormData] = useState<AccountForm>({
    email: '',
    phone: '',
    status: 'PENDING',
    billing: {
      name: '',
      taxId: '',
      type: '',
      address: '',
      city: '',
      zip: '',
      activity: '',
    },
    maxRequestsPerDay: '',
    maxRequestsPerMonth: '',
    webhookEnabled: false,
    apiEnabled: true,
  })

  // Debounce function
  const debounce = <T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Check email availability
  const checkEmail = useCallback(
    debounce(async (email: string) => {
      if (!email || !email.includes('@')) {
        setEmailError(null)
        return
      }

      setIsCheckingEmail(true)
      try {
        const response = await fetch(`/api/accounts/check?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.emailExists) {
            setEmailError('Ya existe una cuenta con este email')
          } else {
            setEmailError(null)
          }
        }
      } catch {
        // Ignore errors
      } finally {
        setIsCheckingEmail(false)
      }
    }, 500),
    []
  )

  // Check phone availability
  const checkPhone = useCallback(
    debounce(async (phone: string) => {
      if (!phone || phone.length < 8) {
        setPhoneError(null)
        return
      }

      setIsCheckingPhone(true)
      try {
        const response = await fetch(`/api/accounts/check?phone=${encodeURIComponent(phone)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.phoneExists) {
            setPhoneError('Ya existe una cuenta con este telefono')
          } else {
            setPhoneError(null)
          }
        }
      } catch {
        // Ignore errors
      } finally {
        setIsCheckingPhone(false)
      }
    }, 500),
    []
  )

  // Effect to check email when it changes
  useEffect(() => {
    checkEmail(formData.email)
  }, [formData.email, checkEmail])

  // Effect to check phone when it changes
  useEffect(() => {
    checkPhone(formData.phone)
  }, [formData.phone, checkPhone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (emailError || phoneError) {
      toast.error('Por favor corrige los errores antes de continuar')
      return
    }

    setIsSaving(true)

    try {
      // Prepare data - convert empty strings to null for maxRequests fields
      const dataToSend = {
        ...formData,
        maxRequestsPerDay: formData.maxRequestsPerDay ? parseInt(formData.maxRequestsPerDay) : null,
        maxRequestsPerMonth: formData.maxRequestsPerMonth ? parseInt(formData.maxRequestsPerMonth) : null,
      }

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Cuenta creada correctamente')
        router.push(`/accounts/${data.account._id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al crear cuenta')
      }
    } catch {
      toast.error('Error al crear cuenta')
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateBillingField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billing: { ...prev.billing, [field]: value },
    }))
  }

  const hasErrors = !!emailError || !!phoneError

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/accounts" className="hover:text-primary transition-colors">
          Cuentas
        </Link>
        <i className="ki-duotone ki-right text-xs">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <span className="text-gray-900 font-medium">Nueva Cuenta</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Nueva Cuenta</h1>
          <p className="text-gray-500 mt-1">Crea una nueva cuenta de cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="ki-duotone ki-profile-circle text-xl text-blue-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
            <h3 className="text-lg font-semibold text-secondary">Informacion General</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`input-field ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="email@ejemplo.com"
                  required
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <i className="ki-duotone ki-information text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  {emailError}
                </p>
              )}
            </div>
            <div>
              <label className="label">Telefono</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`input-field ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="+54 11 1234-5678"
                />
                {isCheckingPhone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {phoneError && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <i className="ki-duotone ki-information text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  {phoneError}
                </p>
              )}
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="input-field"
              >
                {Object.values(AccountStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="ki-duotone ki-bill text-xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
                <span className="path6"></span>
              </i>
            </div>
            <h3 className="text-lg font-semibold text-secondary">Datos de Facturacion</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Nombre / Razon Social</label>
              <input
                type="text"
                value={formData.billing.name}
                onChange={(e) => updateBillingField('name', e.target.value)}
                className="input-field"
                placeholder="Empresa S.A."
              />
            </div>
            <div>
              <label className="label">CUIT / DNI</label>
              <input
                type="text"
                value={formData.billing.taxId}
                onChange={(e) => updateBillingField('taxId', e.target.value)}
                className="input-field"
                placeholder="20-12345678-9"
              />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select
                value={formData.billing.type}
                onChange={(e) => updateBillingField('type', e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar...</option>
                <option value="person">Persona</option>
                <option value="company">Empresa</option>
              </select>
            </div>
            <div>
              <label className="label">Actividad</label>
              <input
                type="text"
                value={formData.billing.activity}
                onChange={(e) => updateBillingField('activity', e.target.value)}
                className="input-field"
                placeholder="Servicios de software"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Direccion</label>
              <input
                type="text"
                value={formData.billing.address}
                onChange={(e) => updateBillingField('address', e.target.value)}
                className="input-field"
                placeholder="Av. Corrientes 1234, Piso 5"
              />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                value={formData.billing.city}
                onChange={(e) => updateBillingField('city', e.target.value)}
                className="input-field"
                placeholder="Buenos Aires"
              />
            </div>
            <div>
              <label className="label">Codigo Postal</label>
              <input
                type="text"
                value={formData.billing.zip}
                onChange={(e) => updateBillingField('zip', e.target.value)}
                className="input-field"
                placeholder="C1043"
              />
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="ki-duotone ki-code text-xl text-purple-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
              </i>
            </div>
            <h3 className="text-lg font-semibold text-secondary">Configuracion API</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Requests por Dia</label>
              <input
                type="number"
                value={formData.maxRequestsPerDay}
                onChange={(e) => updateField('maxRequestsPerDay', e.target.value)}
                className="input-field"
                placeholder="Sin limite"
                min={0}
              />
              <p className="mt-1 text-xs text-gray-500">Dejar vacio para sin limite</p>
            </div>
            <div>
              <label className="label">Requests por Mes</label>
              <input
                type="number"
                value={formData.maxRequestsPerMonth}
                onChange={(e) => updateField('maxRequestsPerMonth', e.target.value)}
                className="input-field"
                placeholder="Sin limite"
                min={0}
              />
              <p className="mt-1 text-xs text-gray-500">Dejar vacio para sin limite</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.apiEnabled}
                  onChange={(e) => updateField('apiEnabled', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">API Habilitada</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.webhookEnabled}
                  onChange={(e) => updateField('webhookEnabled', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">Webhooks Habilitados</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/accounts" className="btn-outline">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving || hasErrors}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </>
            ) : (
              <>
                <i className="ki-duotone ki-plus text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Crear Cuenta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
