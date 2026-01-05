'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ServiceLabels, ServiceType, ServicesType, RequestSourceLabels, WebhookEvent } from '@/lib/constants'
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils/dateUtils'
import { formatCurrency, formatNumber } from '@/lib/utils/currencyUtils'

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

interface TokenBalance {
  totalAvailable: number
  totalPurchased: number
  totalBonus: number
  totalConsumed: number
  totalRefunded: number
  consumptionByService?: {
    [key: string]: {
      tokensUsed: number
      searchCount: number
      lastUsed?: string
    }
  }
}

interface ServiceConfig {
  maxRequestsPerDay?: number
  maxRequestsPerMonth?: number
  webhookEnabled?: boolean
  apiEnabled?: boolean
}

interface Account {
  _id: string
  id: number
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
  referralCode?: string
  referralBalance?: number
  createdAt: string
  updatedAt?: string
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

interface WebhookForm {
  type: string
  url: string
  events: string[]
  headers: Record<string, string>
  isEnabled: boolean
}

interface DiscountCode {
  code: string
  name: string
  value: number
  type: string
}

interface BulkDiscount {
  name: string
  appliedTier?: {
    minTokens: number
    discountPercentage: number
    label?: string
  }
}

interface Receipt {
  id: number
  uid: string
  status: string
  total: number
  subtotal: number
  currency: string
  tokens?: {
    quantity: number
    unitPrice: number
  }
  paymentProvider?: string
  invoice?: {
    id: string
    uid: string
    number?: string
  }
  discountCode?: DiscountCode
  bulkDiscount?: BulkDiscount
  createdAt: string
}

interface Report {
  id: number
  uid: string
  type: string
  status: string
  searchQuery?: string
  isBatch?: boolean
  source?: 'API' | 'WEB' | null
  user?: {
    uid: string
    firstName: string
    lastName: string
  }
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AccountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [account, setAccount] = useState<Account | null>(null)
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [accountApi, setAccountApi] = useState<AccountApi | null>(null)
  const [discountCodesUsedCount, setDiscountCodesUsedCount] = useState(0)
  const [bulkDiscountsUsedCount, setBulkDiscountsUsedCount] = useState(0)
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
  const [isExecutingAction, setIsExecutingAction] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState<{ userId: string; currentRole: string } | null>(null)
  const [showStatusModal, setShowStatusModal] = useState<{ userId: string; currentStatus: string } | null>(null)
  const [showPhoneInputModal, setShowPhoneInputModal] = useState<{ userId: string; userName: string } | null>(null)
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState<{ userId: string; userName: string; email: string } | null>(null)
  const [showVerifyPhoneModal, setShowVerifyPhoneModal] = useState<{ userId: string; userName: string; phone: string } | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Purchases tab state
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [receiptsPagination, setReceiptsPagination] = useState<Pagination | null>(null)
  const [receiptsPage, setReceiptsPage] = useState(1)
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false)
  const [hoveredDiscount, setHoveredDiscount] = useState<string | null>(null)
  const [discountPopupPosition, setDiscountPopupPosition] = useState<{ top: number; left: number; showAbove: boolean } | null>(null)
  const discountButtonRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Reports tab state
  const [reports, setReports] = useState<Report[]>([])
  const [reportsPagination, setReportsPagination] = useState<Pagination | null>(null)
  const [reportsPage, setReportsPage] = useState(1)
  const [isLoadingReports, setIsLoadingReports] = useState(false)

