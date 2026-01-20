'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatNumber } from '@/lib/utils/currencyUtils'

interface GiftTokensModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number, description: string) => Promise<void>
  accountName: string
  currentBalance?: number
}

export function GiftTokensModal({
  isOpen,
  onClose,
  onConfirm,
  accountName,
  currentBalance = 0
}: GiftTokensModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setDescription('')
      setError('')
    }
  }, [isOpen])

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

    const numAmount = parseInt(amount, 10)
    if (!numAmount || numAmount <= 0) {
      setError('Ingresa una cantidad válida de tokens')
      return
    }

    if (!description.trim()) {
      setError('Ingresa una descripción')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(numAmount, description.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al regalar tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '')
    setAmount(value)
  }

  const numAmount = parseInt(amount, 10) || 0
  const newBalance = currentBalance + numAmount

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white">
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

          <div className="relative text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <i className="ki-duotone ki-gift text-4xl">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
              </i>
            </div>
            <h3 className="text-2xl font-bold mb-2">Regalar Tokens</h3>
            <p className="text-white/90 text-sm">
              {accountName}
            </p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Current Balance Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Balance actual</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(currentBalance)} tokens</span>
            </div>
            {numAmount > 0 && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">Nuevo balance</span>
                <span className="text-lg font-bold text-emerald-600">{formatNumber(newBalance)} tokens</span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <Input
              label="Cantidad de tokens"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Ej: 1000"
              required
              leftIcon={
                <i className="ki-duotone ki-tag">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              }
            />
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <Textarea
              label="Descripción / Motivo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Bonificación por promoción especial"
              rows={3}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <i className="ki-duotone ki-information-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                {error}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading || !amount || !description.trim()}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="ki-duotone ki-loading animate-spin text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="ki-duotone ki-gift text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                  Regalar {numAmount > 0 ? formatNumber(numAmount) : ''} Tokens
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
