'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { AccountStatus } from '@/lib/constants'
import { DataTable, Badge, Code, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'

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
  uid: string
  name?: string
  type?: string
  email: string
  phone?: string
  status: string
  billing: {
    name?: string
    taxId?: string
    email?: string
    phone?: string
  }
  apiEnabled: boolean
  webhookEnabled: boolean
  users: AccountUser[]
  createdAt: string
}

export default function AccountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [status, setStatus] = useState(searchParams?.get('status') || '')
  const [hoveredUsers, setHoveredUsers] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', '10')
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
  }, [search, status, searchParams])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

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

  const columns: Column<Account>[] = [
    {
      key: 'name',
      header: 'Cuenta',
      render: (account) => (
        <Link href={`/accounts/${account._id}`} className="block hover:text-primary transition-colors">
          {account.name ? (
            <div>
              <div className="font-medium text-gray-900">
                {account.name}
              </div>
              <div className="text-sm text-gray-500">{account.uid}</div>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </Link>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (account) => (
        <span className="text-gray-600 text-sm">{account.type || '-'}</span>
      )
    },
    {
      key: 'taxId',
      header: 'CUIT',
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
          className="relative"
          onMouseEnter={() => setHoveredUsers(account._id)}
          onMouseLeave={() => setHoveredUsers(null)}
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
          {hoveredUsers === account._id && account.users?.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuarios</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {account.users.map((userEntry, idx) => (
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
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (account) => (
        <span className="text-gray-500 text-sm">
          {formatDate(account.createdAt)}
        </span>
      )
    }
  ]

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
      onClick: (account) => router.push(`/accounts/${account._id}`)
    },
    {
      label: 'Editar',
      icon: <ActionIcon icon="pencil" className="text-gray-500" />,
      onClick: (account) => router.push(`/accounts/${account._id}/edit`)
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
    router.push(`/accounts?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
    setStatus('')
    router.push('/accounts')
  }

  return (
    <DataTable
      data={accounts}
      columns={columns}
      keyExtractor={(account) => account._id}
      isLoading={isLoading}
      pagination={pagination}
      basePath="/accounts"
      filters={filters}
      filterValues={{ search, status }}
      onFilterChange={(key, value) => {
        if (key === 'search') setSearch(value)
        if (key === 'status') setStatus(value)
      }}
      onFilterSubmit={handleFilterSubmit}
      onFilterClear={handleFilterClear}
      actions={actions}
      title="Cuentas"
      subtitle="Gestiona las cuentas de clientes"
      headerAction={
        <Link href="/accounts/new" className="btn-primary flex items-center gap-2">
          <i className="ki-duotone ki-plus text-xl">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          Nueva Cuenta
        </Link>
      }
      emptyMessage="No se encontraron cuentas"
    />
  )
}
