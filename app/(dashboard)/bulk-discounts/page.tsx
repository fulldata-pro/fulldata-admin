'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, ActionIcon, type Column, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'
import { BulkDiscountModal, type BulkDiscountFormData } from '@/components/modals/BulkDiscountModal'

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
  const [initialFormData, setInitialFormData] = useState<BulkDiscountFormData | undefined>()

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
        setInitialFormData({
          name: detail.name,
          description: detail.description || '',
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
    setInitialFormData(undefined)
    setIsCreateModalOpen(true)
  }

  const handleSaveEdit = async (formData: BulkDiscountFormData) => {
    if (!editingDiscount) return

    try {
      const response = await fetch(`/api/bulk-discounts/${editingDiscount.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
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
        throw new Error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating bulk discount:', error)
      throw error
    }
  }

  const handleSaveCreate = async (formData: BulkDiscountFormData) => {
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
        throw new Error(data.error || 'Error al crear')
      }
    } catch (error) {
      console.error('Error creating bulk discount:', error)
      throw error
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
      <BulkDiscountModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingDiscount(null)
        }}
        onConfirm={handleSaveEdit}
        title={`Editar Descuento - ${editingDiscount?.name || ''}`}
        initialData={initialFormData}
      />

      {/* Create Modal */}
      <BulkDiscountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleSaveCreate}
        title="Nuevo Descuento por Cantidad"
      />
    </>
  )
}
