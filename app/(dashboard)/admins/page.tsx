'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { toast } from 'react-toastify'
import { AdminRoles, AdminStatus } from '@/lib/constants'
import { DataTable, Badge, Avatar, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination, type ExportConfig } from '@/components/ui/DataTable'
import { formatDate, formatDateTime } from '@/lib/utils/dateUtils'

interface Admin {
  _id: string
  uid: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  lastLoginAt?: string
  createdAt: string
}

const DEFAULT_PAGE_SIZE = 10

export default function AdminsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentAdmin = useSelector((state: RootState) => state.auth.admin)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [role, setRole] = useState(searchParams?.get('role') || '')
  const [status, setStatus] = useState(searchParams?.get('status') || '')
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Partial<Admin> & { password?: string } | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<Admin | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))
      if (search) params.set('search', search)
      if (role) params.set('role', role)
      if (status) params.set('status', status)

      const response = await fetch(`/api/admins?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
        setPagination(data.pagination)
      } else if (response.status === 403) {
        toast.error('No tienes permisos para ver administradores')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Error al cargar administradores')
    } finally {
      setIsLoading(false)
    }
  }, [search, role, status, pageSize, searchParams])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleSave = async () => {
    if (!editingAdmin) return

    try {
      const isNew = !editingAdmin._id
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/admins' : `/api/admins/${editingAdmin._id}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAdmin),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isNew ? 'Administrador creado' : 'Administrador actualizado')
        setShowModal(false)
        setEditingAdmin(null)
        fetchAdmins()
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar administrador')
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return

    try {
      const response = await fetch(`/api/admins/${admin._id}`, { method: 'DELETE' })
      const data = await response.json()

      if (response.ok) {
        toast.success('Administrador eliminado')
        fetchAdmins()
      } else {
        toast.error(data.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar administrador')
    }
  }

  const handlePasswordChange = async () => {
    if (!changingPasswordAdmin || !newPassword) return

    try {
      const response = await fetch(`/api/admins/${changingPasswordAdmin._id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente')
        setShowPasswordModal(false)
        setChangingPasswordAdmin(null)
        setNewPassword('')
      } else {
        toast.error(data.error || 'Error al cambiar la contraseña')
      }
    } catch {
      toast.error('Error al cambiar la contraseña')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'purple'
      case 'ADMIN': return 'info'
      case 'MODERATOR': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'INACTIVE': return 'gray'
      case 'SUSPENDED': return 'danger'
      default: return 'gray'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'ADMIN': return 'Administrador'
      case 'MODERATOR': return 'Moderador'
      default: return role
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo'
      case 'INACTIVE': return 'Inactivo'
      case 'SUSPENDED': return 'Suspendido'
      default: return status
    }
  }

  const columns: Column<Admin>[] = [
    {
      key: 'admin',
      header: 'Administrador',
      exportValue: (admin) => admin.name,
      render: (admin) => (
        <div className="flex items-center gap-3">
          <Avatar name={admin.name} gradient />
          <div>
            <p className="font-medium text-secondary">{admin.name}</p>
            <p className="text-sm text-gray-500">{admin.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      exportValue: (admin) => admin.email,
      render: (admin) => (
        <span className="text-gray-600 text-sm">{admin.email}</span>
      )
    },
    {
      key: 'role',
      header: 'Rol',
      exportValue: (admin) => getRoleLabel(admin.role),
      render: (admin) => (
        <Badge variant={getRoleBadgeVariant(admin.role) as 'purple' | 'info' | 'gray'}>
          {getRoleLabel(admin.role)}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      exportValue: (admin) => getStatusLabel(admin.status),
      render: (admin) => (
        <Badge variant={getStatusBadgeVariant(admin.status) as 'success' | 'gray' | 'danger'}>
          {getStatusLabel(admin.status)}
        </Badge>
      )
    },
    {
      key: 'lastLoginAt',
      header: 'Último Acceso',
      exportValue: (admin) => admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : 'Nunca',
      render: (admin) => (
        <span className="text-gray-500 text-sm">
          {admin.lastLoginAt
            ? formatDateTime(admin.lastLoginAt)
            : 'Nunca'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Creado',
      exportValue: (admin) => formatDateTime(admin.createdAt),
      render: (admin) => (
        <span className="text-gray-500 text-sm">
          {formatDateTime(admin.createdAt)}
        </span>
      )
    }
  ]

  const exportConfig: ExportConfig = {
    filename: 'administradores'
  }

  const filters: FilterConfig[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre o email...',
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      placeholder: 'Todos',
      options: Object.values(AdminRoles).map((r) => ({ value: r, label: getRoleLabel(r) })),
      className: 'w-40'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: Object.values(AdminStatus).map((s) => ({ value: s, label: getStatusLabel(s) })),
      className: 'w-40'
    }
  ]

  // Create actions dynamically based on permissions
  const actions: ActionMenuItem<Admin>[] = [
    {
      label: 'Editar',
      icon: <ActionIcon icon="pencil" className="text-gray-500" />,
      onClick: (admin) => {
        const isCurrentSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN'
        const isTargetSuperAdmin = admin.role === 'SUPER_ADMIN'

        // Non-super admins cannot modify super admins
        if (!isCurrentSuperAdmin && isTargetSuperAdmin) {
          toast.warning('No tienes permisos para editar un Super Admin')
          return
        }

        setEditingAdmin(admin)
        setShowModal(true)
      },
      className: 'text-slate-700 hover:bg-slate-50/80'
    },
    {
      label: 'Cambiar Contraseña',
      icon: <ActionIcon icon="lock" className="text-blue-500" />,
      onClick: (admin) => {
        const isCurrentSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN'
        const isTargetSuperAdmin = admin.role === 'SUPER_ADMIN'

        // Non-super admins cannot modify super admins
        if (!isCurrentSuperAdmin && isTargetSuperAdmin) {
          toast.warning('No tienes permisos para cambiar la contraseña de un Super Admin')
          return
        }

        setChangingPasswordAdmin(admin)
        setNewPassword('')
        setShowPasswordModal(true)
      },
      className: 'text-slate-700 hover:bg-slate-50/80'
    },
    {
      label: 'Eliminar',
      icon: <ActionIcon icon="trash" className="text-red-500" />,
      onClick: (admin) => {
        const isCurrentAdmin = currentAdmin?.email === admin.email
        const isCurrentSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN'
        const isTargetSuperAdmin = admin.role === 'SUPER_ADMIN'

        // Cannot delete yourself
        if (isCurrentAdmin) {
          toast.warning('No puedes eliminar tu propia cuenta')
          return
        }

        // Non-super admins cannot delete super admins
        if (!isCurrentSuperAdmin && isTargetSuperAdmin) {
          toast.warning('No tienes permisos para eliminar un Super Admin')
          return
        }

        handleDelete(admin)
      },
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    if (status) params.set('status', status)
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('limit', String(pageSize))
    router.push(`/admins?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
    setRole('')
    setStatus('')
    setPageSize(DEFAULT_PAGE_SIZE)
    router.push('/admins')
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/admins?${params}`)
  }

  return (
    <>
      <DataTable
        data={admins}
        columns={columns}
        keyExtractor={(admin) => admin._id}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/admins"
        onPageSizeChange={handlePageSizeChange}
        filters={filters}
        filterValues={{ search, role, status }}
        onFilterChange={(key, value) => {
          if (key === 'search') setSearch(value)
          if (key === 'role') setRole(value)
          if (key === 'status') setStatus(value)
        }}
        onFilterSubmit={handleFilterSubmit}
        onFilterClear={handleFilterClear}
        selectable
        selectedItems={selectedAdmins}
        onSelectionChange={setSelectedAdmins}
        actions={actions}
        title="Administradores"
        subtitle="Gestiona los usuarios administrativos"
        headerAction={
          <button
            onClick={() => {
              setEditingAdmin({ name: '', email: '', password: '', role: 'ADMIN', status: 'ACTIVE' })
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <i className="ki-duotone ki-plus text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Nuevo Admin
          </button>
        }
        emptyMessage="No se encontraron administradores"
        exportConfig={exportConfig}
      />

      {/* Modal */}
      {showModal && editingAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-300">
            {/* Header with gradient */}
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingAdmin(null)
                }}
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
              >
                <i className="ki-duotone ki-cross text-2xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>

              <div className="relative text-center">
                <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                  <i className="ki-duotone ki-user-tick text-4xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {editingAdmin._id ? 'Editar Administrador' : 'Nuevo Administrador'}
                </h3>
                <p className="text-white/90 text-sm">
                  {editingAdmin._id ? 'Actualiza los datos del administrador' : 'Crea un nuevo usuario administrativo'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  value={editingAdmin.name || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={editingAdmin.email || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              {!editingAdmin._id && (
                <div>
                  <label className="label">Contraseña</label>
                  <input
                    type="password"
                    value={editingAdmin.password || ''}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Rol</label>
                  <select
                    value={editingAdmin.role || 'ADMIN'}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                    className="input-field"
                  >
                    {Object.values(AdminRoles).map((r) => (
                      <option key={r} value={r}>
                        {getRoleLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select
                    value={editingAdmin.status || 'ACTIVE'}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value })}
                    className="input-field"
                  >
                    {Object.values(AdminStatus).map((s) => (
                      <option key={s} value={s}>
                        {getStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={editingAdmin.phone || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingAdmin(null)
                }}
                className="btn btn-light min-w-[100px]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary min-w-[100px]"
              >
                <i className="ki-duotone ki-check me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {editingAdmin._id ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && changingPasswordAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-300">
            {/* Header with gradient */}
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 p-8 text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setChangingPasswordAdmin(null)
                  setNewPassword('')
                }}
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
              >
                <i className="ki-duotone ki-cross text-2xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>

              <div className="relative text-center">
                <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                  <i className="ki-duotone ki-lock text-4xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </div>
                <h3 className="text-2xl font-bold mb-2">Cambiar Contraseña</h3>
                <p className="text-white/90 text-sm">
                  {changingPasswordAdmin.name} • {changingPasswordAdmin.email}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div>
                <label className="label">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Ingresa la nueva contraseña"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setChangingPasswordAdmin(null)
                  setNewPassword('')
                }}
                className="btn btn-light min-w-[100px]"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={!newPassword || newPassword.length < 6}
                className="btn btn-primary min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ki-duotone ki-check me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
