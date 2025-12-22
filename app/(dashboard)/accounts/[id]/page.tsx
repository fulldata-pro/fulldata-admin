'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ServiceLabels, ServiceType } from '@/lib/constants'
import { formatDate, formatDateTime } from '@/lib/utils/dateUtils'

interface User {
  _id: string
  uid: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  emailVerifiedAt?: string
  phoneVerifiedAt?: string
}

interface Benefit {
  _id: string
  name: string
  code: string
  advantage: {
    type: string
    value: number
  }
  isEnabled: boolean
}

interface SearchBalance {
  type: ServiceType
  proxyId: string
  totalAvailable: number
  totalPurchased: number
  totalConsumed: number
}

interface AccountBenefit {
  benefit: Benefit
  appliedAt: string
  expiresAt?: string
}

interface ServiceConfig {
  maxRequestsPerDay?: number
  maxRequestsPerMonth?: number
  webhookEnabled?: boolean
  apiEnabled?: boolean
}

interface Account {
  _id: string
  uid: string
  name: string
  avatar?: string
  status: string
  billing?: {
    name?: string
    taxId?: string
    type?: string
    address?: string
    city?: string
    zip?: string
    activity?: string
    verifiedAt?: string
  }
  serviceConfig?: ServiceConfig
  users: {
    user: User
    role: string
    addedAt: string
  }[]
  benefits: AccountBenefit[]
  referralCode?: string
  referralBalance?: number
  createdAt: string
  updatedAt?: string
}

interface Balance {
  searchBalances: SearchBalance[]
}

interface WebhookConfig {
  type: string
  url: string
  events: string[]
  headers?: Record<string, string>
  isEnabled: boolean
}

interface AccountApi {
  _id: string
  id: number
  uid: string
  isEnabled: boolean
  apiKey: string
  webhooks: WebhookConfig[]
  createdAt: string
}

