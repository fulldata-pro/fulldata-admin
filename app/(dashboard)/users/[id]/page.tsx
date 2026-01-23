'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { formatDate, formatDateTime } from '@/lib/utils/dateUtils'

interface UserAccount {
  _id: string
  uid: string
  name: string
  status: string
  role: string
}

interface User {
  _id: string
  id: number
  uid: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  phoneCountryCode?: string
  avatar?: string
  authMethod: 'LOCAL' | 'GOOGLE'
  emailVerifiedAt?: string
  phoneVerifiedAt?: string
  onboardingCreditUsedAt?: string
  createdAt: string
  updatedAt: string
  accounts: UserAccount[]
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else if (response.status === 404) {
          toast.error('Usuario no encontrado')
          router.push('/users')
        }
      } catch {
        toast.error('Error al cargar usuario')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id, router])

  const handleDelete = async () => {
    if (!user) return

    // Check if user is owner of any account
    const ownerAccounts = user.accounts.filter(acc => acc.role === 'OWNER')
    if (ownerAccounts.length > 0) {
      const accountNames = ownerAccounts.map(a => a.name).join(', ')
      toast.error(`No se puede eliminar: el usuario es dueño de ${ownerAccounts.length} cuenta(s): ${accountNames}`)
      return
    }

    if (!confirm('¿Estas seguro de eliminar este usuario? Se lo quitara de todas las cuentas asociadas.')) return

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (response.ok) {
        toast.success('Usuario eliminado correctamente')
        router.push('/users')
      } else {
        toast.error(data.message || data.error || 'Error al eliminar usuario')
      }
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'badge-success'
      case 'PENDING': return 'badge-warning'
      case 'SUSPENDED': return 'badge-danger'
      case 'INACTIVE': return 'badge-gray'
      default: return 'badge-gray'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando usuario...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isOwnerOfAnyAccount = user.accounts.some(acc => acc.role === 'OWNER')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/users" className="hover:text-primary transition-colors">
          Usuarios
        </Link>
        <i className="ki-duotone ki-right text-xs">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <span className="text-gray-900 font-medium">{user.firstName} {user.lastName}</span>
      </nav>

      {/* Header Card */}
      <div className="card-glass-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                  <span className="text-sm text-gray-400 font-mono bg-gray-700/50 px-2 py-1 rounded">#{user.id}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <i className="ki-duotone ki-calendar text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Registrado el {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={isOwnerOfAnyAccount}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isOwnerOfAnyAccount
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title={isOwnerOfAnyAccount ? 'No se puede eliminar porque es dueño de una o mas cuentas' : 'Eliminar usuario'}
              >
                <i className="ki-duotone ki-trash text-lg">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
                Eliminar
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-gray-400">
              <i className="ki-duotone ki-briefcase text-base">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <span className="text-sm">
                {user.accounts.length} {user.accounts.length === 1 ? 'cuenta asociada' : 'cuentas asociadas'}
              </span>
            </div>
          </div>
        </div>
      </div>

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
                <i className="ki-duotone ki-user text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Nombre Completo
              </dt>
              <dd className="font-medium">{user.firstName} {user.lastName}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <dt className="text-gray-500 flex items-center gap-2">
                <i className="ki-duotone ki-sms text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Email
              </dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <dt className="text-gray-500 flex items-center gap-2">
                <i className="ki-duotone ki-phone text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Telefono
              </dt>
              <dd className="font-medium">
                {user.phone ? `${user.phoneCountryCode || ''} ${user.phone}` : <span className="text-gray-400">No especificado</span>}
              </dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <dt className="text-gray-500 flex items-center gap-2">
                <i className="ki-duotone ki-shield text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Metodo de Autenticacion
              </dt>
              <dd>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  user.authMethod === 'GOOGLE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.authMethod === 'GOOGLE' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {user.authMethod === 'GOOGLE' ? 'Google' : 'Email'}
                </span>
              </dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <dt className="text-gray-500 flex items-center gap-2">
                <i className="ki-duotone ki-calendar text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Fecha de Registro
              </dt>
              <dd className="font-medium">{formatDateTime(user.createdAt)}</dd>
            </div>
            <div className="flex justify-between items-center py-2">
              <dt className="text-gray-500 flex items-center gap-2">
                <i className="ki-duotone ki-calendar-edit text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                Ultima Actualizacion
              </dt>
              <dd className="font-medium">{formatDateTime(user.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Verification Status */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="ki-duotone ki-verify text-xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h3 className="text-lg font-semibold text-secondary">Estado de Verificacion</h3>
          </div>
          <div className="space-y-4">
            {/* Email Verification */}
            <div className={`p-4 rounded-xl ${user.emailVerifiedAt ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.emailVerifiedAt ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <i className={`ki-duotone ki-sms text-xl ${user.emailVerifiedAt ? 'text-green-600' : 'text-yellow-600'}`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Email</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {user.emailVerifiedAt ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      <i className="ki-duotone ki-check-circle text-base">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Verificado
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(user.emailVerifiedAt)}</p>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                    <i className="ki-duotone ki-time text-base">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Pendiente
                  </span>
                )}
              </div>
            </div>

            {/* Phone Verification */}
            <div className={`p-4 rounded-xl ${user.phoneVerifiedAt ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.phoneVerifiedAt ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <i className={`ki-duotone ki-phone text-xl ${user.phoneVerifiedAt ? 'text-green-600' : 'text-yellow-600'}`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Telefono</p>
                    <p className="text-sm text-gray-500">
                      {user.phone ? `${user.phoneCountryCode || ''} ${user.phone}` : 'No especificado'}
                    </p>
                  </div>
                </div>
                {user.phoneVerifiedAt ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      <i className="ki-duotone ki-check-circle text-base">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Verificado
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(user.phoneVerifiedAt)}</p>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                    <i className="ki-duotone ki-time text-base">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Pendiente
                  </span>
                )}
              </div>
            </div>

            {/* Onboarding Credit */}
            <div className={`p-4 rounded-xl ${user.onboardingCreditUsedAt ? 'bg-gray-50 border border-gray-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.onboardingCreditUsedAt ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    <i className={`ki-duotone ki-gift text-xl ${user.onboardingCreditUsedAt ? 'text-gray-600' : 'text-blue-600'}`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                      <span className="path4"></span>
                    </i>
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Credito de Onboarding</p>
                    <p className="text-sm text-gray-500">Creditos de bienvenida</p>
                  </div>
                </div>
                {user.onboardingCreditUsedAt ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                      <i className="ki-duotone ki-check text-base">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Usado
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(user.onboardingCreditUsedAt)}</p>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    <i className="ki-duotone ki-gift text-base">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                      <span className="path4"></span>
                    </i>
                    Disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Accounts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="ki-duotone ki-briefcase text-xl text-purple-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">Cuentas Asociadas</h3>
              <p className="text-sm text-gray-500">{user.accounts.length} cuenta(s) vinculadas</p>
            </div>
          </div>
        </div>

        {user.accounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Cuenta</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {user.accounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-secondary">{account.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{account.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadge(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        account.role === 'OWNER'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {account.role === 'OWNER' && (
                          <i className="ki-duotone ki-crown text-sm">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        )}
                        {account.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/accounts/${account._id}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                      >
                        Ver cuenta
                        <i className="ki-duotone ki-arrow-right text-base">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <i className="ki-duotone ki-briefcase text-3xl text-gray-400">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Sin cuentas</h3>
            <p className="text-gray-500">Este usuario no tiene cuentas asociadas</p>
          </div>
        )}
      </div>

      {/* Warning if user is owner */}
      {isOwnerOfAnyAccount && (
        <div className="card border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <i className="ki-duotone ki-information-2 text-xl text-yellow-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
            <div>
              <h4 className="font-semibold text-secondary mb-1">Usuario propietario</h4>
              <p className="text-sm text-gray-600">
                Este usuario es propietario (OWNER) de una o mas cuentas. No se puede eliminar hasta que transfiera la propiedad de todas sus cuentas a otro usuario.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.accounts.filter(a => a.role === 'OWNER').map(acc => (
                  <Link
                    key={acc._id}
                    href={`/accounts/${acc._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg border border-yellow-200 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors"
                  >
                    {acc.name}
                    <i className="ki-duotone ki-arrow-right text-xs">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
