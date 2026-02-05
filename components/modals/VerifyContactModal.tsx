'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { PhoneCountrySelector } from '@/components/ui/PhoneCountrySelector'

type VerifyType = 'email' | 'phone'

interface VerifyContactModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (type: VerifyType, value: string, phoneCountryCode?: string) => Promise<void>
  type: VerifyType
  currentValue?: string
  currentPhoneCountryCode?: string
  userName: string
}

export function VerifyContactModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  currentValue = '',
  currentPhoneCountryCode = '+54',
  userName
}: VerifyContactModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState('+54')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isEmail = type === 'email'
  const title = isEmail ? 'Verificar Email' : 'Verificar Telefono'
  const label = isEmail ? 'Email' : 'Telefono'
  const icon = isEmail ? 'ki-sms' : 'ki-phone'
  const gradientFrom = isEmail ? 'from-blue-500' : 'from-green-500'
  const gradientVia = isEmail ? 'via-indigo-500' : 'via-emerald-500'
  const gradientTo = isEmail ? 'to-purple-600' : 'to-teal-600'
  const buttonGradientFrom = isEmail ? 'from-blue-600' : 'from-green-600'
  const buttonGradientTo = isEmail ? 'to-indigo-600' : 'to-emerald-600'
  const buttonHoverFrom = isEmail ? 'hover:from-blue-700' : 'hover:from-green-700'
  const buttonHoverTo = isEmail ? 'hover:to-indigo-700' : 'hover:to-emerald-700'

  const hasCurrentValue = !!currentValue
  const isChangingValue = inputValue.trim() !== currentValue

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue(currentValue)
      setPhoneCountryCode(currentPhoneCountryCode || '+54')
      setError('')
    }
  }, [isOpen, currentValue, currentPhoneCountryCode])

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

    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      setError(`Ingresa el ${label.toLowerCase()} a verificar`)
      return
    }

    // Basic email validation
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      setError('Ingresa un email valido')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(type, trimmedValue, isEmail ? undefined : phoneCountryCode)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al verificar ${label.toLowerCase()}`)
    } finally {
      setIsLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className={`relative overflow-hidden rounded-t-3xl bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} p-8 text-white`}>
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
              <i className={`ki-duotone ${icon} text-4xl`}>
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-white/90 text-sm">
              {userName}
            </p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Warning Message */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <i className="ki-duotone ki-information-2 text-amber-600 text-xl mt-0.5">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Verificacion manual</p>
                <p className="text-amber-700">
                  Esta accion marca el {label.toLowerCase()} como verificado sin enviar ningun {isEmail ? 'email' : 'SMS'} al usuario.
                  {isChangingValue && hasCurrentValue && (
                    <span className="block mt-1 font-medium text-amber-800">
                      Tambien se actualizara el {label.toLowerCase()} del usuario.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Current value info */}
          {hasCurrentValue && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{label} actual registrado:</p>
              <p className="font-medium text-gray-900">{currentValue}</p>
            </div>
          )}

          {/* Input */}
          <div className="mb-6">
            {isEmail ? (
              <>
                <Input
                  label={hasCurrentValue ? `Nuevo ${label} (o confirmar actual)` : label}
                  type="email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ejemplo@email.com"
                  required
                  leftIcon={
                    <i className={`ki-duotone ${icon}`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  }
                />
                {isChangingValue && inputValue.trim() && (
                  <p className="mt-2 text-xs text-blue-600">
                    Se verificara que este email no este en uso por otro usuario.
                  </p>
                )}
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {hasCurrentValue ? `Nuevo ${label} (o confirmar actual)` : label}
                </label>
                <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-colors">
                  <PhoneCountrySelector
                    value={phoneCountryCode}
                    onChange={setPhoneCountryCode}
                    size="md"
                    buttonClassName="border-r border-gray-300"
                  />
                  <input
                    type="tel"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="1155667788"
                    required
                    className="flex-1 px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </>
            )}
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
              disabled={isLoading || !inputValue.trim()}
              className={`w-full px-6 py-3.5 bg-gradient-to-r ${buttonGradientFrom} ${buttonGradientTo} ${buttonHoverFrom} ${buttonHoverTo} text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <i className="ki-duotone ki-loading animate-spin text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Verificando...
                </>
              ) : (
                <>
                  <i className="ki-duotone ki-check-circle text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  {isChangingValue && hasCurrentValue ? 'Actualizar y verificar' : 'Marcar como verificado'}
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
