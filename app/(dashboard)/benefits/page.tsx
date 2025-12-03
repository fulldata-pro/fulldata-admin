'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { BenefitAdvantageTypes, BenefitAdvantageType } from '@/lib/constants'
import { DataTable, Badge, Code, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'

interface BenefitAdvantage {
  type: BenefitAdvantageType
  value: number
}

interface Benefit {
  _id: string
  uid: string
  name: string
  description?: string
  code: string
  advantage: BenefitAdvantage
  isEnabled: boolean
  startDate?: string
  endDate?: string
  minimumPurchase?: number
  selfApply: boolean
  maxUses?: number
  maxUsesPerAccount?: number
  uses: { accountId: string; receiptId: string; usedAt: string }[]
  createdAt: string
}

export default function BenefitsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [isEnabled, setIsEnabled] = useState(searchParams?.get('isEnabled') || '')
  const [showModal, setShowModal] = useState(false)
  const [editingBenefit, setEditingBenefit] = useState<Partial<Benefit> | null>(null)

  const fetchBenefits = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', '10')
      if (search) params.set('search', search)
      if (isEnabled) params.set('isEnabled', isEnabled)

      const response = await fetch(`/api/benefits?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBenefits(data.benefits)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching benefits:', error)
      toast.error('Error al cargar beneficios')
    } finally {
      setIsLoading(false)
    }
  }, [search, isEnabled, searchParams])

  useEffect(() => {
    fetchBenefits()
  }, [fetchBenefits])

  const handleSave = async () => {
    if (!editingBenefit) return

    try {
      const isNew = !editingBenefit._id
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/benefits' : `/api/benefits/${editingBenefit._id}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBenefit),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isNew ? 'Beneficio creado' : 'Beneficio actualizado')
        setShowModal(false)
        setEditingBenefit(null)
        fetchBenefits()
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar beneficio')
    }
  }

  const handleDelete = async (benefit: Benefit) => {
    if (!confirm('¿Estás seguro de eliminar este beneficio?')) return

    try {
      const response = await fetch(`/api/benefits/${benefit._id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Beneficio eliminado')
        fetchBenefits()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar beneficio')
    }
  }

  const handleToggle = async (benefit: Benefit) => {
    try {
      const response = await fetch(`/api/benefits/${benefit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !benefit.isEnabled }),
      })

      if (response.ok) {
        toast.success(`Beneficio ${!benefit.isEnabled ? 'activado' : 'desactivado'}`)
        fetchBenefits()
      }
    } catch {
      toast.error('Error al actualizar beneficio')
    }
  }

  const getAdvantageLabel = (advantage: BenefitAdvantage) => {
    switch (advantage.type) {
      case 'PERCENTAGE':
        return `${advantage.value}% descuento`
      case 'FIXED':
        return `$${advantage.value} descuento`
      case 'CREDITS':
        return `${advantage.value} créditos`
      default:
        return '-'
    }
  }

  const openNewModal = () => {
    setEditingBenefit({
      name: '',
      code: '',
      description: '',
      advantage: { type: 'PERCENTAGE', value: 10 },
      isEnabled: true,
      selfApply: false,
    })
    setShowModal(true)
  }

  const columns: Column<Benefit>[] = [
    {
      key: 'name',
      header: 'Beneficio',
      render: (benefit) => (
        <div>
          <p className="font-medium text-secondary">{benefit.name}</p>
          {benefit.description && (
            <p className="text-sm text-gray-500 truncate max-w-[200px]">
              {benefit.description}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'code',
      header: 'Código',
      render: (benefit) => <Code>{benefit.code}</Code>
    },
    {
      key: 'advantage',
      header: 'Ventaja',
      render: (benefit) => (
        <Badge variant="info">{getAdvantageLabel(benefit.advantage)}</Badge>
      )
    },
    {
      key: 'uses',
      header: 'Usos',
      render: (benefit) => (
        <span>
          <span className="text-gray-700 font-medium">{benefit.uses?.length || 0}</span>
          {benefit.maxUses && (
            <span className="text-gray-400"> / {benefit.maxUses}</span>
          )}
        </span>
      )
    },
    {
      key: 'validity',
      header: 'Vigencia',
      render: (benefit) => (
        <div className="text-sm text-gray-500">
          {benefit.startDate || benefit.endDate ? (
            <div>
              {benefit.startDate && (
                <p>Desde: {formatDate(benefit.startDate)}</p>
              )}
              {benefit.endDate && (
                <p>Hasta: {formatDate(benefit.endDate)}</p>
              )}
            </div>
          ) : (
            'Sin límite'
          )}
        </div>
      )
    },
    {
      key: 'isEnabled',
      header: 'Estado',
      render: (benefit) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggle(benefit)
          }}
          className="cursor-pointer"
        >
          <Badge variant={benefit.isEnabled ? 'success' : 'gray'}>
            {benefit.isEnabled ? 'Activo' : 'Inactivo'}
          </Badge>
        </button>
      )
    }
  ]

  const filters: FilterConfig[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre o código...',
    },
    {
      key: 'isEnabled',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' },
      ],
      className: 'w-40'
    }
  ]

  const actions: ActionMenuItem<Benefit>[] = [
    {
      label: 'Editar',
      icon: <ActionIcon icon="pencil" className="text-gray-500" />,
      onClick: (benefit) => {
        setEditingBenefit(benefit)
        setShowModal(true)
      }
    },
    {
      label: 'Eliminar',
      icon: <ActionIcon icon="trash" className="text-red-500" />,
      onClick: handleDelete,
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (isEnabled) params.set('isEnabled', isEnabled)
    router.push(`/benefits?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
    setIsEnabled('')
    router.push('/benefits')
  }

  return (
    <>
      <DataTable
        data={benefits}
        columns={columns}
        keyExtractor={(benefit) => benefit._id}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/benefits"
        filters={filters}
        filterValues={{ search, isEnabled }}
        onFilterChange={(key, value) => {
          if (key === 'search') setSearch(value)
          if (key === 'isEnabled') setIsEnabled(value)
        }}
        onFilterSubmit={handleFilterSubmit}
        onFilterClear={handleFilterClear}
        actions={actions}
        title="Beneficios"
        subtitle="Gestiona códigos promocionales y descuentos"
        headerAction={
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <i className="ki-duotone ki-plus text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nuevo Beneficio
          </button>
        }
        emptyMessage="No se encontraron beneficios"
      />

      {/* Modal */}
      {showModal && editingBenefit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-secondary">
                {editingBenefit._id ? 'Editar Beneficio' : 'Nuevo Beneficio'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  value={editingBenefit.name || ''}
                  onChange={(e) => setEditingBenefit({ ...editingBenefit, name: e.target.value })}
                  className="input-field"
                  placeholder="Descuento de bienvenida"
                  required
                />
              </div>
              <div>
                <label className="label">Código</label>
                <input
                  type="text"
                  value={editingBenefit.code || ''}
                  onChange={(e) =>
                    setEditingBenefit({ ...editingBenefit, code: e.target.value.toUpperCase() })
                  }
                  className="input-field font-mono"
                  placeholder="WELCOME10"
                  required
                />
              </div>
              <div>
                <label className="label">Descripción (opcional)</label>
                <textarea
                  value={editingBenefit.description || ''}
                  onChange={(e) =>
                    setEditingBenefit({ ...editingBenefit, description: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                  placeholder="Descripción del beneficio..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo de Ventaja</label>
                  <select
                    value={editingBenefit.advantage?.type || 'PERCENTAGE'}
                    onChange={(e) =>
                      setEditingBenefit({
                        ...editingBenefit,
                        advantage: {
                          type: e.target.value as BenefitAdvantageType,
                          value: editingBenefit.advantage?.value || 0,
                        },
                      })
                    }
                    className="input-field"
                  >
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED">Monto Fijo</option>
                    <option value="CREDITS">Créditos</option>
                  </select>
                </div>
                <div>
                  <label className="label">Valor</label>
                  <input
                    type="number"
                    value={editingBenefit.advantage?.value || ''}
                    onChange={(e) =>
                      setEditingBenefit({
                        ...editingBenefit,
                        advantage: {
                          type: editingBenefit.advantage?.type || 'PERCENTAGE',
                          value: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha Inicio (opcional)</label>
                  <input
                    type="date"
                    value={editingBenefit.startDate?.split('T')[0] || ''}
                    onChange={(e) =>
                      setEditingBenefit({ ...editingBenefit, startDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Fecha Fin (opcional)</label>
                  <input
                    type="date"
                    value={editingBenefit.endDate?.split('T')[0] || ''}
                    onChange={(e) =>
                      setEditingBenefit({ ...editingBenefit, endDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Máx. Usos Total (opcional)</label>
                  <input
                    type="number"
                    value={editingBenefit.maxUses || ''}
                    onChange={(e) =>
                      setEditingBenefit({
                        ...editingBenefit,
                        maxUses: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="input-field"
                    min="1"
                  />
                </div>
                <div>
                  <label className="label">Máx. Usos por Cuenta (opcional)</label>
                  <input
                    type="number"
                    value={editingBenefit.maxUsesPerAccount || ''}
                    onChange={(e) =>
                      setEditingBenefit({
                        ...editingBenefit,
                        maxUsesPerAccount: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="label">Compra Mínima (opcional)</label>
                <input
                  type="number"
                  value={editingBenefit.minimumPurchase || ''}
                  onChange={(e) =>
                    setEditingBenefit({
                      ...editingBenefit,
                      minimumPurchase: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBenefit.isEnabled ?? true}
                    onChange={(e) =>
                      setEditingBenefit({ ...editingBenefit, isEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBenefit.selfApply ?? false}
                    onChange={(e) =>
                      setEditingBenefit({ ...editingBenefit, selfApply: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Auto-aplicar</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingBenefit(null)
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
    </>
  )
}
