'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
      {isEditModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <i className="ki-duotone ki-dollar text-xl text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Editar Precio - {editingPricing?.countryCode}
                  </h3>
                  <p className="text-sm text-gray-500">Modifica la configuración de precios</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="label">
                  Precio por Token ({editingPricing?.currency})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  Compra Mínima (tokens)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  Compra Máxima (tokens)
                </label>
                <input
                  type="number"
                  value={formData.maxPurchase || ''}
                  onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Sin límite"
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Configuración habilitada
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-check text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Modal */}
      {isCreateModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <i className="ki-duotone ki-dollar text-xl text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nuevo Precio de Tokens
                  </h3>
                  <p className="text-sm text-gray-500">Configura precios por país y moneda</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Código de País
                  </label>
                  <input
                    type="text"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                    placeholder="AR"
                    maxLength={2}
                    className="input-field uppercase"
                  />
                </div>

                <div>
                  <label className="label">
                    Moneda
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    placeholder="ARS"
                    maxLength={3}
                    className="input-field uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Precio por Token
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0.0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Compra Mínima
                    <span className="text-xs text-gray-400 ml-1">(tokens)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="label">
                    Compra Máxima
                    <span className="text-xs text-gray-400 ml-1">(tokens)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxPurchase || ''}
                    onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Sin límite"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isEnabledCreate"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="isEnabledCreate" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Configuración habilitada
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCreate}
                className="btn btn-primary flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-plus text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Crear
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
