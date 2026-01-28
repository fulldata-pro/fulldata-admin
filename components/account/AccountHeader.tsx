'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { formatDate } from '@/lib/utils/dateUtils'
import { formatNumber } from '@/lib/utils/currencyUtils'
import { ROUTES } from '@/lib/constants'
import { GiftTokensModal } from '@/components/modals/GiftTokensModal'
import { ChangeStatusModal, AccountStatus } from '@/components/modals/ChangeStatusModal'

interface User {
  _id: string
  id: number
  uid: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  emailVerifiedAt?: string
  phoneVerifiedAt?: string
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  provider?: 'LOCAL' | 'GOOGLE'
}

interface Account {
  _id: string
  id: number
  uid: string
  name: string
  avatar?: string
  status: AccountStatus
  billing?: {
    name?: string
    taxId?: string
    type?: string
    address?: string
    city?: string
    zip?: string
    state?: string
    stateId?: string
    country?: string
    countryId?: string
    activity?: string
    vatType?: string
    verifiedAt?: string
  }
  serviceConfig?: {
    webhookEnabled?: boolean
    apiEnabled?: boolean
  }
  users: {
    user: User
    role: string
    addedAt: string
  }[]
  referralCode?: string
  referralBalance?: number
  createdAt: string
  updatedAt?: string
}

interface TokenBalance {
  totalAvailable: number
  totalPurchased: number
  totalBonus: number
  totalConsumed: number
  totalRefunded: number
}

interface AccountHeaderProps {
  account: Account
  tokenBalance: TokenBalance | null
  onTokensGifted?: () => void
  onStatusChanged?: () => void
  onBillingUpdated?: () => void
}

export function AccountHeader({
  account,
  tokenBalance,
  onTokensGifted,
  onStatusChanged,
  onBillingUpdated
}: AccountHeaderProps) {
  const router = useRouter()
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const actionsDropdownRef = useRef<HTMLDivElement>(null)

  const [showGiftTokensModal, setShowGiftTokensModal] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target as Node)) {
        setShowActionsDropdown(false)
      }
    }

    if (showActionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActionsDropdown])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: 'ki-check-circle',
          color: 'text-green-400',
          bgColor: 'bg-green-500',
          borderColor: 'border-green-400',
          label: 'Activa'
        }
      case 'SUSPENDED':
        return {
          icon: 'ki-information-circle',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500',
          borderColor: 'border-orange-400',
          label: 'Suspendida'
        }
      case 'BANNED':
        return {
          icon: 'ki-cross-circle',
          color: 'text-red-400',
          bgColor: 'bg-red-500',
          borderColor: 'border-red-400',
          label: 'Bloqueada'
        }
      case 'PENDING':
        return {
          icon: 'ki-time-circle',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500',
          borderColor: 'border-gray-400',
          label: 'Pendiente'
        }
      default:
        return {
          icon: 'ki-shield-slash',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400',
          borderColor: 'border-gray-300',
          label: status
        }
    }
  }

  const handleGiftTokens = async (amount: number, description: string) => {
    const response = await fetch(`/api/accounts/${account._id}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description })
    })

    if (response.ok) {
      toast.success(`Se agregaron ${amount} tokens a la cuenta`)
      setShowGiftTokensModal(false)
      onTokensGifted?.()
    } else {
      toast.error('Error al agregar tokens')
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    const response = await fetch(`/api/accounts/${account._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (response.ok) {
      toast.success('Estado actualizado correctamente')
      setShowChangeStatusModal(false)
      onStatusChanged?.()
    } else {
      toast.error('Error al cambiar el estado')
    }
  }


  const statusConfig = getStatusConfig(account.status)
  const totalTokens = {
    available: tokenBalance?.totalAvailable || 0,
    purchased: tokenBalance?.totalPurchased || 0,
    bonus: tokenBalance?.totalBonus || 0,
    consumed: tokenBalance?.totalConsumed || 0
  }

  const accountName = account.billing?.name || account.name || 'Sin Nombre'
  const initials = accountName ? accountName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'

  return (
    <>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-6">
            <div className="relative">
              {account.avatar ? (
                <img
                  src={account.avatar}
                  alt={accountName}
                  className="size-24 rounded-2xl object-cover shadow-xl"
                />
              ) : (
                <div className="size-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl font-bold">{initials}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {accountName}
                </h1>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${account.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  account.status === 'SUSPENDED' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    account.status === 'BANNED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <i className="ki-duotone ki-calendar">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span>Cliente desde {formatDate(account.createdAt)}</span>
                </div>
                {account.billing?.taxId && (
                  <div className="flex items-center gap-2">
                    <i className="ki-duotone ki-document">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <span>CUIT: {account.billing.taxId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={actionsDropdownRef}>
              <button
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="btn btn-sm bg-primary text-white hover:bg-primary-dark"
              >
                Acciones
                <i className="ki-duotone ki-down ms-2"></i>
              </button>
              {showActionsDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false)
                      setShowGiftTokensModal(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="ki-duotone ki-gift">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <span>Acreditar Tokens</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false)
                      setShowChangeStatusModal(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="ki-duotone ki-shield-tick">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <span>Cambiar Estado</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <i className="ki-duotone ki-people text-indigo-400 text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Usuarios</p>
                <p className="text-2xl font-bold text-white">
                  {account.users?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <i className="ki-duotone ki-tag text-green-400 text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Tokens Disponibles</p>
                <p className={`text-2xl font-bold ${totalTokens.available > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                  {formatNumber(totalTokens.available)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <i className="ki-duotone ki-gift text-blue-400 text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Tokens Regalados</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatNumber(totalTokens.bonus)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <i className="ki-duotone ki-chart-line text-purple-400 text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Consumidos</p>
                <p className="text-2xl font-bold text-gray-300">
                  {formatNumber(totalTokens.consumed)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GiftTokensModal
        isOpen={showGiftTokensModal}
        onClose={() => setShowGiftTokensModal(false)}
        onConfirm={handleGiftTokens}
        accountName={accountName}
        currentBalance={tokenBalance?.totalAvailable || 0}
      />

      <ChangeStatusModal
        isOpen={showChangeStatusModal}
        onClose={() => setShowChangeStatusModal(false)}
        onConfirm={handleChangeStatus}
        currentStatus={account.status}
        accountName={accountName}
      />

    </>
  )
}