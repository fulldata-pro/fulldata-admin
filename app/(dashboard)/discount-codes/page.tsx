'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, ActionIcon, type Column, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
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
  updatedAt?: string
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
      key: 'validFrom',
      header: 'Válido desde',
      render: (item) => (
        <span className="text-gray-600">
          {item.validFrom ? formatDate(item.validFrom) : '-'}
        </span>
      )
    },
    {
      key: 'validUntil',
      header: 'Válido hasta',
      render: (item) => (
        <span className="text-gray-600">
          {item.validUntil ? formatDate(item.validUntil) : '-'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (item) => (
        <span className="text-gray-600">
          {formatDate(item.createdAt)}
        </span>
      )
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      render: (item) => (
        <span className="text-gray-600">
          {item.updatedAt ? formatDate(item.updatedAt) : '-'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <i className="ki-duotone ki-pencil text-xl text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Editar Código</h3>
                  <p className="text-sm text-gray-500 font-mono">{editingCode?.code}</p>
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
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {/* Información básica */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-information text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    Información básica
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Nombre del descuento"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: 20% de descuento en primera compra"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Tipo de descuento
                        </label>
                        <Select
                          value={formData.type}
                          onChange={(value) => setFormData({ ...formData, type: value as DiscountTypeType })}
                          options={discountTypeOptions}
                          placeholder="Seleccionar tipo"
                        />
                      </div>
                      <Input
                        label={`Valor (${formData.type === DiscountType.PERCENTAGE ? '%' : formData.type === DiscountType.BONUS_TOKENS ? 'tokens' : '$'})`}
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Límites de uso */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-shield-tick text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Límites de uso
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Usos totales máximos"
                      type="number"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Ilimitado"
                      helperText="Dejar vacío para sin límite"
                    />
                    <Input
                      label="Usos por cuenta"
                      type="number"
                      value={formData.maxUsesPerAccount}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerAccount: parseInt(e.target.value) || 1 })}
                      min={1}
                      helperText="Veces que cada cuenta puede usarlo"
                    />
                  </div>
                </div>

                {/* Vigencia */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-calendar text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Vigencia
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Fecha de inicio"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    />
                    <Input
                      label="Fecha de fin"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <i className={`ki-duotone ki-toggle-${formData.isEnabled ? 'on' : 'off'}-circle text-xl ${formData.isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Estado del código</p>
                        <p className="text-xs text-gray-500">
                          {formData.isEnabled ? 'El código está activo y puede ser usado' : 'El código está desactivado'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isEnabled: !formData.isEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
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
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-check text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <i className="ki-duotone ki-plus-square text-xl text-green-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nuevo Código de Descuento</h3>
                  <p className="text-sm text-gray-500">Crea un cupón promocional</p>
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
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {/* Identificación del código */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-tag text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    Identificación
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Código"
                      required
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VERANO2024"
                      className="uppercase font-mono tracking-wider"
                      helperText="El código que los usuarios ingresarán"
                    />

                    <Input
                      label="Nombre"
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Descuento de verano 2024"
                    />

                    <Textarea
                      label="Descripción"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="Descripción interna del código..."
                      resize="none"
                    />
                  </div>
                </div>

                {/* Configuración del descuento */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-discount text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Configuración del descuento
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Tipo <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.type}
                          onChange={(value) => setFormData({ ...formData, type: value as DiscountTypeType })}
                          options={discountTypeOptions}
                          placeholder="Seleccionar tipo"
                        />
                      </div>
                      <Input
                        label={`Valor (${formData.type === DiscountType.PERCENTAGE ? '%' : formData.type === DiscountType.BONUS_TOKENS ? 'tokens' : '$'})`}
                        required
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Compra mínima (tokens)"
                        type="number"
                        value={formData.minimumPurchase || ''}
                        onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="Sin mínimo"
                      />
                      <Input
                        label="Descuento máximo ($)"
                        type="number"
                        value={formData.maximumDiscount || ''}
                        onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="Sin límite"
                        helperText="Tope del descuento aplicable"
                      />
                    </div>
                  </div>
                </div>

                {/* Límites de uso */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-shield-tick text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Límites de uso
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Usos totales máximos"
                      type="number"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Ilimitado"
                      helperText="Dejar vacío para sin límite"
                    />
                    <Input
                      label="Usos por cuenta"
                      type="number"
                      value={formData.maxUsesPerAccount}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerAccount: parseInt(e.target.value) || 1 })}
                      min={1}
                      helperText="Veces que cada cuenta puede usarlo"
                    />
                  </div>
                </div>

                {/* Vigencia */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ki-duotone ki-calendar text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Vigencia
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Fecha de inicio"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      helperText="Dejar vacío para activar inmediatamente"
                    />
                    <Input
                      label="Fecha de fin"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      helperText="Dejar vacío para sin expiración"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <i className={`ki-duotone ki-toggle-${formData.isEnabled ? 'on' : 'off'}-circle text-xl ${formData.isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Activar al crear</p>
                        <p className="text-xs text-gray-500">
                          {formData.isEnabled ? 'El código estará disponible inmediatamente' : 'El código se creará desactivado'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isEnabled: !formData.isEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
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
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-plus text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Crear código
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
