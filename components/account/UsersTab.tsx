'use client'

import Link from 'next/link'
import { formatDate, getRelativeTime } from '@/lib/utils/dateUtils'
import { ROUTES } from '@/lib/constants'

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

interface AccountUser {
  user: User
  role: string
  addedAt: string
}

interface UsersTabProps {
  users: AccountUser[]
}

export function UsersTab({ users }: UsersTabProps) {
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return 'badge-primary'
      case 'admin':
        return 'badge-warning'
      case 'member':
        return 'badge-light'
      default:
        return 'badge-gray'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propietario'
      case 'admin':
        return 'Administrador'
      case 'member':
        return 'Miembro'
      default:
        return role
    }
  }

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'badge-success'
      case 'SUSPENDED':
        return 'badge-warning'
      case 'BANNED':
        return 'badge-danger'
      default:
        return 'badge-gray'
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-secondary">Usuarios de la Cuenta</h3>
        <p className="text-gray-500 text-sm mt-1">
          Miembros con acceso a esta cuenta ({users.length})
        </p>
      </div>

      <div className="overflow-x-auto">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <i className="ki-duotone ki-people text-gray-300 text-5xl mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
            </i>
            <p className="text-gray-500">No hay usuarios asociados</p>
          </div>
        ) : (
          <table className="table-auto w-full">
            <thead className="bg-gray-50 border-y border-gray-100">
              <tr>
                <th className="table-header">Usuario</th>
                <th className="table-header">Email</th>
                <th className="table-header">Rol</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Verificación</th>
                <th className="table-header">Añadido</th>
                <th className="table-header text-end">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((accountUser) => {
                const user = accountUser.user
                return (
                  <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-gray-700">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getRoleStyle(accountUser.role)}`}>
                        {getRoleLabel(accountUser.role)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusStyle(user.status)}`}>
                        {user.status === 'ACTIVE' ? 'Activo' :
                         user.status === 'SUSPENDED' ? 'Suspendido' :
                         user.status === 'BANNED' ? 'Bloqueado' : user.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        {user.emailVerifiedAt && (
                          <span className="badge badge-light-success" title={`Verificado: ${formatDate(user.emailVerifiedAt)}`}>
                            <i className="ki-duotone ki-sms text-xs me-1">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            Email
                          </span>
                        )}
                        {user.phoneVerifiedAt && (
                          <span className="badge badge-light-info" title={`Verificado: ${formatDate(user.phoneVerifiedAt)}`}>
                            <i className="ki-duotone ki-phone text-xs me-1">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            Teléfono
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div className="text-gray-900">{formatDate(accountUser.addedAt)}</div>
                        <div className="text-gray-500 text-xs">{getRelativeTime(accountUser.addedAt)}</div>
                      </div>
                    </td>
                    <td className="table-cell text-end">
                      <Link
                        href={ROUTES.USER_DETAIL(user.uid)}
                        className="btn btn-sm btn-light"
                      >
                        <i className="ki-duotone ki-eye">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}