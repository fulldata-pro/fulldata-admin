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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 px-8 pt-8 pb-6 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <i className="ki-duotone ki-cross text-2xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>

          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <i className="ki-duotone ki-discount text-4xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>
        </div>

        {/* Content with scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-8">
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

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="ki-duotone ki-loading animate-spin text-xl">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-check text-xl">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Guardar Descuento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}