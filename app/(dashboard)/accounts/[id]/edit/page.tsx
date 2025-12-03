'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { AccountStatus } from '@/lib/constants'

interface Account {
  _id: string
  uid: string
  email: string
  phone?: string
  status: string
  billing: {
    name?: string
    taxId?: string
    type?: 'person' | 'company'
    address?: string
    city?: string
    zip?: string
    activity?: string
    incomeTaxType?: string
    vatType?: string
    verifiedAt?: string
  }
  maxRequestsPerDay?: number
  maxRequestsPerMonth?: number
  webhookEnabled: boolean
  apiEnabled: boolean
  referralCode?: string
  referralBalance: number
}

export default function EditAccountPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Account>>({
    email: '',
    phone: '',
    status: 'PENDING',
    billing: {
      name: '',
      taxId: '',
      type: undefined,
      address: '',
      city: '',
      zip: '',
      activity: '',
    },
    maxRequestsPerDay: 100,
    maxRequestsPerMonth: 1000,
    webhookEnabled: false,
    apiEnabled: false,
  })

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`/api/accounts/${id}`)
        if (response.ok) {
          const data = await response.json()
          setFormData({
            email: data.account.email || '',
            phone: data.account.phone || '',
            status: data.account.status || 'PENDING',
            billing: {
              name: data.account.billing?.name || '',
              taxId: data.account.billing?.taxId || '',
              type: data.account.billing?.type || undefined,
              address: data.account.billing?.address || '',
              city: data.account.billing?.city || '',
              zip: data.account.billing?.zip || '',
              activity: data.account.billing?.activity || '',
            },
            maxRequestsPerDay: data.account.maxRequestsPerDay || 100,
            maxRequestsPerMonth: data.account.maxRequestsPerMonth || 1000,
            webhookEnabled: data.account.webhookEnabled || false,
            apiEnabled: data.account.apiEnabled || false,
            referralCode: data.account.referralCode || '',
          })
        } else if (response.status === 404) {
          toast.error('Cuenta no encontrada')
          router.push('/accounts')
        }
      } catch {
        toast.error('Error al cargar cuenta')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchAccount()
    }
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Cuenta actualizada correctamente')
        router.push(`/accounts/${id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar cuenta')
      }
    } catch {
      toast.error('Error al actualizar cuenta')
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateBillingField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billing: { ...prev.billing, [field]: value },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando cuenta...</p>
        </div>
      </div>
    )
  }

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
        <Link href={`/accounts/${id}`} className="hover:text-primary transition-colors">
          Detalle
        </Link>
        <i className="ki-duotone ki-right text-xs">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <span className="text-gray-900 font-medium">Editar</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Editar Cuenta</h1>
          <p className="text-gray-500 mt-1">Modifica los datos de la cuenta</p>
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
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="input-field"
              />
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
                value={formData.billing?.name}
                onChange={(e) => updateBillingField('name', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">CUIT / DNI</label>
              <input
                type="text"
                value={formData.billing?.taxId}
                onChange={(e) => updateBillingField('taxId', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select
                value={formData.billing?.type || ''}
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
                value={formData.billing?.activity}
                onChange={(e) => updateBillingField('activity', e.target.value)}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Direccion</label>
              <input
                type="text"
                value={formData.billing?.address}
                onChange={(e) => updateBillingField('address', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                value={formData.billing?.city}
                onChange={(e) => updateBillingField('city', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Codigo Postal</label>
              <input
                type="text"
                value={formData.billing?.zip}
                onChange={(e) => updateBillingField('zip', e.target.value)}
                className="input-field"
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
                onChange={(e) => updateField('maxRequestsPerDay', parseInt(e.target.value) || 0)}
                className="input-field"
                min={0}
              />
            </div>
            <div>
              <label className="label">Requests por Mes</label>
              <input
                type="number"
                value={formData.maxRequestsPerMonth}
                onChange={(e) => updateField('maxRequestsPerMonth', parseInt(e.target.value) || 0)}
                className="input-field"
                min={0}
              />
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
          <Link href={`/accounts/${id}`} className="btn-outline">
            Cancelar
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <i className="ki-duotone ki-check text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
