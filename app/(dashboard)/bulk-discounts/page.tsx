'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, ActionIcon, type Column, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'

interface DiscountTier {
  minTokens: number
  maxTokens?: number
  discountPercentage: number
  label?: string
  isEnabled?: boolean
}

interface BulkDiscount {
  id: number
  uid: string
  name: string
  description?: string
  isDefault: boolean
  tiersCount: number
  priority: number
  isEnabled: boolean
  validFrom?: string
  validUntil?: string
  createdAt: string
}

interface BulkDiscountDetail extends BulkDiscount {
  tiers: DiscountTier[]
  applicableCurrencies: string[]
  applicableCountries: string[]
  requiresVerification: boolean
  minAccountAge?: number
}

const DEFAULT_PAGE_SIZE = 10

export default function BulkDiscountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bulkDiscounts, setBulkDiscounts] = useState<BulkDiscount[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<BulkDiscountDetail | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState<{
    name: string
    description: string
    isDefault: boolean
    priority: number
    tiers: DiscountTier[]
    validFrom: string
    validUntil: string
    isEnabled: boolean
  }>({
    name: '',
    description: '',
    isDefault: false,
    priority: 0,
    tiers: [{ minTokens: 100, maxTokens: undefined, discountPercentage: 5, label: '', isEnabled: true }],
    validFrom: '',
    validUntil: '',
    isEnabled: true,
  })

  const fetchBulkDiscounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))

      const search = searchParams?.get('search')
      if (search) params.set('search', search)

      const response = await fetch(`/api/bulk-discounts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBulkDiscounts(data.bulkDiscounts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching bulk discounts:', error)
      toast.error('Error al cargar descuentos por cantidad')
    } finally {
      setIsLoading(false)
    }
  }, [pageSize, searchParams])

  useEffect(() => {
    fetchBulkDiscounts()
  }, [fetchBulkDiscounts])

  const handleEdit = async (item: BulkDiscount) => {
    try {
      const response = await fetch(`/api/bulk-discounts/${item.uid}`)
      if (response.ok) {
        const data = await response.json()
        const detail = data.bulkDiscount as BulkDiscountDetail
        setEditingDiscount(detail)
        setFormData({
          name: detail.name,
          description: detail.description || '',
          isDefault: detail.isDefault,
          priority: detail.priority,
          tiers: detail.tiers.length > 0 ? detail.tiers : [{ minTokens: 100, maxTokens: undefined, discountPercentage: 5, label: '', isEnabled: true }],
          validFrom: detail.validFrom ? detail.validFrom.split('T')[0] : '',
          validUntil: detail.validUntil ? detail.validUntil.split('T')[0] : '',
          isEnabled: detail.isEnabled,
        })
        setIsEditModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching bulk discount:', error)
      toast.error('Error al cargar detalles')
    }
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      isDefault: false,
      priority: 0,
      tiers: [{ minTokens: 100, maxTokens: undefined, discountPercentage: 5, label: '', isEnabled: true }],
      validFrom: '',
      validUntil: '',
      isEnabled: true,
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingDiscount) return

    if (!formData.name || formData.tiers.length === 0) {
      toast.error('Nombre y al menos un nivel son requeridos')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/bulk-discounts/${editingDiscount.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          isDefault: formData.isDefault,
          priority: formData.priority,
          tiers: formData.tiers,
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          isEnabled: formData.isEnabled,
        }),
      })

      if (response.ok) {
        toast.success('Descuento actualizado correctamente')
        setIsEditModalOpen(false)
        setEditingDiscount(null)
        fetchBulkDiscounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating bulk discount:', error)
      toast.error('Error al actualizar descuento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCreate = async () => {
    if (!formData.name || formData.tiers.length === 0) {
      toast.error('Nombre y al menos un nivel son requeridos')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/bulk-discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validFrom: formData.validFrom || undefined,
          validUntil: formData.validUntil || undefined,
        }),
      })

      if (response.ok) {
        toast.success('Descuento creado correctamente')
        setIsCreateModalOpen(false)
        fetchBulkDiscounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al crear')
      }
    } catch (error) {
      console.error('Error creating bulk discount:', error)
      toast.error('Error al crear descuento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleEnabled = async (item: BulkDiscount) => {
    try {
      const response = await fetch(`/api/bulk-discounts/${item.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !item.isEnabled }),
      })

      if (response.ok) {
        toast.success(item.isEnabled ? 'Descuento deshabilitado' : 'Descuento habilitado')
        fetchBulkDiscounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error toggling bulk discount:', error)
      toast.error('Error al actualizar descuento')
    }
  }

  const handleDelete = async (item: BulkDiscount) => {
    if (item.isDefault) {
      toast.error('No se puede eliminar el descuento predeterminado')
      return
    }

    if (!confirm(`¿Está seguro de eliminar el descuento "${item.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/bulk-discounts/${item.uid}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Descuento eliminado correctamente')
        fetchBulkDiscounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting bulk discount:', error)
      toast.error('Error al eliminar descuento')
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/bulk-discounts?${params}`)
  }

  const addTier = () => {
    const lastTier = formData.tiers[formData.tiers.length - 1]
    const newMinTokens = lastTier?.maxTokens ? lastTier.maxTokens + 1 : (lastTier?.minTokens || 0) + 100
    setFormData({
      ...formData,
      tiers: [
        ...formData.tiers,
        { minTokens: newMinTokens, maxTokens: undefined, discountPercentage: 0, label: '', isEnabled: true }
      ]
    })
  }

  const removeTier = (index: number) => {
    if (formData.tiers.length <= 1) return
    setFormData({
      ...formData,
      tiers: formData.tiers.filter((_, i) => i !== index)
    })
  }

  const updateTier = (index: number, field: keyof DiscountTier, value: number | string | boolean | undefined) => {
    const newTiers = [...formData.tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setFormData({ ...formData, tiers: newTiers })
  }

  const columns: Column<BulkDiscount>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{item.name}</span>
          {item.isDefault && (
            <Badge variant="info">Default</Badge>
          )}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (item) => (
        <span className="text-gray-600 truncate max-w-xs block">
          {item.description || '-'}
        </span>
      )
    },
    {
      key: 'tiersCount',
      header: 'Niveles',
      render: (item) => (
        <span className="text-gray-600">{item.tiersCount}</span>
      )
    },
    {
      key: 'priority',
      header: 'Prioridad',
      render: (item) => (
        <span className="font-mono text-gray-600">{item.priority}</span>
      )
    },
    {
      key: 'validUntil',
      header: 'Válido hasta',
      render: (item) => (
        <span className="text-gray-600">
          {item.validUntil ? formatDate(item.validUntil) : 'Sin límite'}
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

  const actions: ActionMenuItem<BulkDiscount>[] = [
    {
      label: 'Editar',
      icon: <ActionIcon icon="pencil" className="text-gray-500" />,
      onClick: handleEdit
    },
    {
      label: 'Habilitar/Deshabilitar',
      icon: <ActionIcon icon="toggle-off" className="text-gray-500" />,
      onClick: handleToggleEnabled
    },
    {
      label: 'Eliminar',
      icon: <ActionIcon icon="trash" className="text-red-500" />,
      onClick: handleDelete,
      show: (item) => !item.isDefault
    }
  ]

  const renderTierForm = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Niveles de descuento
        </label>
        <button
          type="button"
          onClick={addTier}
          className="text-sm text-primary hover:underline"
        >
          + Agregar nivel
        </button>
      </div>
      {formData.tiers.map((tier, index) => (
        <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
          <div className="flex-1 grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde (tokens)</label>
              <input
                type="number"
                value={tier.minTokens}
                onChange={(e) => updateTier(index, 'minTokens', parseInt(e.target.value) || 0)}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta (tokens)</label>
              <input
                type="number"
                value={tier.maxTokens || ''}
                onChange={(e) => updateTier(index, 'maxTokens', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Sin límite"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Descuento (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tier.discountPercentage}
                onChange={(e) => updateTier(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
              <input
                type="text"
                value={tier.label || ''}
                onChange={(e) => updateTier(index, 'label', e.target.value)}
                placeholder="Ej: Bronce"
                className="input w-full text-sm"
              />
            </div>
          </div>
          {formData.tiers.length > 1 && (
            <button
              type="button"
              onClick={() => removeTier(index)}
              className="mt-5 text-red-500 hover:text-red-700"
            >
              <i className="ki-duotone ki-trash text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
            </button>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <DataTable
        data={bulkDiscounts}
        columns={columns}
        keyExtractor={(item) => item.uid}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/bulk-discounts"
        onPageSizeChange={handlePageSizeChange}
        actions={actions}
        title="Descuentos por Cantidad"
        subtitle="Configuración de descuentos por volumen de compra"
        emptyMessage="No hay descuentos por cantidad"
        headerAction={
          <button
            onClick={handleCreate}
            className="btn btn-primary flex items-center gap-2"
          >
            <i className="ki-duotone ki-plus text-lg">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nuevo Descuento
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
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Editar Descuento - {editingDiscount?.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="input w-full"
                />
              </div>

              {renderTierForm()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mayor número = mayor prioridad</p>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                      Descuento predeterminado
                    </label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido desde
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido hasta
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="input w-full"
                  />
                </div>
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
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Nuevo Descuento por Cantidad
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Descuento estándar por volumen"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="input w-full"
                />
              </div>

              {renderTierForm()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mayor número = mayor prioridad</p>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefaultCreate"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isDefaultCreate" className="text-sm font-medium text-gray-700">
                      Descuento predeterminado
                    </label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido desde
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido hasta
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="input w-full"
                  />
                </div>
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