  // Webhook modal state
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [isEditingWebhook, setIsEditingWebhook] = useState(false)
  const [isSavingWebhook, setIsSavingWebhook] = useState(false)
  const [webhookForm, setWebhookForm] = useState<WebhookForm>({
    type: '',
    url: '',
    events: [WebhookEvent.SEARCH_COMPLETED],
    headers: {},
    isEnabled: true,
  })
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')
  const [showDeleteWebhookModal, setShowDeleteWebhookModal] = useState<{ type: string; serviceName: string } | null>(null)
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`/api/accounts/${id}`)
        if (response.ok) {
          const data = await response.json()
          setAccount(data.account)
          setTokenBalance(data.tokenBalance)
          setAccountApi(data.accountApi)
          setDiscountCodesUsedCount(data.discountCodesUsedCount || 0)
          setBulkDiscountsUsedCount(data.bulkDiscountsUsedCount || 0)
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

  // Fetch receipts for purchases tab
  const fetchReceipts = useCallback(async () => {
    if (!account?._id) return
    setIsLoadingReceipts(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(receiptsPage))
      params.set('limit', '10')
      params.set('accountId', account._id)

      const response = await fetch(`/api/receipts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReceipts(data.receipts)
        setReceiptsPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setIsLoadingReceipts(false)
    }
  }, [account?._id, receiptsPage])

  // Fetch reports for reports tab
  const fetchReports = useCallback(async () => {
    if (!account?._id) return
    setIsLoadingReports(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(reportsPage))
      params.set('limit', '10')
      params.set('accountId', account._id)

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setReportsPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setIsLoadingReports(false)
    }
  }, [account?._id, reportsPage])

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'purchases' && receipts.length === 0 && !isLoadingReceipts) {
      fetchReceipts()
    }
    if (activeTab === 'reports' && reports.length === 0 && !isLoadingReports) {
      fetchReports()
    }
  }, [activeTab, receipts.length, reports.length, isLoadingReceipts, isLoadingReports, fetchReceipts, fetchReports])

  // Reload when page changes
  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchReceipts()
    }
  }, [receiptsPage, fetchReceipts, activeTab])

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports()
    }
  }, [reportsPage, fetchReports, activeTab])

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

  // Webhook handlers
  const openAddWebhookModal = () => {
    setWebhookForm({
      type: '',
      url: '',
      events: [WebhookEvent.SEARCH_COMPLETED],
      headers: {},
      isEnabled: true,
    })
    setIsEditingWebhook(false)
    setShowWebhookModal(true)
    setNewHeaderKey('')
    setNewHeaderValue('')
  }

  const openEditWebhookModal = (webhook: WebhookConfig) => {
    setWebhookForm({
      type: webhook.type,
      url: webhook.url,
      events: webhook.events || [WebhookEvent.SEARCH_COMPLETED],
      headers: webhook.headers || {},
      isEnabled: webhook.isEnabled,
    })
    setIsEditingWebhook(true)
    setShowWebhookModal(true)
    setNewHeaderKey('')
    setNewHeaderValue('')
  }

  const closeWebhookModal = () => {
    setShowWebhookModal(false)
    setWebhookForm({
      type: '',
      url: '',
      events: [WebhookEvent.SEARCH_COMPLETED],
      headers: {},
      isEnabled: true,
    })
    setNewHeaderKey('')
    setNewHeaderValue('')
  }

  const handleAddHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setWebhookForm((prev) => ({
        ...prev,
        headers: { ...prev.headers, [newHeaderKey.trim()]: newHeaderValue.trim() },
      }))
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const handleRemoveHeader = (key: string) => {
    setWebhookForm((prev) => {
      const newHeaders = { ...prev.headers }
      delete newHeaders[key]
      return { ...prev, headers: newHeaders }
    })
  }

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingWebhook(true)

    try {
      const method = isEditingWebhook ? 'PUT' : 'POST'
      const response = await fetch(`/api/accounts/${account?._id}/webhooks`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookForm),
      })

      if (response.ok) {
        const data = await response.json()
        setAccountApi((prev) =>
          prev ? { ...prev, webhooks: data.webhooks } : null
        )
        closeWebhookModal()
        toast.success(isEditingWebhook ? 'Webhook actualizado' : 'Webhook creado')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar webhook')
      }
    } catch {
      toast.error('Error al guardar webhook')
    } finally {
      setIsSavingWebhook(false)
    }
  }

  const confirmDeleteWebhook = async () => {
    if (!showDeleteWebhookModal) return
    setIsDeletingWebhook(true)

    try {
      const response = await fetch(`/api/accounts/${account?._id}/webhooks?type=${showDeleteWebhookModal.type}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setAccountApi((prev) =>
          prev ? { ...prev, webhooks: data.webhooks } : null
        )
        toast.success('Webhook eliminado')
        setShowDeleteWebhookModal(null)
      } else {
        toast.error('Error al eliminar webhook')
      }
    } catch {
      toast.error('Error al eliminar webhook')
    } finally {
      setIsDeletingWebhook(false)
    }
  }

  const handleToggleWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(`/api/accounts/${account?._id}/webhooks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: webhook.type,
          isEnabled: !webhook.isEnabled,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAccountApi((prev) =>
          prev ? { ...prev, webhooks: data.webhooks } : null
        )
        toast.success(webhook.isEnabled ? 'Webhook desactivado' : 'Webhook activado')
      } else {
        toast.error('Error al cambiar estado del webhook')
      }
    } catch {
      toast.error('Error al cambiar estado del webhook')
    }
  }

  // Get available service types for webhooks (exclude already used ones)
  const getAvailableServiceTypes = () => {
    const usedTypes = accountApi?.webhooks?.map((w) => w.type) || []
    return Object.entries(ServicesType).filter(
      ([, value]) => !usedTypes.includes(value) || (isEditingWebhook && webhookForm.type === value)
    )
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('¿Estas seguro de remover este usuario de la cuenta?')) return

    try {
      const response = await fetch(`/api/accounts/${id}/users?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccount((prev) =>
          prev ? { ...prev, users: prev.users.filter((u) => u.user._id !== userId) } : null
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

  const handleUserAction = async (userId: string, action: string, value?: string) => {
    setIsExecutingAction(true)
    try {
      const response = await fetch(`/api/accounts/${id}/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the user in the account state
        setAccount((prev) => {
          if (!prev) return null
          return {
            ...prev,
            users: prev.users.map((u) =>
              u.user._id === userId
                ? { ...u, user: { ...u.user, ...data.user }, role: data.role }
                : u
            ),
          }
        })
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Error al ejecutar acción')
      }
    } catch {
      toast.error('Error al ejecutar acción')
    } finally {
      setIsExecutingAction(false)
      setUserActionDropdown(null)
      setShowRoleModal(null)
      setShowStatusModal(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Propietario'
      case 'ADMIN':
        return 'Administrador'
      case 'MEMBER':
        return 'Miembro'
      default:
        return role
    }
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

  const getTotalTokens = () => {
    if (!tokenBalance) return { available: 0, purchased: 0, consumed: 0, bonus: 0 }
    return {
      available: tokenBalance.totalAvailable,
      purchased: tokenBalance.totalPurchased,
      consumed: tokenBalance.totalConsumed,
      bonus: tokenBalance.totalBonus,
    }
  }

  // Receipt status helpers
  const getReceiptStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'PENDING': return 'warning'
      case 'PROCESSING': return 'info'
      case 'FAILED': return 'danger'
      case 'REFUNDED': return 'gray'
      default: return 'gray'
    }
  }

  const getReceiptStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completado'
      case 'PENDING': return 'Pendiente'
      case 'PROCESSING': return 'Procesando'
      case 'FAILED': return 'Fallido'
      case 'REFUNDED': return 'Reembolsado'
      default: return status
    }
  }

  const handleDiscountHover = (receiptUid: string) => {
    const buttonEl = discountButtonRefs.current.get(receiptUid)
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect()
      const popupHeight = 150
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = spaceBelow < popupHeight && rect.top > popupHeight

      setDiscountPopupPosition({
        top: showAbove ? rect.top : rect.bottom + 8,
        left: rect.left,
        showAbove
      })
    }
    setHoveredDiscount(receiptUid)
  }

  const handleDiscountLeave = () => {
    setHoveredDiscount(null)
    setDiscountPopupPosition(null)
  }

  const calculateDiscountAmount = (receipt: Receipt): number => {
    return receipt.subtotal - receipt.total
  }

  // Report status helpers
  const getReportStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple' => {
    switch (status) {
      case 'PENDING': return 'gray'
      case 'REVIEW_NEEDED': return 'warning'
      case 'PROCESSING': return 'info'
      case 'PARTIAL': return 'purple'
      case 'NOT_FOUND': return 'gray'
      case 'COMPLETED': return 'success'
      case 'FAILED': return 'danger'
      case 'EXPIRED': return 'gray'
      default: return 'gray'
    }
  }

  const getReportStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'REVIEW_NEEDED': return 'Rev. necesaria'
      case 'PROCESSING': return 'Procesando'
      case 'PARTIAL': return 'Parcial'
      case 'NOT_FOUND': return 'No encontrado'
      case 'COMPLETED': return 'Completado'
      case 'FAILED': return 'Fallido'
      case 'EXPIRED': return 'Expirado'
      default: return status
    }
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
  const totalTokens = getTotalTokens()
  const tokenUsagePercent = totalTokens.purchased > 0 ? (totalTokens.consumed / totalTokens.purchased) * 100 : 0

  const tabs = [
    { id: 'info', label: 'Informacion', icon: 'ki-information-2' },
    { id: 'users', label: 'Usuarios', icon: 'ki-people', count: account.users?.length || 0 },
    { id: 'balance', label: 'Balance', icon: 'ki-wallet' },
    { id: 'purchases', label: 'Compras', icon: 'ki-basket' },
    { id: 'reports', label: 'Reportes', icon: 'ki-chart-line' },
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
        <span className="text-gray-900 font-medium">{account.billing?.name || account.name}</span>
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
              <p className="text-gray-400 text-sm mb-1">Tokens Disponibles</p>
              <p className={`text-2xl font-bold ${totalTokens.available > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                {formatNumber(totalTokens.available)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Códigos Descuento Usados</p>
              <p className="text-2xl font-bold">{discountCodesUsedCount}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Descuentos por Volumen</p>
              <p className="text-2xl font-bold">{bulkDiscountsUsedCount}</p>
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
              className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all font-medium ${activeTab === tab.id
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
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
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
                  <i className="ki-duotone ki-hashtag text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  ID
                </dt>
                <dd className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">{account.id}</dd>
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
                <dd className="font-bold text-lg text-green-600">${formatNumber(account.referralBalance || 0)}</dd>
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
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${account.serviceConfig?.apiEnabled ? 'bg-green-100' : 'bg-gray-200'
                    }`}
                >
                  <i
                    className={`ki-duotone ki-toggle-on-circle text-2xl ${account.serviceConfig?.apiEnabled ? 'text-green-600' : 'text-gray-400'
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
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${account.serviceConfig?.webhookEnabled ? 'bg-green-100' : 'bg-gray-200'
                    }`}
                >
                  <i
                    className={`ki-duotone ki-notification-on text-2xl ${account.serviceConfig?.webhookEnabled ? 'text-green-600' : 'text-gray-400'
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
                <p className="font-bold text-xl text-secondary">{formatNumber(account.serviceConfig?.maxRequestsPerDay || 100)}</p>
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
                <p className="font-bold text-xl text-secondary">{formatNumber(account.serviceConfig?.maxRequestsPerMonth || 1000)}</p>
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

          <div className="card p-0 overflow-visible">
            {account.users?.length > 0 ? (
              <div className="overflow-visible">
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
                              <p className="text-xs text-gray-500">ID: {accountUser.user.id}</p>
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
                              {!accountUser.user.phone ? (
                                <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                                  <i className="ki-duotone ki-phone text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Sin teléfono
                                </span>
                              ) : accountUser.user.phoneVerifiedAt ? (
                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                  <i className="ki-duotone ki-verify text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Teléfono verificado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                                  <i className="ki-duotone ki-time text-base">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Teléfono pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell relative">
                          <div className="relative">
                            <button
                              onClick={() => {
                                setUserActionDropdown(userActionDropdown === accountUser.user._id ? null : accountUser.user._id)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              disabled={isExecutingAction}
                            >
                              <i className="ki-duotone ki-dots-vertical text-xl text-gray-500">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                              </i>
                            </button>
                            {userActionDropdown === accountUser.user._id && (
                              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                {/* Ver perfil */}
                                <button
                                  onClick={() => {
                                    router.push(`/users/${accountUser.user._id}`)
                                    setUserActionDropdown(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <i className="ki-duotone ki-user text-lg text-gray-500">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  Ver perfil
                                </button>

                                {/* Cambiar rol - abre modal */}
                                <button
                                  onClick={() => {
                                    setShowRoleModal({ userId: accountUser.user._id, currentRole: accountUser.role })
                                    setUserActionDropdown(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <i className="ki-duotone ki-shield-tick text-lg text-gray-500">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  <span className="flex-1 text-left">Cambiar rol</span>
                                  <span className="text-xs text-gray-400">{getRoleLabel(accountUser.role)}</span>
                                </button>

                                {/* Cambiar estado - abre modal */}
                                <button
                                  onClick={() => {
                                    setShowStatusModal({ userId: accountUser.user._id, currentStatus: accountUser.user.status || 'ACTIVE' })
                                    setUserActionDropdown(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <i className={`ki-duotone text-lg ${
                                    (accountUser.user.status || 'ACTIVE') === 'ACTIVE' ? 'ki-check-circle text-green-500' :
                                    accountUser.user.status === 'SUSPENDED' ? 'ki-time text-yellow-500' :
                                    'ki-lock text-red-500'
                                  }`}>
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  <span className="flex-1 text-left">Cambiar estado</span>
                                </button>

                                <div className="border-t border-gray-100 my-2"></div>

                                {/* Verificar email */}
                                <button
                                  onClick={() => {
                                    if (!accountUser.user.emailVerifiedAt) {
                                      setShowVerifyEmailModal({
                                        userId: accountUser.user._id,
                                        userName: `${accountUser.user.firstName} ${accountUser.user.lastName}`,
                                        email: accountUser.user.email
                                      })
                                      setUserActionDropdown(null)
                                    }
                                  }}
                                  disabled={!!accountUser.user.emailVerifiedAt}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                                    accountUser.user.emailVerifiedAt
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <i className={`ki-duotone ki-sms text-lg ${accountUser.user.emailVerifiedAt ? 'text-green-500' : 'text-gray-400'}`}>
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  <span className="flex-1 text-left">Verificar email</span>
                                  {accountUser.user.emailVerifiedAt && (
                                    <i className="ki-duotone ki-check text-lg text-green-500">
                                      <span className="path1"></span>
                                      <span className="path2"></span>
                                    </i>
                                  )}
                                </button>

                                {/* Verificar teléfono */}
                                <button
                                  onClick={() => {
                                    if (!accountUser.user.phone) {
                                      // No tiene teléfono - abrir modal para agregar
                                      setShowPhoneInputModal({
                                        userId: accountUser.user._id,
                                        userName: `${accountUser.user.firstName} ${accountUser.user.lastName}`
                                      })
                                      setPhoneInput('')
                                    } else if (!accountUser.user.phoneVerifiedAt) {
                                      // Tiene teléfono pero no verificado - abrir modal de confirmación
                                      setShowVerifyPhoneModal({
                                        userId: accountUser.user._id,
                                        userName: `${accountUser.user.firstName} ${accountUser.user.lastName}`,
                                        phone: accountUser.user.phone
                                      })
                                    }
                                    setUserActionDropdown(null)
                                  }}
                                  disabled={!!accountUser.user.phoneVerifiedAt}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                                    accountUser.user.phoneVerifiedAt
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <i className={`ki-duotone ki-phone text-lg ${accountUser.user.phoneVerifiedAt ? 'text-green-500' : 'text-gray-400'}`}>
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  <span className="flex-1 text-left">Verificar teléfono</span>
                                  {accountUser.user.phoneVerifiedAt && (
                                    <i className="ki-duotone ki-check text-lg text-green-500">
                                      <span className="path1"></span>
                                      <span className="path2"></span>
                                    </i>
                                  )}
                                </button>

                                <div className="border-t border-gray-100 my-2"></div>

                                {/* Remover de cuenta */}
                                <button
                                  onClick={() => handleRemoveUser(accountUser.user._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <i className="ki-duotone ki-user-minus text-lg">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
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
                <h3 className="text-lg font-semibold text-secondary mb-1">Resumen de Tokens</h3>
                <p className="text-gray-500">Estado general de los tokens de la cuenta</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{formatNumber(totalTokens.available)}</p>
                  <p className="text-sm text-gray-500">Disponibles</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">{formatNumber(totalTokens.purchased)}</p>
                  <p className="text-sm text-gray-500">Comprados</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{formatNumber(totalTokens.bonus)}</p>
                  <p className="text-sm text-gray-500">Bonificados</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-500">{formatNumber(totalTokens.consumed)}</p>
                  <p className="text-sm text-gray-500">Consumidos</p>
                </div>
              </div>
            </div>
            {totalTokens.purchased > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uso total de tokens</span>
                  <span className="text-sm font-medium">{tokenUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Consumption by Service */}
          {tokenBalance?.consumptionByService && Object.keys(tokenBalance.consumptionByService).length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-secondary mb-4">Consumo por Servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(tokenBalance.consumptionByService).map(([serviceType, data]) => (
                  <div key={serviceType} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <i className="ki-duotone ki-search-list text-xl text-primary">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        </div>
                        <span className="font-medium text-secondary">{ServiceLabels[serviceType as ServiceType] || serviceType}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tokens usados</span>
                        <span className="font-medium">{formatNumber(data.tokensUsed)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Busquedas</span>
                        <span className="font-medium">{formatNumber(data.searchCount)}</span>
                      </div>
                      {data.lastUsed && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Ultimo uso</span>
                          <span className="font-medium">{formatDate(data.lastUsed)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : tokenBalance ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-chart-simple text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin consumo registrado</h3>
              <p className="text-gray-500">Esta cuenta aun no ha consumido tokens</p>
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
              <p className="text-gray-500">Esta cuenta aun no tiene tokens asignados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="card p-0">
          {isLoadingReceipts ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : receipts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-header">ID</th>
                      <th className="table-header">Pago</th>
                      <th className="table-header">Tokens</th>
                      <th className="table-header">Subtotal</th>
                      <th className="table-header">Descuentos</th>
                      <th className="table-header">Total</th>
                      <th className="table-header">Estado</th>
                      <th className="table-header">Factura</th>
                      <th className="table-header">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receipts.map((receipt) => (
                      <tr key={receipt.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <span className="font-mono text-sm text-gray-600">{receipt.id}</span>
                        </td>
                        <td className="table-cell">
                          {receipt.paymentProvider ? (
                            receipt.paymentProvider.toLowerCase() === 'mercado_pago' ? (
                              <Image
                                src="/images/payment-methods/mercado_pago.svg"
                                alt="MercadoPago"
                                width={80}
                                height={24}
                                className="h-6 w-auto"
                              />
                            ) : receipt.paymentProvider.toLowerCase() === 'stripe' ? (
                              <Image
                                src="/images/payment-methods/stripe.svg"
                                alt="Stripe"
                                width={50}
                                height={24}
                                className="h-6 w-auto"
                              />
                            ) : (
                              <span className="text-gray-700">{receipt.paymentProvider}</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          {receipt.tokens ? (
                            <span className="font-medium text-gray-900">
                              {formatNumber(receipt.tokens.quantity)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-600">
                            {formatCurrency(receipt.subtotal, receipt.currency)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {(() => {
                            const hasDiscountCode = receipt.discountCode
                            const hasBulkDiscount = receipt.bulkDiscount
                            const discountAmount = calculateDiscountAmount(receipt)

                            if (!hasDiscountCode && !hasBulkDiscount && discountAmount <= 0) {
                              return <span className="text-gray-400">-</span>
                            }

                            const discountCount = [hasDiscountCode, hasBulkDiscount].filter(Boolean).length

                            return (
                              <div
                                ref={(el) => {
                                  if (el) discountButtonRefs.current.set(receipt.uid, el)
                                }}
                                className="relative"
                                onMouseEnter={() => handleDiscountHover(receipt.uid)}
                                onMouseLeave={handleDiscountLeave}
                              >
                                <div className="flex items-center gap-1.5 cursor-pointer">
                                  <i className="ki-duotone ki-discount text-green-500">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  <span className="font-medium text-green-600">
                                    -{formatCurrency(discountAmount, receipt.currency)}
                                  </span>
                                  {discountCount > 1 && (
                                    <span className="text-xs text-gray-400">({discountCount})</span>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </td>
                        <td className="table-cell">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(receipt.total, receipt.currency)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge badge-${getReceiptStatusVariant(receipt.status)}`}>
                            {getReceiptStatusLabel(receipt.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {receipt.invoice ? (
                            <Link
                              href={`/billing/invoices/${receipt.invoice.id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              {receipt.invoice.number || receipt.invoice.uid}
                            </Link>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-500 text-sm">
                            {formatDateTime(receipt.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {receiptsPagination && receiptsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {receipts.length} de {receiptsPagination.total} compras
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReceiptsPage((p) => Math.max(1, p - 1))}
                      disabled={receiptsPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Pagina {receiptsPage} de {receiptsPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setReceiptsPage((p) => Math.min(receiptsPagination.totalPages, p + 1))}
                      disabled={receiptsPage === receiptsPagination.totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-basket text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin compras</h3>
              <p className="text-gray-500">Esta cuenta aun no tiene compras registradas</p>
            </div>
          )}
        </div>
      )}

      {/* Discount Popup Portal */}
      {hoveredDiscount && discountPopupPosition && typeof window !== 'undefined' && (() => {
        const hoveredReceipt = receipts.find(r => r.uid === hoveredDiscount)
        if (!hoveredReceipt) return null
        return createPortal(
          <div
            className="fixed w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-2 z-[99999] animate-fade-in"
            style={{
              top: discountPopupPosition.showAbove ? 'auto' : `${discountPopupPosition.top}px`,
              bottom: discountPopupPosition.showAbove ? `${window.innerHeight - discountPopupPosition.top + 8}px` : 'auto',
              left: `${discountPopupPosition.left}px`,
            }}
            onMouseEnter={() => setHoveredDiscount(hoveredDiscount)}
            onMouseLeave={handleDiscountLeave}
          >
            <div className="px-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuentos aplicados</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {hoveredReceipt.discountCode && (
                <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Código</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      -{hoveredReceipt.discountCode.value}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {hoveredReceipt.discountCode.code}
                    {hoveredReceipt.discountCode.name && ` - ${hoveredReceipt.discountCode.name}`}
                  </div>
                </div>
              )}
              {hoveredReceipt.bulkDiscount && (
                <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Volumen</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {hoveredReceipt.bulkDiscount.appliedTier
                        ? `-${hoveredReceipt.bulkDiscount.appliedTier.discountPercentage}%`
                        : 'Aplicado'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {hoveredReceipt.bulkDiscount.name}
                    {hoveredReceipt.bulkDiscount.appliedTier?.label && ` - ${hoveredReceipt.bulkDiscount.appliedTier.label}`}
                  </div>
                </div>
              )}
              {/* Si hay descuento pero no hay código ni bulk vinculado */}
              {!hoveredReceipt.discountCode && !hoveredReceipt.bulkDiscount && hoveredReceipt.subtotal > hoveredReceipt.total && (
                <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Descuento</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      -{Math.round((1 - hoveredReceipt.total / hoveredReceipt.subtotal) * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Descuento por paquete de tokens
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      })()}

      {activeTab === 'reports' && (
        <div className="card p-0">
          {isLoadingReports ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reports.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-header">ID</th>
                      <th className="table-header">Busqueda</th>
                      <th className="table-header">Tipo</th>
                      <th className="table-header">Origen</th>
                      <th className="table-header">Estado</th>
                      <th className="table-header">Usuario</th>
                      <th className="table-header">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <span className="font-mono text-sm text-gray-600">#{report.id}</span>
                        </td>
                        <td className="table-cell">
                          <div className="max-w-[200px]">
                            <span className="font-medium text-gray-900 truncate block">
                              {report.searchQuery || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="badge badge-info">
                              {ServiceLabels[report.type as ServiceType] || report.type}
                            </span>
                            {report.isBatch && (
                              <div className="relative group">
                                <i className="ki-duotone ki-abstract-26 text-purple-500 text-lg cursor-help">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                  Busqueda masiva
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          {report.source ? (
                            <span className={`badge ${report.source === 'API' ? 'badge-purple' : 'badge-info'}`}>
                              {RequestSourceLabels[report.source]}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={`badge badge-${getReportStatusVariant(report.status)}`}>
                            {getReportStatusLabel(report.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {report.user ? (
                            <Link
                              href={`/users/${report.user.uid}`}
                              className="text-sm text-gray-700 hover:text-primary transition-colors"
                            >
                              {report.user.firstName} {report.user.lastName}
                            </Link>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div>
                            <div className="text-sm text-gray-900">{formatDateTime(report.createdAt)}</div>
                            <div className="text-xs text-gray-500">{getRelativeTime(report.createdAt)}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {reportsPagination && reportsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {reports.length} de {reportsPagination.total} reportes
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReportsPage((p) => Math.max(1, p - 1))}
                      disabled={reportsPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Pagina {reportsPage} de {reportsPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setReportsPage((p) => Math.min(reportsPagination.totalPages, p + 1))}
                      disabled={reportsPage === reportsPagination.totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-chart-line text-3xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin reportes</h3>
              <p className="text-gray-500">Esta cuenta aun no tiene reportes generados</p>
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
          {/* Header with Add button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary">Webhooks configurados</h3>
              <p className="text-sm text-gray-500">Configura endpoints para recibir notificaciones</p>
            </div>
            {accountApi && getAvailableServiceTypes().length > 0 && (
              <button
                onClick={openAddWebhookModal}
                className="btn btn-primary"
              >
                <i className="ki-duotone ki-plus text-lg">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Agregar Webhook
              </button>
            )}
          </div>

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
                        <h4 className="font-semibold text-secondary">
                          {ServiceLabels[webhook.type as ServiceType] || webhook.type}
                        </h4>
                        <p className="text-sm text-gray-500">Servicio: {webhook.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleWebhook(webhook)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          webhook.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={webhook.isEnabled ? 'Desactivar' : 'Activar'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            webhook.isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => openEditWebhookModal(webhook)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <i className="ki-duotone ki-pencil text-lg text-gray-500">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                      <button
                        onClick={() => setShowDeleteWebhookModal({
                          type: webhook.type,
                          serviceName: ServiceLabels[webhook.type as ServiceType] || webhook.type
                        })}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <i className="ki-duotone ki-trash text-lg text-red-500">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                      </button>
                    </div>
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
              <p className="text-gray-500 mb-4">Esta cuenta no tiene webhooks configurados</p>
              {accountApi && (
                <button
                  onClick={openAddWebhookModal}
                  className="btn btn-primary"
                >
                  <i className="ki-duotone ki-plus text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Agregar Webhook
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && createPortal(
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
        </div>,
        document.body
      )}

      {/* Change Role Modal */}
      {showRoleModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-secondary">Cambiar Rol</h2>
              <button
                onClick={() => setShowRoleModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <div className="p-5 space-y-2">
              {[
                { value: 'OWNER', label: 'Propietario', description: 'Control total de la cuenta', icon: 'ki-crown', color: 'text-amber-500' },
                { value: 'ADMIN', label: 'Administrador', description: 'Gestionar usuarios y configuración', icon: 'ki-setting-2', color: 'text-blue-500' },
                { value: 'MEMBER', label: 'Miembro', description: 'Acceso básico a la cuenta', icon: 'ki-user', color: 'text-gray-500' },
              ].map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleUserAction(showRoleModal.userId, 'changeRole', role.value)}
                  disabled={isExecutingAction}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    showRoleModal.currentRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${role.color}`}>
                    <i className={`ki-duotone ${role.icon} text-xl`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary">{role.label}</p>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                  {showRoleModal.currentRole === role.value && (
                    <i className="ki-duotone ki-check-circle text-xl text-primary">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Change Status Modal */}
      {showStatusModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-secondary">Cambiar Estado</h2>
              <button
                onClick={() => setShowStatusModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <div className="p-5 space-y-2">
              {[
                { value: 'ACTIVE', label: 'Activo', description: 'Usuario con acceso normal', icon: 'ki-check-circle', color: 'text-green-500' },
                { value: 'SUSPENDED', label: 'Suspendido', description: 'Acceso temporalmente restringido', icon: 'ki-time', color: 'text-yellow-500' },
                { value: 'BANNED', label: 'Baneado', description: 'Acceso permanentemente bloqueado', icon: 'ki-lock', color: 'text-red-500' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleUserAction(showStatusModal.userId, 'changeStatus', status.value)}
                  disabled={isExecutingAction}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    showStatusModal.currentStatus === status.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${status.color}`}>
                    <i className={`ki-duotone ${status.icon} text-xl`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary">{status.label}</p>
                    <p className="text-sm text-gray-500">{status.description}</p>
                  </div>
                  {showStatusModal.currentStatus === status.value && (
                    <i className="ki-duotone ki-check-circle text-xl text-primary">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Phone Input Modal - for users without phone */}
      {showPhoneInputModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-secondary">Agregar Teléfono</h2>
              <button
                onClick={() => setShowPhoneInputModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">
                Agrega un número de teléfono para <span className="font-medium">{showPhoneInputModal.userName}</span>
              </p>
              <div className="mb-4">
                <label className="label">Número de teléfono</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ej: +54 11 1234-5678"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPhoneInputModal(null)}
                  className="btn-outline"
                  disabled={isExecutingAction}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await handleUserAction(showPhoneInputModal.userId, 'addPhoneAndVerify', phoneInput)
                    setShowPhoneInputModal(null)
                  }}
                  disabled={!phoneInput.trim() || isExecutingAction}
                  className="btn-primary flex items-center gap-2"
                >
                  {isExecutingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-verify text-lg">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Agregar y Verificar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Verify Email Confirmation Modal */}
      {showVerifyEmailModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-secondary">Verificar Email</h2>
              <button
                onClick={() => setShowVerifyEmailModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="ki-duotone ki-sms text-2xl text-blue-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <p className="font-medium text-secondary">{showVerifyEmailModal.userName}</p>
                  <p className="text-sm text-gray-500">{showVerifyEmailModal.email}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirmas que deseas marcar el email de este usuario como verificado manualmente?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowVerifyEmailModal(null)}
                  className="btn-outline"
                  disabled={isExecutingAction}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await handleUserAction(showVerifyEmailModal.userId, 'verifyEmail')
                    setShowVerifyEmailModal(null)
                  }}
                  disabled={isExecutingAction}
                  className="btn-primary flex items-center gap-2"
                >
                  {isExecutingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-verify text-lg">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Verificar Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Verify Phone Confirmation Modal */}
      {showVerifyPhoneModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-secondary">Verificar Teléfono</h2>
              <button
                onClick={() => setShowVerifyPhoneModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4 p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="ki-duotone ki-phone text-2xl text-green-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <p className="font-medium text-secondary">{showVerifyPhoneModal.userName}</p>
                  <p className="text-sm text-gray-500">{showVerifyPhoneModal.phone}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirmas que deseas marcar el teléfono de este usuario como verificado manualmente?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowVerifyPhoneModal(null)}
                  className="btn-outline"
                  disabled={isExecutingAction}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await handleUserAction(showVerifyPhoneModal.userId, 'verifyPhone')
                    setShowVerifyPhoneModal(null)
                  }}
                  disabled={isExecutingAction}
                  className="btn-primary flex items-center gap-2"
                >
                  {isExecutingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-verify text-lg">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Verificar Teléfono
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Webhook Modal */}
      {showWebhookModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-secondary">
                {isEditingWebhook ? 'Editar Webhook' : 'Agregar Webhook'}
              </h2>
              <button
                onClick={closeWebhookModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ki-duotone ki-cross text-2xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
            <form onSubmit={handleSaveWebhook} className="p-6 space-y-4">
              {/* Service Type */}
              <div>
                <label className="label">
                  Servicio <span className="text-red-500">*</span>
                </label>
                <select
                  value={webhookForm.type}
                  onChange={(e) => setWebhookForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="input-field"
                  required
                  disabled={isEditingWebhook}
                >
                  <option value="">Seleccionar servicio</option>
                  {getAvailableServiceTypes().map(([key, value]) => (
                    <option key={key} value={value}>
                      {ServiceLabels[value as ServiceType] || value}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  El webhook se activará para búsquedas de este servicio
                </p>
              </div>

              {/* URL */}
              <div>
                <label className="label">
                  URL del endpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm((prev) => ({ ...prev, url: e.target.value }))}
                  className="input-field font-mono"
                  placeholder="https://api.ejemplo.com/webhook"
                  required
                />
              </div>

              {/* Events */}
              <div>
                <label className="label">Eventos</label>
                <div className="space-y-2">
                  {Object.entries(WebhookEvent).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookForm((prev) => ({
                              ...prev,
                              events: [...prev.events, value],
                            }))
                          } else {
                            setWebhookForm((prev) => ({
                              ...prev,
                              events: prev.events.filter((ev) => ev !== value),
                            }))
                          }
                        }}
                        className="w-4 h-4 text-primary rounded border-gray-300"
                      />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Headers */}
              <div>
                <label className="label">Headers personalizados</label>
                {Object.keys(webhookForm.headers).length > 0 && (
                  <div className="mb-2 space-y-1">
                    {Object.entries(webhookForm.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-mono text-purple-600">{key}:</span>
                        <span className="text-sm font-mono text-gray-600 flex-1 truncate">{value}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHeader(key)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <i className="ki-duotone ki-cross text-red-500 text-sm">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                    placeholder="Header-Name"
                  />
                  <input
                    type="text"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                    placeholder="valor"
                  />
                  <button
                    type="button"
                    onClick={handleAddHeader}
                    disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                    className="btn-secondary px-3 disabled:opacity-50"
                  >
                    <i className="ki-duotone ki-plus text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </button>
                </div>
              </div>

              {/* Enabled */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Webhook activo</p>
                  <p className="text-sm text-gray-500">Recibir notificaciones cuando ocurran eventos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWebhookForm((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webhookForm.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webhookForm.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeWebhookModal}
                  className="btn-outline"
                  disabled={isSavingWebhook}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={isSavingWebhook || !webhookForm.type || !webhookForm.url}
                >
                  {isSavingWebhook ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    isEditingWebhook ? 'Guardar cambios' : 'Crear webhook'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Webhook Confirmation Modal */}
      {showDeleteWebhookModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <i className="ki-duotone ki-trash text-2xl text-red-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar webhook</h3>
              <p className="text-gray-500 mb-6">
                ¿Estás seguro de eliminar el webhook de <span className="font-medium text-gray-700">{showDeleteWebhookModal.serviceName}</span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteWebhookModal(null)}
                  className="btn-outline flex-1"
                  disabled={isDeletingWebhook}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteWebhook}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                  disabled={isDeletingWebhook}
                >
                  {isDeletingWebhook ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
