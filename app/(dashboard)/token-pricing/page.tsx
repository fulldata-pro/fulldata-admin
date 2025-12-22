'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, ActionIcon, type Column, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface TokenPricing {
  id: number
  uid: string
  countryCode: string
  currency: string
  price: number
  minPurchase: number
  maxPurchase?: number
  packagesCount: number
  isEnabled: boolean
}

const DEFAULT_PAGE_SIZE = 10

export default function TokenPricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pricing, setPricing] = useState<TokenPricing[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<TokenPricing | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    countryCode: '',
    currency: '',
    price: 0,
    minPurchase: 100,
    maxPurchase: undefined as number | undefined,
    isEnabled: true,
  })

  const fetchPricing = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))

      const response = await fetch(`/api/token-pricing?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPricing(data.pricing)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching token pricing:', error)
      toast.error('Error al cargar precios de tokens')
    } finally {
      setIsLoading(false)
    }
  }, [pageSize, searchParams])

  useEffect(() => {
    fetchPricing()
  }, [fetchPricing])

  const handleEdit = (item: TokenPricing) => {
    setEditingPricing(item)
    setFormData({
      countryCode: item.countryCode,
      currency: item.currency,
      price: item.price,
      minPurchase: item.minPurchase,
      maxPurchase: item.maxPurchase,
      isEnabled: item.isEnabled,
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setFormData({
      countryCode: '',
      currency: '',
      price: 0,
      minPurchase: 100,
      maxPurchase: undefined,
      isEnabled: true,
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPricing) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/token-pricing/${editingPricing.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: formData.price,
          minPurchase: formData.minPurchase,
          maxPurchase: formData.maxPurchase,
          isEnabled: formData.isEnabled,
        }),
      })

      if (response.ok) {
        toast.success('Precio actualizado correctamente')
        setIsEditModalOpen(false)
        setEditingPricing(null)
        fetchPricing()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating pricing:', error)
      toast.error('Error al actualizar precio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCreate = async () => {
    if (!formData.countryCode || !formData.currency || formData.price <= 0) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/token-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Precio creado correctamente')
        setIsCreateModalOpen(false)
        fetchPricing()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al crear')
      }
    } catch (error) {
      console.error('Error creating pricing:', error)
      toast.error('Error al crear precio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (item: TokenPricing) => {
    if (!confirm(`¿Está seguro de eliminar la configuración de precios para ${item.countryCode}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/token-pricing/${item.uid}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Precio eliminado correctamente')
        fetchPricing()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting pricing:', error)
      toast.error('Error al eliminar precio')
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/token-pricing?${params}`)
  }

  const columns: Column<TokenPricing>[] = [
    {
      key: 'countryCode',
      header: 'País',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.countryCode}</span>
      )
    },
    {
      key: 'currency',
      header: 'Moneda',
      render: (item) => (
        <span className="font-mono text-sm text-gray-600">{item.currency}</span>
      )
    },
    {
      key: 'price',
      header: 'Precio por Token',
      render: (item) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(item.price, item.currency)}
        </span>
      )
    },
    {
      key: 'minPurchase',
      header: 'Compra Mínima',
      render: (item) => (
        <span className="text-gray-600">
          {item.minPurchase.toLocaleString('es-AR')} tokens
        </span>
      )
    },
    {
      key: 'maxPurchase',
      header: 'Compra Máxima',
      render: (item) => (
        <span className="text-gray-600">
          {item.maxPurchase ? `${item.maxPurchase.toLocaleString('es-AR')} tokens` : 'Sin límite'}
        </span>
      )
    },
    {
      key: 'isEnabled',
      header: 'Estado',
      render: (item) => (
        <Badge variant={item.isEnabled ? 'success' : 'gray'}>
          {item.isEnabled ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ]

  const actions: ActionMenuItem<TokenPricing>[] = [
    {
      label: 'Editar',
      icon: <ActionIcon icon="pencil" className="text-gray-500" />,
      onClick: handleEdit
    },
    {
      label: 'Eliminar',
      icon: <ActionIcon icon="trash" className="text-red-500" />,
      onClick: handleDelete
    }
  ]

  return (
    <>
      <DataTable
        data={pricing}
        columns={columns}
        keyExtractor={(item) => item.uid}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/token-pricing"
        onPageSizeChange={handlePageSizeChange}
        actions={actions}
        title="Precios de Tokens"
        subtitle="Configuración de precios por país y moneda"
        emptyMessage="No hay configuraciones de precios"
        headerAction={
          <button
            onClick={handleCreate}
            className="btn btn-primary flex items-center gap-2"
          >
            <i className="ki-duotone ki-plus text-lg">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nuevo Precio
          </button>
        }
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Editar Precio - {editingPricing?.countryCode}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por Token ({editingPricing?.currency})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compra Mínima (tokens)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compra Máxima (tokens)
                </label>
                <input
                  type="number"
                  value={formData.maxPurchase || ''}
                  onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Sin límite"
                  className="input w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">
                  Habilitado
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Nuevo Precio de Tokens
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de País
                </label>
                <input
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                  placeholder="AR, US, MX, etc."
                  maxLength={2}
                  className="input w-full uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  placeholder="ARS, USD, MXN, etc."
                  maxLength={3}
                  className="input w-full uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por Token
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compra Mínima (tokens)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compra Máxima (tokens)
                </label>
                <input
                  type="number"
                  value={formData.maxPurchase || ''}
                  onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Sin límite"
                  className="input w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEnabledCreate"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isEnabledCreate" className="text-sm font-medium text-gray-700">
                  Habilitado
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCreate}
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
