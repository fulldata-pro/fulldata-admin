'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { AccountStatus, ROUTES } from '@/lib/constants'
import { DataTable, Badge, Code, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination, type ExportConfig } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'
import { CreateAccountModal } from '@/components/modals/CreateAccountModal'

interface AccountUser {
  user: {
    firstName: string
    lastName: string
    email: string,
    phone: string,
    phoneCountryCode: string
  }
  role: string
}

interface Account {
  _id: string
  id: number
  uid: string
  name: string
  type?: string
  status: string
  billing?: {
    name?: string
    taxId?: string
  }
  serviceConfig?: {
    apiEnabled?: boolean
    webhookEnabled?: boolean
  }
  users: AccountUser[]
  createdAt: string
}

const DEFAULT_PAGE_SIZE = 10

interface UsersPopupPosition {
  top: number
  left: number
  showAbove: boolean
}

export default function AccountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [status, setStatus] = useState(searchParams?.get('status') || '')
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))
  const [hoveredUsers, setHoveredUsers] = useState<string | null>(null)
  const [usersPopupPosition, setUsersPopupPosition] = useState<UsersPopupPosition | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const usersButtonRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))
      if (search) params.set('search', search)
      if (status) params.set('status', status)

      const response = await fetch(`/api/accounts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Error al cargar cuentas')
    } finally {
      setIsLoading(false)
    }
  }, [search, status, pageSize, searchParams])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleCreateAccount = async (data: any) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // User data
          user: {
            email: data.email,
            password: data.password,
            phone: data.phone,
            phoneCountryCode: data.phoneCountryCode,
            firstName: data.firstName,
            lastName: data.lastName
          },
          // Account data
          accountName: data.billingName,
          // Billing data
          billing: {
            name: data.billingName,
            taxId: data.taxId,
            type: data.billingType,
            address: data.address,
            city: data.city,
            zip: data.zip,
            state: data.state,
            stateId: data.stateId,
            country: data.country,
            countryId: data.countryId,
            activity: data.activity,
            vatType: data.vatType
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Cuenta creada correctamente')
        fetchAccounts()
        // Navigate to the new account
        if (result.account?._id) {
          router.push(ROUTES.ACCOUNT_DETAIL(result.account._id))
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear cuenta')
      }
    } catch (error) {
      console.error('Error creating account:', error)
      throw error
    }
  }

  const handleDelete = async (account: Account) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return

    try {
      const response = await fetch(`/api/accounts/${account._id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Cuenta eliminada correctamente')
        fetchAccounts()
      } else {
        toast.error('Error al eliminar cuenta')
      }
    } catch {
      toast.error('Error al eliminar cuenta')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'PENDING': return 'warning'
      case 'SUSPENDED': return 'danger'
      case 'INACTIVE': return 'gray'
      default: return 'gray'
    }
  }

  const handleUsersHover = (accountId: string) => {
    const buttonEl = usersButtonRefs.current.get(accountId)
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect()
      const popupHeight = 250
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = spaceBelow < popupHeight && rect.top > popupHeight

      setUsersPopupPosition({
        top: showAbove ? rect.top : rect.bottom + 8,
        left: rect.left,
        showAbove
      })
    }
    setHoveredUsers(accountId)
  }

  const handleUsersLeave = () => {
    setHoveredUsers(null)
    setUsersPopupPosition(null)
  }

  const columns: Column<Account>[] = [
    {
      key: 'id',
      header: 'ID',
      exportValue: (account) => account.id,
      render: (account) => (
        <span className="font-mono text-sm text-gray-600">{account.id}</span>
      )
    },
    {
      key: 'name',
      header: 'Cuenta',
      exportValue: (account) => account.billing?.name || account.name,
      render: (account) => (
        <Link href={ROUTES.ACCOUNT_DETAIL(account._id)} className="block hover:text-primary transition-colors">
          <div className="font-medium text-gray-900">
            {account.billing?.name || account.name}
          </div>
        </Link>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      exportValue: (account) => account.type || '',
      render: (account) => (
        <span className="text-gray-600 text-sm">{account.type || '-'}</span>
      )
    },
    {
      key: 'taxId',
      header: 'CUIT',
      exportValue: (account) => account.billing?.taxId || '',
      render: (account) => (
        account.billing?.taxId ? (
          <Code>{account.billing.taxId}</Code>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      )
    },
    {
      key: 'contact',
      header: 'Contacto',
      exportValue: (account) => account.users[0]?.user.email || '',
      render: (account) => (
        <div className="text-sm">
          {account.users[0]?.user.email && <div className="text-gray-700">{account.users[0]?.user.email}</div>}
          {account.users[0]?.user.phone && <div className="text-gray-500">{account.users[0]?.user.phoneCountryCode + " " + account.users[0]?.user.phone}</div>}
          {!account.users[0]?.user.email && !account.users[0]?.user.phone && <span className="text-gray-400">-</span>}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      exportValue: (account) => account.status,
      render: (account) => (
        <Badge variant={getStatusVariant(account.status) as 'success' | 'warning' | 'danger' | 'gray'}>
          {account.status}
        </Badge>
      )
    },
    {
      key: 'users',
      header: 'Usuarios',
      render: (account) => (
        <div
          ref={(el) => {
            if (el) usersButtonRefs.current.set(account._id, el)
          }}
          className="relative"
          onMouseEnter={() => handleUsersHover(account._id)}
          onMouseLeave={handleUsersLeave}
        >
          <div className="flex items-center gap-1.5 cursor-pointer">
            <i className="ki-duotone ki-people text-gray-400">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
            </i>
            <span className="font-medium">{account.users?.length || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Creado',
      exportValue: (account) => formatDate(account.createdAt),
      render: (account) => (
        <span className="text-gray-500 text-sm">
          {formatDate(account.createdAt)}
        </span>
      )
    }
  ]

  const exportConfig: ExportConfig = {
    filename: 'cuentas',
    excludeColumns: ['users']
  }

  const filters: FilterConfig[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Buscar por email, nombre, CUIT...',
      icon: (
        <i className="ki-duotone ki-magnifier text-xl">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: Object.values(AccountStatus).map((s) => ({ value: s, label: s })),
      className: 'w-48'
    }
  ]

  const actions: ActionMenuItem<Account>[] = [
    {
      label: 'Ver detalles',
      icon: <ActionIcon icon="eye" className="text-gray-500" />,
      onClick: (account) => router.push(ROUTES.ACCOUNT_DETAIL(account._id))
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
    if (status) params.set('status', status)
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('limit', String(pageSize))
    router.push(`/accounts?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
    setStatus('')
    setPageSize(DEFAULT_PAGE_SIZE)
    router.push('/accounts')
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1') // Reset to first page when changing size
    router.push(`/accounts?${params}`)
  }

  const hoveredAccount = accounts.find(a => a._id === hoveredUsers)

  return (
    <>
      <DataTable
        data={accounts}
        columns={columns}
        keyExtractor={(account) => account._id}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/accounts"
        onPageSizeChange={handlePageSizeChange}
        filters={filters}
        filterValues={{ search, status }}
        onFilterChange={(key, value) => {
          if (key === 'search') setSearch(value)
          if (key === 'status') setStatus(value)
        }}
        onFilterSubmit={handleFilterSubmit}
        onFilterClear={handleFilterClear}
        selectable
        selectedItems={selectedAccounts}
        onSelectionChange={setSelectedAccounts}
        actions={actions}
        title="Cuentas"
        subtitle="Gestiona las cuentas de clientes"
        headerAction={
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <i className="ki-duotone ki-plus text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nueva Cuenta
          </button>
        }
        emptyMessage="No se encontraron cuentas"
        exportConfig={exportConfig}
      />

      {/* Users Popup Portal */}
      {hoveredUsers && hoveredAccount && usersPopupPosition && hoveredAccount.users?.length > 0 && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed w-72 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-2 z-[99999] animate-fade-in"
          style={{
            top: usersPopupPosition.showAbove ? 'auto' : `${usersPopupPosition.top}px`,
            bottom: usersPopupPosition.showAbove ? `${window.innerHeight - usersPopupPosition.top + 8}px` : 'auto',
            left: `${usersPopupPosition.left}px`,
          }}
          onMouseEnter={() => setHoveredUsers(hoveredUsers)}
          onMouseLeave={handleUsersLeave}
        >
          <div className="px-4 pb-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuarios</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {hoveredAccount.users.map((userEntry, idx) => (
              <div key={idx} className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">
                  {userEntry.user?.firstName} {userEntry.user?.lastName}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-gray-500">{userEntry.user?.email}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${userEntry.role === 'OWNER'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {userEntry.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateAccount}
      />
    </>
  )
}
