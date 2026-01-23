'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type AccountStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE' | 'BANNED'

interface StatusOption {
  value: AccountStatus
  label: string
  description: string
  color: string
  bgColor: string
  icon: string
}

const statusOptions: StatusOption[] = [
  {
    value: 'ACTIVE',
    label: 'Activo',
    description: 'La cuenta está activa y operativa',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    icon: 'ki-check-circle'
  },
  {
    value: 'PENDING',
    label: 'Pendiente',
    description: 'Esperando verificación o activación',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    icon: 'ki-time'
  },
  {
    value: 'SUSPENDED',
    label: 'Suspendido',
    description: 'Cuenta temporalmente suspendida',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200 hover:bg-red-100',
    icon: 'ki-minus-circle'
  },
  {
    value: 'INACTIVE',
    label: 'Inactivo',
    description: 'Cuenta desactivada',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    icon: 'ki-cross-circle'
  }
]

interface ChangeStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (status: AccountStatus) => Promise<void>
  currentStatus: AccountStatus
  accountName: string
}

export function ChangeStatusModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  accountName
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus)
    }
  }, [isOpen, currentStatus])

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

  if (!isOpen || !mounted) return null

  const handleConfirm = async () => {
    if (selectedStatus === currentStatus) {
      onClose()
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(selectedStatus)
      onClose()
    } catch {
      // Error handling is done in parent
    } finally {
      setIsLoading(false)
    }
  }

  const currentStatusOption = statusOptions.find(s => s.value === currentStatus)

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

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
              <i className="ki-duotone ki-setting-2 text-4xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h3 className="text-2xl font-bold mb-2">Cambiar Estado</h3>
            <p className="text-white/90 text-sm">{accountName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Estado actual</span>
              <span className={`font-semibold ${currentStatusOption?.color}`}>
                {currentStatusOption?.label}
              </span>
            </div>
          </div>

          {/* Status Options */}
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                disabled={isLoading}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedStatus === option.value
                    ? `${option.bgColor} border-current ${option.color}`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedStatus === option.value ? option.bgColor : 'bg-gray-100'
                  }`}>
                    <i className={`ki-duotone ${option.icon} text-xl ${
                      selectedStatus === option.value ? option.color : 'text-gray-400'
                    }`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      selectedStatus === option.value ? option.color : 'text-gray-900'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  {selectedStatus === option.value && (
                    <i className={`ki-duotone ki-check text-xl ${option.color}`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || selectedStatus === currentStatus}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
