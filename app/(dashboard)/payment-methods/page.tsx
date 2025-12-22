'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, Column } from '@/components/ui/DataTable'
import {
  PaymentMethodType,
  PaymentMethodAccepted,
  PaymentMethodTypeValue,
  PaymentMethodAcceptedValue,
  Currencies,
} from '@/lib/constants'

interface PaymentMethod {
  id: number
  uid: string
  type: string
  name: string
  icon?: string
  color?: string
  currency: string
  acceptedMethods: string[]
  isEnabled: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const PaymentMethodTypeLabels: Record<PaymentMethodTypeValue, string> = {
  CREDIT_CARD: 'Tarjeta de Crédito',
  DEBIT_CARD: 'Tarjeta de Débito',
  BANK_TRANSFER: 'Transferencia Bancaria',
  CRYPTO: 'Criptomonedas',
  PAYPAL: 'PayPal',
  MERCADO_PAGO: 'Mercado Pago',
  STRIPE: 'Stripe',
  OTHER: 'Otro',
}

const PaymentMethodAcceptedLabels: Record<PaymentMethodAcceptedValue, string> = {
  CREDIT_CARD: 'Tarjeta de Crédito',
  DEBIT_CARD: 'Tarjeta de Débito',
  ACCOUNT_MONEY: 'Dinero en Cuenta',
  BANK_TRANSFER: 'Transferencia',
}

const currencyFlags: Record<string, string> = {
  ARS: '🇦🇷',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  BRL: '🇧🇷',
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    currency: searchParams?.get('currency') || '',
  })

  const fetchPaymentMethods = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', searchParams?.get('limit') || '25')
      if (filterValues.currency) params.set('currency', filterValues.currency)

      const response = await fetch(`/api/payment-methods?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.paymentMethods || [])
        setPagination(data.pagination || null)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast.error('Error al cargar métodos de pago')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [searchParams])

  const handleSave = async () => {
    if (!editingMethod) return

    if (!editingMethod.name || !editingMethod.type || !editingMethod.currency) {
      toast.error('Nombre, tipo y moneda son requeridos')
      return
    }

    try {
      const isNew = !editingMethod.uid
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/payment-methods' : `/api/payment-methods/${editingMethod.uid}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMethod),
      })

      if (response.ok) {
        toast.success(isNew ? 'Método de pago creado' : 'Método de pago actualizado')
        setShowModal(false)
        setEditingMethod(null)
        fetchPaymentMethods()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar método de pago')
      }
    } catch {
      toast.error('Error al guardar método de pago')
    }
  }

  const handleDelete = async (method: PaymentMethod) => {
    if (!confirm('¿Estás seguro de eliminar este método de pago?')) return

    try {
      const response = await fetch(`/api/payment-methods/${method.uid}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Método de pago eliminado')
        fetchPaymentMethods()
      } else {
        toast.error('Error al eliminar método de pago')
      }
    } catch {
      toast.error('Error al eliminar método de pago')
    }
  }


  const openNewModal = () => {
    setEditingMethod({
      id: 0,
      uid: '',
      type: PaymentMethodType.MERCADO_PAGO,
      name: '',
      currency: 'ARS',
      acceptedMethods: [],
      isEnabled: true,
    })
    setShowModal(true)
  }

  const toggleAcceptedMethod = (methodType: string) => {
    if (!editingMethod) return

    const current = editingMethod.acceptedMethods || []
    const updated = current.includes(methodType)
      ? current.filter((m) => m !== methodType)
      : [...current, methodType]

    setEditingMethod({ ...editingMethod, acceptedMethods: updated })
  }

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (filterValues.currency) params.set('currency', filterValues.currency)
    router.push(`/payment-methods?${params}`)
  }

  const handleFilterClear = () => {
    setFilterValues({ currency: '' })
    router.push('/payment-methods')
  }

  const columns: Column<PaymentMethod>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (method) => (
        <div className="flex items-center gap-3">
          {method.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: method.color }}
            />
          )}
          <span className="font-medium text-secondary">{method.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (method) => (
        <span className="text-gray-600">
          {PaymentMethodTypeLabels[method.type as PaymentMethodTypeValue] || method.type}
        </span>
      ),
    },
    {
      key: 'currency',
      header: 'Moneda',
      render: (method) => (
        <div className="flex items-center gap-2">
          <span>{currencyFlags[method.currency] || '💰'}</span>
          <span className="font-medium">{method.currency}</span>
        </div>
      ),
    },
    {
      key: 'acceptedMethods',
      header: 'Métodos Aceptados',
      render: (method) => (
        <div className="flex flex-wrap gap-1">
          {method.acceptedMethods && method.acceptedMethods.length > 0 ? (
            method.acceptedMethods.map((am) => (
              <Badge key={am} variant="info">
                {PaymentMethodAcceptedLabels[am as PaymentMethodAcceptedValue] || am}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'isEnabled',
      header: 'Estado',
      render: (method) => (
        <Badge variant={method.isEnabled ? 'success' : 'danger'}>
          {method.isEnabled ? 'Habilitado' : 'Deshabilitado'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        data={paymentMethods}
        columns={columns}
        keyExtractor={(method) => method.uid}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/payment-methods"
        title="Métodos de Pago"
        subtitle="Configura los métodos de pago disponibles por moneda"
        headerAction={
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <i className="ki-duotone ki-plus text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nuevo Método
          </button>
        }
        filters={[
          {
            key: 'currency',
            label: 'Moneda',
            type: 'select',
            placeholder: 'Todas',
            options: Object.values(Currencies).map((c) => ({ value: c, label: c })),
          },
        ]}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues({ ...filterValues, [key]: value })}
        onFilterSubmit={handleFilterSubmit}
        onFilterClear={handleFilterClear}
        actions={[
          {
            label: 'Editar',
            icon: <i className="ki-duotone ki-pencil"><span className="path1"></span><span className="path2"></span></i>,
            onClick: (method) => {
              setEditingMethod(method)
              setShowModal(true)
            },
          },
          {
            label: 'Eliminar',
            icon: <i className="ki-duotone ki-trash"><span className="path1"></span><span className="path2"></span><span className="path3"></span><span className="path4"></span><span className="path5"></span></i>,
            onClick: handleDelete,
            className: 'text-red-600 hover:bg-red-50',
          },
        ]}
        emptyMessage="No hay métodos de pago configurados"
      />

      {/* Edit Modal */}
      {showModal && editingMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-secondary">
                {editingMethod.uid ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre</label>
                  <input
                    type="text"
                    value={editingMethod.name}
                    onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                    className="input-field"
                    placeholder="Mercado Pago Argentina"
                  />
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select
                    value={editingMethod.type}
                    onChange={(e) => setEditingMethod({ ...editingMethod, type: e.target.value })}
                    className="input-field"
                  >
                    {Object.entries(PaymentMethodTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Moneda</label>
                <select
                  value={editingMethod.currency}
                  onChange={(e) => setEditingMethod({ ...editingMethod, currency: e.target.value })}
                  className="input-field"
                >
                  {Object.values(Currencies).map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editingMethod.color || '#3B82F6'}
                      onChange={(e) => setEditingMethod({ ...editingMethod, color: e.target.value })}
                      className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingMethod.color || ''}
                      onChange={(e) => setEditingMethod({ ...editingMethod, color: e.target.value })}
                      className="input-field flex-1"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Icono (URL)</label>
                  <input
                    type="text"
                    value={editingMethod.icon || ''}
                    onChange={(e) => setEditingMethod({ ...editingMethod, icon: e.target.value })}
                    className="input-field"
                    placeholder="/images/payment-methods/mp.svg"
                  />
                </div>
              </div>

              <div>
                <label className="label mb-2">Métodos Aceptados</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PaymentMethodAcceptedLabels).map(([value, label]) => {
                    const isSelected = editingMethod.acceptedMethods?.includes(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleAcceptedMethod(value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-secondary">Habilitado</label>
                  <p className="text-sm text-gray-500">Permite usar este método de pago</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMethod.isEnabled}
                    onChange={(e) => setEditingMethod({ ...editingMethod, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingMethod(null)
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button onClick={handleSave} className="btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
