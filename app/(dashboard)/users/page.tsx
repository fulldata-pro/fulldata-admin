'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { DataTable, Badge, Avatar, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'

interface UserAccount {
  _id: string
  uid: string
  name: string
  status: string
  role: string
}

interface User {
  _id: string
  uid: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  phoneCountryCode?: string
  authMethod: string
  emailVerifiedAt?: string
  phoneVerifiedAt?: string
  createdAt: string
  accounts: UserAccount[]
}

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [authMethod, setAuthMethod] = useState(searchParams?.get('authMethod') || '')

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', '10')
      if (search) params.set('search', search)
      if (authMethod) params.set('authMethod', authMethod)

      const response = await fetch(`/api/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, search, authMethod])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (user: User) => {
    // Check if user is owner of any account
    const ownerAccounts = user.accounts.filter(acc => acc.role === 'OWNER')
    if (ownerAccounts.length > 0) {
      const accountNames = ownerAccounts.map(a => a.name).join(', ')
      toast.error(`No se puede eliminar: el usuario es dueño de ${ownerAccounts.length} cuenta(s): ${accountNames}`)
      return
    }

    if (!confirm('¿Estás seguro de eliminar este usuario? Se lo quitará de todas las cuentas asociadas.')) return

    try {
      const response = await fetch(`/api/users/${user._id}`, { method: 'DELETE' })
      const data = await response.json()

      if (response.ok) {
        toast.success('Usuario eliminado correctamente')
        fetchUsers()
      } else {
        toast.error(data.message || data.error || 'Error al eliminar usuario')
      }
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Usuario',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${user.firstName} ${user.lastName}`} />
          <div>
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.uid}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contacto',
      render: (user) => (
        <div>
          <div className="text-sm text-gray-900">{user.email}</div>
          {user.phone && (
            <div className="text-sm text-gray-500">
              {user.phoneCountryCode} {user.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'authMethod',
      header: 'Método',
      render: (user) => (
        <Badge variant={user.authMethod === 'GOOGLE' ? 'info' : 'gray'}>
          {user.authMethod === 'GOOGLE' && (
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {user.authMethod}
        </Badge>
      )
    },
    {
      key: 'verification',
      header: 'Verificación',
      render: (user) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center text-xs ${
            user.emailVerifiedAt ? 'text-green-600' : 'text-gray-400'
          }`}>
            <i className={`ki-duotone ki-sms text-sm mr-1.5 ${user.emailVerifiedAt ? 'text-green-600' : ''}`}>
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Email {user.emailVerifiedAt ? '✓' : '✗'}
          </span>
          <span className={`inline-flex items-center text-xs ${
            user.phoneVerifiedAt ? 'text-green-600' : 'text-gray-400'
          }`}>
            <i className={`ki-duotone ki-phone text-sm mr-1.5 ${user.phoneVerifiedAt ? 'text-green-600' : ''}`}>
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Teléfono {user.phoneVerifiedAt ? '✓' : '✗'}
          </span>
        </div>
      )
    },
    {
      key: 'accounts',
      header: 'Cuentas',
      render: (user) => (
        <div className="relative group">
          <div className="flex items-center gap-1.5 cursor-default">
            <i className="ki-duotone ki-briefcase text-base text-gray-500">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <span className={`text-sm font-medium ${user.accounts.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {user.accounts.length}
            </span>
          </div>
          {user.accounts.length > 0 && (
            <div className="absolute z-50 left-0 top-full mt-1 hidden group-hover:block">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px]">
                <div className="text-xs font-semibold text-gray-500 mb-2">Cuentas asociadas</div>
                <div className="space-y-2">
                  {user.accounts.map((account) => (
                    <Link
                      key={account._id}
                      href={`/accounts/${account._id}`}
                      className="block p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">{account.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{account.uid}</span>
                        <Badge variant={account.role === 'OWNER' ? 'success' : 'gray'} className="text-[10px] px-1.5 py-0">
                          {account.role}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Registro',
      render: (user) => (
        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
      )
    }
  ]

  const actions: ActionMenuItem<User>[] = [
    {
      label: 'Ver detalles',
      icon: <ActionIcon icon="eye" className="text-gray-500" />,
      onClick: (user) => router.push(`/users/${user._id}`)
    },
    {
      label: 'Eliminar',
      icon: <ActionIcon icon="trash" className="text-red-500" />,
      onClick: handleDelete,
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  const filters: FilterConfig[] = [
    {
      key: 'search',
      type: 'text',
      placeholder: 'Buscar por email o nombre...',
    },
    {
      key: 'authMethod',
      type: 'select',
      placeholder: 'Todos los métodos',
      options: [
        { value: 'LOCAL', label: 'Local' },
        { value: 'GOOGLE', label: 'Google' },
      ],
      className: 'w-48'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (authMethod) params.set('authMethod', authMethod)
    router.push(`/users?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
    setAuthMethod('')
    router.push('/users')
  }

  return (
    <DataTable
      data={users}
      columns={columns}
      keyExtractor={(user) => user._id}
      isLoading={isLoading}
      pagination={pagination}
      basePath="/users"
      filters={filters}
      filterValues={{ search, authMethod }}
      onFilterChange={(key, value) => {
        if (key === 'search') setSearch(value)
        if (key === 'authMethod') setAuthMethod(value)
      }}
      onFilterSubmit={handleFilterSubmit}
      onFilterClear={handleFilterClear}
      actions={actions}
      title="Usuarios"
      subtitle="Gestiona los usuarios de la plataforma"
      emptyMessage="No se encontraron usuarios"
    />
  )
}
