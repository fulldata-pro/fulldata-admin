'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface DiscountTier {
  minTokens: number
  maxTokens?: number
  discountPercentage: number
  label?: string
  isEnabled?: boolean
}

interface BulkDiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: BulkDiscountFormData) => Promise<void>
  title: string
  initialData?: BulkDiscountFormData
}

export interface BulkDiscountFormData {
  name: string
  description: string
  tiers: DiscountTier[]
  validFrom: string
  validUntil: string
  isEnabled: boolean
}

export function BulkDiscountModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  initialData
}: BulkDiscountModalProps) {
  const defaultFormData: BulkDiscountFormData = {
    name: '',
    description: '',
    tiers: [{ minTokens: 100, maxTokens: undefined, discountPercentage: 5, label: '', isEnabled: true }],
    validFrom: '',
    validUntil: '',
    isEnabled: true,
  }

  const [formData, setFormData] = useState<BulkDiscountFormData>(initialData || defaultFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || defaultFormData)
      setError('')
    }
  }, [isOpen, initialData])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || formData.tiers.length === 0) {
      setError('Nombre y al menos un nivel son requeridos')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar descuento')
    } finally {
      setIsLoading(false)
    }
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <i className="ki-duotone ki-discount text-xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Configura los niveles de descuento por volumen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            disabled={isLoading}
          >
            <i className="ki-duotone ki-cross text-xl text-gray-500">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
        </div>

        {/* Content */}
        <form id="bulk-discount-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <Input
                  label="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Descuento estándar por volumen"
                  required
                />

                <Textarea
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Descripción opcional del descuento"
                />
              </div>

              {/* Discount Tiers */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">
                    Niveles de descuento
                  </label>
                  <button
                    type="button"
                    onClick={addTier}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                  >
                    <i className="ki-duotone ki-plus-circle text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Agregar nivel
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.tiers.map((tier, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Desde (tokens)
                          </label>
                          <input
                            type="number"
                            value={tier.minTokens}
                            onChange={(e) => updateTier(index, 'minTokens', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Hasta (tokens)
                          </label>
                          <input
                            type="number"
                            value={tier.maxTokens || ''}
                            onChange={(e) => updateTier(index, 'maxTokens', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Sin límite"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Descuento (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={tier.discountPercentage}
                            onChange={(e) => updateTier(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            value={tier.label || ''}
                            onChange={(e) => updateTier(index, 'label', e.target.value)}
                            placeholder="Ej: Bronce"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                      {formData.tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="mt-7 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <i className="ki-duotone ki-trash text-xl">
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
              </div>

              {/* Settings */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label htmlFor="bulkDiscountEnabled" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Estado del descuento
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.isEnabled
                        ? 'El descuento está activo y se aplicará automáticamente'
                        : 'El descuento está inactivo y no se aplicará'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="bulkDiscountEnabled"
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Válido desde"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
                <Input
                  label="Válido hasta"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600">
                    <i className="ki-duotone ki-information-2 text-xl">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="bulk-discount-form"
            className="btn btn-primary flex items-center gap-2"
            disabled={isLoading || !formData.name}
          >
            {isLoading ? (
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
                Guardar Descuento
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}