interface NewUserForm {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function AccountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [account, setAccount] = useState<Account | null>(null)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [accountApi, setAccountApi] = useState<AccountApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [userActionDropdown, setUserActionDropdown] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`/api/accounts/${id}`)
        if (response.ok) {
          const data = await response.json()
          setAccount(data.account)
          setBalance(data.balance)
          setAccountApi(data.accountApi)
        } else if (response.status === 404) {
          toast.error('Cuenta no encontrada')
          router.push('/accounts')
        }
      } catch {
        toast.error('Error al cargar cuenta')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchAccount()
    }
  }, [id, router])

  const copyApiKey = async () => {
    if (accountApi?.apiKey) {
      await navigator.clipboard.writeText(accountApi.apiKey)
      setCopiedKey(true)
      toast.success('API Key copiada al portapapeles')
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        setAccount(data.account)
        toast.success('Estado actualizado correctamente')
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch {
      toast.error('Error al actualizar estado')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingUser(true)

    try {
      const response = await fetch(`/api/accounts/${id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      })

      if (response.ok) {
        const data = await response.json()
        setAccount((prev) =>
          prev ? { ...prev, users: [...prev.users, data.user] } : null
        )
        setShowAddUserModal(false)
        setNewUserForm({ firstName: '', lastName: '', email: '', phone: '' })
        toast.success('Usuario agregado correctamente')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al agregar usuario')
      }
    } catch {
      toast.error('Error al agregar usuario')
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('¿Estas seguro de remover este usuario de la cuenta?')) return

    try {
      const response = await fetch(`/api/accounts/${id}/users?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccount((prev) =>
          prev ? { ...prev, users: prev.users.filter((u) => u._id !== userId) } : null
        )
        toast.success('Usuario removido correctamente')
      } else {
        toast.error('Error al remover usuario')
      }
    } catch {
      toast.error('Error al remover usuario')
    }
    setUserActionDropdown(null)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { badge: 'badge-success', label: 'Activo', icon: 'ki-check-circle', color: 'text-green-500' }
      case 'PENDING':
        return { badge: 'badge-warning', label: 'Pendiente', icon: 'ki-time', color: 'text-yellow-500' }
      case 'SUSPENDED':
        return { badge: 'badge-danger', label: 'Suspendido', icon: 'ki-cross-circle', color: 'text-red-500' }
      case 'INACTIVE':
        return { badge: 'badge-gray', label: 'Inactivo', icon: 'ki-minus-circle', color: 'text-gray-500' }
      default:
        return { badge: 'badge-gray', label: status, icon: 'ki-information', color: 'text-gray-500' }
    }
  }

  const getTotalCredits = () => {
    if (!balance?.searchBalances) return { available: 0, purchased: 0, consumed: 0 }
    return balance.searchBalances.reduce(
      (acc, sb) => ({
        available: acc.available + sb.totalAvailable,
        purchased: acc.purchased + sb.totalPurchased,
        consumed: acc.consumed + sb.totalConsumed,
      }),
      { available: 0, purchased: 0, consumed: 0 }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando cuenta...</p>
        </div>
      </div>
    )
  }

  if (!account) {
    return null
  }

  const statusConfig = getStatusConfig(account.status)
  const totalCredits = getTotalCredits()
  const creditUsagePercent = totalCredits.purchased > 0 ? (totalCredits.consumed / totalCredits.purchased) * 100 : 0

  const tabs = [
    { id: 'info', label: 'Informacion', icon: 'ki-information-2' },
    { id: 'users', label: 'Usuarios', icon: 'ki-people', count: account.users?.length || 0 },
    { id: 'balance', label: 'Balance', icon: 'ki-wallet' },
    { id: 'benefits', label: 'Beneficios', icon: 'ki-gift', count: account.benefits?.length || 0 },
    { id: 'apikeys', label: 'API Keys', icon: 'ki-key' },
    { id: 'webhooks', label: 'Webhooks', icon: 'ki-notification-on', count: accountApi?.webhooks?.length || 0 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/accounts" className="hover:text-primary transition-colors">
          Cuentas
        </Link>
        <i className="ki-duotone ki-right text-xs">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <span className="text-gray-900 font-medium">{account.billing?.name || account.uid}</span>
      </nav>

      {/* Header Card */}
      <div className="card-glass-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Account Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(account.billing?.name || account.name || account.uid).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{account.billing?.name || account.name}</h1>
                  <span className={`badge ${statusConfig.badge}`}>{statusConfig.label}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{account.uid}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <i className="ki-duotone ki-calendar text-base">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Cliente desde {formatDate(account.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <select
                value={account.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="ACTIVE" className="text-gray-900">Activo</option>
                <option value="PENDING" className="text-gray-900">Pendiente</option>
                <option value="SUSPENDED" className="text-gray-900">Suspendido</option>
                <option value="INACTIVE" className="text-gray-900">Inactivo</option>
              </select>
              <Link
                href={`/accounts/${id}/edit`}
                className="bg-white text-secondary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
              >
                <i className="ki-duotone ki-pencil text-lg">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Editar
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-gray-400 text-sm mb-1">Usuarios</p>
              <p className="text-2xl font-bold">{account.users?.length || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Creditos Disponibles</p>
              <p className="text-2xl font-bold text-primary">{totalCredits.available.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Balance Referidos</p>
              <p className="text-2xl font-bold">${(account.referralBalance || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Beneficios Activos</p>
              <p className="text-2xl font-bold">{account.benefits?.filter((b) => b.benefit.isEnabled).length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all font-medium ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              } rounded-t-lg`}
            >
              <i className={`ki-duotone ${tab.icon} text-xl`}>
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General info */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <i className="ki-duotone ki-profile-circle text-xl text-blue-600">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
              <h3 className="text-lg font-semibold text-secondary">Informacion General</h3>
            </div>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500 flex items-center gap-2">
                  <i className="ki-duotone ki-key text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  UID
                </dt>
                <dd className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">{account.uid}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500 flex items-center gap-2">
                  <i className="ki-duotone ki-share text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  Codigo Referido
                </dt>
                <dd>
                  {account.referralCode ? (
                    <code className="font-mono text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">
                      {account.referralCode}
                    </code>
                  ) : (
                    <span className="text-gray-400">Sin codigo</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500 flex items-center gap-2">
                  <i className="ki-duotone ki-dollar text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  Balance Referidos
                </dt>
                <dd className="font-bold text-lg text-green-600">${(account.referralBalance || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between items-center py-2">
                <dt className="text-gray-500 flex items-center gap-2">
                  <i className="ki-duotone ki-calendar text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Fecha de Creacion
                </dt>
                <dd className="font-medium">{formatDateTime(account.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Billing info */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <i className="ki-duotone ki-bill text-xl text-green-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                    <span className="path6"></span>
                  </i>
                </div>
                <h3 className="text-lg font-semibold text-secondary">Datos de Facturacion</h3>
              </div>
              {account.billing?.verifiedAt ? (
                <span className="badge badge-success flex items-center gap-1">
                  <i className="ki-duotone ki-verify text-sm">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Verificado
                </span>
              ) : (
                <span className="badge badge-warning flex items-center gap-1">
                  <i className="ki-duotone ki-time text-sm">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Pendiente
                </span>
              )}
            </div>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500">Nombre/Razon Social</dt>
                <dd className="font-medium">{account.billing?.name || <span className="text-gray-400">-</span>}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500">CUIT/DNI</dt>
                <dd className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                  {account.billing?.taxId || <span className="text-gray-400 font-sans">-</span>}
                </dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500">Tipo</dt>
                <dd className="font-medium capitalize">{account.billing?.type || <span className="text-gray-400">-</span>}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500">Direccion</dt>
                <dd className="font-medium text-right max-w-[200px]">
                  {account.billing?.address || <span className="text-gray-400">-</span>}
                </dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <dt className="text-gray-500">Ciudad</dt>
                <dd className="font-medium">{account.billing?.city || <span className="text-gray-400">-</span>}</dd>
              </div>
              <div className="flex justify-between items-center py-2">
                <dt className="text-gray-500">Actividad</dt>
                <dd className="font-medium">{account.billing?.activity || <span className="text-gray-400">-</span>}</dd>
              </div>
            </dl>
          </div>

          {/* API Settings */}
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <i className="ki-duotone ki-code text-xl text-purple-600">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <h3 className="text-lg font-semibold text-secondary">Configuracion API</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    account.serviceConfig?.apiEnabled ? 'bg-green-100' : 'bg-gray-200'
                  }`}
                >
                  <i
                    className={`ki-duotone ki-toggle-on-circle text-2xl ${
                      account.serviceConfig?.apiEnabled ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <p className="text-sm text-gray-500 mb-1">API</p>
                <p className={`font-semibold ${account.serviceConfig?.apiEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {account.serviceConfig?.apiEnabled ? 'Habilitada' : 'Deshabilitada'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    account.serviceConfig?.webhookEnabled ? 'bg-green-100' : 'bg-gray-200'
                  }`}
                >
                  <i
                    className={`ki-duotone ki-notification-on text-2xl ${
                      account.serviceConfig?.webhookEnabled ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </div>
                <p className="text-sm text-gray-500 mb-1">Webhooks</p>
                <p className={`font-semibold ${account.serviceConfig?.webhookEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {account.serviceConfig?.webhookEnabled ? 'Habilitados' : 'Deshabilitados'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-blue-100">
                  <i className="ki-duotone ki-calendar text-2xl text-blue-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <p className="text-sm text-gray-500 mb-1">Requests/Dia</p>
                <p className="font-bold text-xl text-secondary">{(account.serviceConfig?.maxRequestsPerDay || 100).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-blue-100">
                  <i className="ki-duotone ki-calendar-tick text-2xl text-blue-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                    <span className="path6"></span>
                  </i>
                </div>
                <p className="text-sm text-gray-500 mb-1">Requests/Mes</p>
                <p className="font-bold text-xl text-secondary">{(account.serviceConfig?.maxRequestsPerMonth || 1000).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Add User Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <i className="ki-duotone ki-plus text-xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              Agregar Usuario
            </button>
          </div>

          <div className="card p-0">
            {account.users?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-header">Usuario</th>
                      <th className="table-header">Contacto</th>
                      <th className="table-header">Verificaciones</th>
                      <th className="table-header w-20">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {account.users.map((accountUser) => (
                      <tr key={accountUser.user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            {accountUser.user.avatar ? (
                              <img
                                src={accountUser.user.avatar}
                                alt={accountUser.user.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                                {accountUser.user.firstName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-secondary">
                                {accountUser.user.firstName} {accountUser.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">{accountUser.user.uid}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div>
                            <p className="text-gray-900 flex items-center gap-2">
                              <i className="ki-duotone ki-sms text-gray-400">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              {accountUser.user.email}
                            </p>
                            {accountUser.user.phone && (
                              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <i className="ki-duotone ki-phone text-gray-400">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                                {accountUser.user.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {accountUser.user.emailVerifiedAt ? (
                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                  <i className="ki-duotone ki-verify text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Email verificado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                                  <i className="ki-duotone ki-time text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Email pendiente
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {accountUser.user.phoneVerifiedAt ? (
                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                  <i className="ki-duotone ki-verify text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Telefono verificado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                                  <i className="ki-duotone ki-time text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Telefono pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell relative">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setUserActionDropdown(userActionDropdown === accountUser.user._id ? null : accountUser.user._id)
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <i className="ki-duotone ki-dots-vertical text-xl text-gray-500">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                              </i>
                            </button>
                            {userActionDropdown === accountUser.user._id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                  onClick={() => handleRemoveUser(accountUser.user._id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <i className="ki-duotone ki-trash text-xl">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                    <span className="path4"></span>
                                    <span className="path5"></span>
                                  </i>
                                  Remover de cuenta
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ki-duotone ki-people text-3xl text-gray-400">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Sin usuarios</h3>
                <p className="text-gray-500 mb-4">Esta cuenta aun no tiene usuarios asociados</p>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <i className="ki-duotone ki-plus text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Agregar Usuario
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-1">Resumen de Creditos</h3>
                <p className="text-gray-500">Estado general de los creditos de la cuenta</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{totalCredits.available.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Disponibles</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">{totalCredits.purchased.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Comprados</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-500">{totalCredits.consumed.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Consumidos</p>
                </div>
              </div>
            </div>
            {totalCredits.purchased > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uso total de creditos</span>
                  <span className="text-sm font-medium">{creditUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Balance by Service */}
          {balance?.searchBalances && balance.searchBalances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balance.searchBalances.map((sb, index) => {
                const usagePercent = sb.totalPurchased > 0 ? (sb.totalConsumed / sb.totalPurchased) * 100 : 0
                return (
                  <div key={index} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <i className="ki-duotone ki-search-list text-xl text-primary">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        </div>
                        <span className="font-medium text-secondary">{ServiceLabels[sb.type]}</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">{sb.totalAvailable.toLocaleString()}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Comprados</span>
                        <span className="font-medium">{sb.totalPurchased.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Consumidos</span>
                        <span className="font-medium">{sb.totalConsumed.toLocaleString()}</span>
                      </div>
                      <div className="pt-2">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right">{usagePercent.toFixed(1)}% usado</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-wallet text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin balance</h3>
              <p className="text-gray-500">Esta cuenta aun no tiene creditos asignados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="card p-0">
          {account.benefits?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Beneficio</th>
                    <th className="table-header">Codigo</th>
                    <th className="table-header">Ventaja</th>
                    <th className="table-header">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {account.benefits.map((accountBenefit) => (
                    <tr key={accountBenefit.benefit._id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <i className="ki-duotone ki-gift text-xl text-yellow-600">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                            </i>
                          </div>
                          <span className="font-medium">{accountBenefit.benefit.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono">{accountBenefit.benefit.code}</code>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {accountBenefit.benefit.advantage.type === 'PERCENTAGE' && (
                            <>
                              <span className="text-2xl font-bold text-green-600">{accountBenefit.benefit.advantage.value}%</span>
                              <span className="text-gray-500">descuento</span>
                            </>
                          )}
                          {accountBenefit.benefit.advantage.type === 'CREDITS' && (
                            <>
                              <span className="text-2xl font-bold text-primary">
                                {accountBenefit.benefit.advantage.value.toLocaleString()}
                              </span>
                              <span className="text-gray-500">creditos</span>
                            </>
                          )}
                          {accountBenefit.benefit.advantage.type !== 'PERCENTAGE' && accountBenefit.benefit.advantage.type !== 'CREDITS' && (
                            <>
                              <span className="text-2xl font-bold text-green-600">
                                ${accountBenefit.benefit.advantage.value.toLocaleString()}
                              </span>
                              <span className="text-gray-500">de descuento</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        {accountBenefit.benefit.isEnabled ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-gift text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin beneficios</h3>
              <p className="text-gray-500">Esta cuenta aun no tiene beneficios asociados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          {accountApi ? (
            <>
              {/* API Key Card */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <i className="ki-duotone ki-key text-xl text-purple-600">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary">API Key</h3>
                    <p className="text-sm text-gray-500">Clave de autenticacion para la API</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* API Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${accountApi.isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">Estado de la API</span>
                    </div>
                    <span className={`badge ${accountApi.isEnabled ? 'badge-success' : 'badge-danger'}`}>
                      {accountApi.isEnabled ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                  </div>

                  {/* API Key Display */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm text-gray-500 mb-2 block">API Key</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 font-mono text-sm bg-white border border-gray-200 rounded-lg px-4 py-3 overflow-hidden">
                        {showApiKey ? (
                          <span className="break-all">{accountApi.apiKey}</span>
                        ) : (
                          <span className="text-gray-400">{'•'.repeat(40)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-3 hover:bg-gray-200 rounded-lg transition-colors"
                        title={showApiKey ? 'Ocultar' : 'Mostrar'}
                      >
                        <i className={`ki-duotone ${showApiKey ? 'ki-eye-slash' : 'ki-eye'} text-xl text-gray-600`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                        </i>
                      </button>
                      <button
                        onClick={copyApiKey}
                        className={`p-3 rounded-lg transition-colors ${copiedKey ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-600'}`}
                        title="Copiar"
                      >
                        <i className={`ki-duotone ${copiedKey ? 'ki-check' : 'ki-copy'} text-xl`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">ID de API</p>
                      <p className="font-mono font-medium">{accountApi.id}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">UID</p>
                      <p className="font-mono font-medium">{accountApi.uid}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Fecha de Creacion</p>
                      <p className="font-medium">{formatDateTime(accountApi.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Tips */}
              <div className="card border-l-4 border-l-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="ki-duotone ki-information-2 text-xl text-blue-600">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">Como usar la API Key</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Incluye la API Key en el header de autenticacion de tus requests:
                    </p>
                    <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      Authorization: Bearer {showApiKey ? accountApi.apiKey : 'fd_xxxxxxxxxxxxxxxx...'}
                    </code>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-key text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin API Key</h3>
              <p className="text-gray-500">Esta cuenta no tiene una API Key configurada</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {accountApi?.webhooks && accountApi.webhooks.length > 0 ? (
            <div className="space-y-4">
              {accountApi.webhooks.map((webhook, index) => (
                <div key={index} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhook.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <i className={`ki-duotone ki-notification-on text-xl ${webhook.isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary">{webhook.type}</h4>
                        <p className="text-sm text-gray-500">Webhook #{index + 1}</p>
                      </div>
                    </div>
                    <span className={`badge ${webhook.isEnabled ? 'badge-success' : 'badge-gray'}`}>
                      {webhook.isEnabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* URL */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">URL</p>
                      <p className="font-mono text-sm break-all">{webhook.url}</p>
                    </div>

                    {/* Events */}
                    {webhook.events && webhook.events.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Eventos suscritos</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event, eventIndex) => (
                            <span key={eventIndex} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Headers */}
                    {webhook.headers && Object.keys(webhook.headers).length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Headers personalizados</p>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          {Object.entries(webhook.headers).map(([key, value], headerIndex) => (
                            <div key={headerIndex} className="flex items-center gap-2 text-sm font-mono">
                              <span className="text-purple-600">{key}:</span>
                              <span className="text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-notification-on text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin webhooks</h3>
              <p className="text-gray-500">Esta cuenta no tiene webhooks configurados</p>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-secondary">Agregar Usuario</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-2xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    type="text"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Apellido *</label>
                  <input
                    type="text"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Telefono</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={isAddingUser} className="btn-primary flex items-center gap-2">
                  {isAddingUser ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-plus text-xl">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Agregar Usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
