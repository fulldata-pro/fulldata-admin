'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, ActionIcon, type Column, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { DiscountType, DISCOUNT_TYPE_LABELS, DiscountTypeType } from '@/lib/constants/discount.constants'
import { formatDate } from '@/lib/utils/dateUtils'

interface DiscountCode {
  id: number
  uid: string
  code: string
  name: string
  type: DiscountTypeType
  value: number
  isEnabled: boolean
  currentUses: number
  maxUses?: number
  validFrom?: string
  validUntil?: string
  createdAt: string
}

const DEFAULT_PAGE_SIZE = 10

const discountTypeOptions = Object.values(DiscountType).map(type => ({
  value: type,
  label: DISCOUNT_TYPE_LABELS[type]
}))

export default function DiscountCodesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: DiscountType.PERCENTAGE as DiscountTypeType,
    value: 0,
    maxUses: undefined as number | undefined,
    maxUsesPerAccount: 1,
    validFrom: '',
    validUntil: '',
    minimumPurchase: undefined as number | undefined,
    maximumDiscount: undefined as number | undefined,
    isEnabled: true,
  })

  const fetchDiscountCodes = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))

      const search = searchParams?.get('search')
      if (search) params.set('search', search)

      const response = await fetch(`/api/discount-codes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDiscountCodes(data.discountCodes)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching discount codes:', error)
      toast.error('Error al cargar códigos de descuento')
    } finally {
      setIsLoading(false)
    }
  }, [pageSize, searchParams])

  useEffect(() => {
    fetchDiscountCodes()
  }, [fetchDiscountCodes])

  const handleEdit = (item: DiscountCode) => {
    setEditingCode(item)
    setFormData({
      code: item.code,
      name: item.name,
      description: '',
      type: item.type,
      value: item.value,
      maxUses: item.maxUses,
      maxUsesPerAccount: 1,
      validFrom: item.validFrom ? item.validFrom.split('T')[0] : '',
      validUntil: item.validUntil ? item.validUntil.split('T')[0] : '',
      minimumPurchase: undefined,
      maximumDiscount: undefined,
      isEnabled: item.isEnabled,
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: DiscountType.PERCENTAGE,
      value: 0,
      maxUses: undefined,
      maxUsesPerAccount: 1,
      validFrom: '',
      validUntil: '',
      minimumPurchase: undefined,
      maximumDiscount: undefined,
      isEnabled: true,
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCode) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/discount-codes/${editingCode.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          value: formData.value,
          maxUses: formData.maxUses,
          maxUsesPerAccount: formData.maxUsesPerAccount,
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          minimumPurchase: formData.minimumPurchase,
          maximumDiscount: formData.maximumDiscount,
          isEnabled: formData.isEnabled,
        }),
      })

      if (response.ok) {
        toast.success('Código actualizado correctamente')
        setIsEditModalOpen(false)
        setEditingCode(null)
        fetchDiscountCodes()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating discount code:', error)
      toast.error('Error al actualizar código')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCreate = async () => {
    if (!formData.code || !formData.name || formData.value <= 0) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validFrom: formData.validFrom || undefined,
          validUntil: formData.validUntil || undefined,
        }),
      })

      if (response.ok) {
        toast.success('Código creado correctamente')
        setIsCreateModalOpen(false)
        fetchDiscountCodes()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al crear')
      }
    } catch (error) {
      console.error('Error creating discount code:', error)
      toast.error('Error al crear código')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleEnabled = async (item: DiscountCode) => {
    try {
      const response = await fetch(`/api/discount-codes/${item.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !item.isEnabled }),
      })

      if (response.ok) {
        toast.success(item.isEnabled ? 'Código deshabilitado' : 'Código habilitado')
        fetchDiscountCodes()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error toggling discount code:', error)
      toast.error('Error al actualizar código')
    }
  }

  const handleDelete = async (item: DiscountCode) => {
    if (!confirm(`¿Está seguro de eliminar el código "${item.code}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/discount-codes/${item.uid}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Código eliminado correctamente')
        fetchDiscountCodes()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting discount code:', error)
      toast.error('Error al eliminar código')
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/discount-codes?${params}`)
  }

  const getValueDisplay = (item: DiscountCode) => {
    switch (item.type) {
      case DiscountType.PERCENTAGE:
        return `${item.value}%`
      case DiscountType.FIXED_AMOUNT:
        return `$${item.value.toLocaleString('es-AR')}`
      case DiscountType.BONUS_TOKENS:
        return `+${item.value.toLocaleString('es-AR')} tokens`
      default:
        return item.value.toString()
    }
  }

  const columns: Column<DiscountCode>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (item) => (
        <span className="font-mono font-bold text-primary">{item.code}</span>
      )
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => (
        <Badge variant="info">
          {DISCOUNT_TYPE_LABELS[item.type]}
        </Badge>
      )
    },
    {
      key: 'value',
      header: 'Valor',
      render: (item) => (
        <span className="font-semibold text-gray-900">
          {getValueDisplay(item)}
        </span>
      )
    },
    {
      key: 'uses',
      header: 'Usos',
      render: (item) => (
        <span className="text-gray-600">
          {item.currentUses}{item.maxUses ? ` / ${item.maxUses}` : ''}
        </span>
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

  const actions: ActionMenuItem<DiscountCode>[] = [
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
      onClick: handleDelete
    }
  ]

  return (
    <>
      <DataTable
        data={discountCodes}
        columns={columns}
        keyExtractor={(item) => item.uid}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/discount-codes"
        onPageSizeChange={handlePageSizeChange}
        actions={actions}
        title="Códigos de Descuento"
        subtitle="Gestión de cupones y códigos promocionales"
        emptyMessage="No hay códigos de descuento"
        headerAction={
          <button
            onClick={handleCreate}
            className="btn btn-primary flex items-center gap-2"
          >
            <i className="ki-duotone ki-plus text-lg">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nuevo Código
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
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Editar Código - {editingCode?.code}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountTypeType })}
                    className="input w-full"
                  >
                    {discountTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usos máximos
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Sin límite"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usos por cuenta
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsesPerAccount}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerAccount: parseInt(e.target.value) || 1 })}
                    className="input w-full"
                  />
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
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Nuevo Código de Descuento
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DESCUENTO20"
                  className="input w-full uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="20% de descuento en primera compra"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountTypeType })}
                    className="input w-full"
                  >
                    {discountTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compra mínima (tokens)
                  </label>
                  <input
                    type="number"
                    value={formData.minimumPurchase || ''}
                    onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Sin mínimo"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento máximo
                  </label>
                  <input
                    type="number"
                    value={formData.maximumDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Sin límite"
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usos máximos
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Sin límite"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usos por cuenta
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsesPerAccount}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerAccount: parseInt(e.target.value) || 1 })}
                    className="input w-full"
                  />
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
