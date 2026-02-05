'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { toast } from 'react-toastify'
import { AdminStatus } from '@/lib/constants'
import { DataTable, Badge, Avatar, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination, type ExportConfig } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
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
  const [status, setStatus] = useState(searchParams?.get('status') || '')
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Partial<Admin> & { password?: string } | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<Admin | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null)

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))
      if (search) params.set('search', search)
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
  }, [search, status, pageSize, searchParams])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleSave = async () => {
    if (!editingAdmin) return

    const isNew = !editingAdmin._id
    if (isNew && (!editingAdmin.password || editingAdmin.password.length < 6)) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSaving(true)
    try {
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
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingAdmin) return

    try {
      const response = await fetch(`/api/admins/${deletingAdmin._id}`, { method: 'DELETE' })
      const data = await response.json()

      if (response.ok) {
        toast.success('Administrador eliminado')
        fetchAdmins()
      } else {
        toast.error(data.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar administrador')
    } finally {
      setDeletingAdmin(null)
    }
  }

  const handlePasswordChange = async () => {
    if (!changingPasswordAdmin || !newPassword) return

    setIsChangingPassword(true)
    try {
      const response = await fetch(`/api/admins/${changingPasswordAdmin._id}`, {
        method: 'PUT',
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
    } finally {
      setIsChangingPassword(false)
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

        setDeletingAdmin(admin)
        setShowDeleteModal(true)
      },
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('limit', String(pageSize))
    router.push(`/admins?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
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
        filterValues={{ search, status }}
        onFilterChange={(key, value) => {
          if (key === 'search') setSearch(value)
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
              setEditingAdmin({ name: '', email: '', password: '', role: 'SUPER_ADMIN', status: 'ACTIVE' })
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => { setShowModal(false); setEditingAdmin(null); setShowPassword(false) }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <i className="ki-duotone ki-user-tick text-xl text-indigo-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingAdmin._id ? 'Editar Administrador' : 'Nuevo Administrador'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingAdmin._id ? 'Actualiza los datos del administrador' : 'Crea un nuevo usuario administrativo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingAdmin(null); setShowPassword(false) }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <Input
                  label="Nombre completo"
                  type="text"
                  value={editingAdmin.name || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={editingAdmin.email || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  required
                  leftIcon={
                    <span className="text-gray-400 font-medium">@</span>
                  }
                />
                {!editingAdmin._id && (
                  <div>
                    <label className="block font-medium text-gray-700 text-sm mb-1.5">
                      Contraseña<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editingAdmin.password || ''}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <i className={`ki-duotone ${showPassword ? 'ki-eye-slash' : 'ki-eye'} text-lg`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  </div>
                )}
                <div>
                  <label className="label">Estado</label>
                  <Select
                    value={editingAdmin.status || 'ACTIVE'}
                    onChange={(value) => setEditingAdmin({ ...editingAdmin, status: value })}
                    options={Object.values(AdminStatus).map((s) => ({
                      value: s,
                      label: getStatusLabel(s),
                    }))}
                  />
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setShowModal(false); setEditingAdmin(null); setShowPassword(false) }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !editingAdmin.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingAdmin.email || '') || (!editingAdmin._id && (!editingAdmin.password || editingAdmin.password.length < 6))}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-check text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    {editingAdmin._id ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && changingPasswordAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => { setShowPasswordModal(false); setChangingPasswordAdmin(null); setNewPassword('') }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <i className="ki-duotone ki-lock text-xl text-blue-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                  <p className="text-sm text-gray-500">
                    {changingPasswordAdmin.name} • {changingPasswordAdmin.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowPasswordModal(false); setChangingPasswordAdmin(null); setNewPassword('') }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
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
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setShowPasswordModal(false); setChangingPasswordAdmin(null); setNewPassword('') }}
                disabled={isChangingPassword}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !newPassword || newPassword.length < 6}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Cambiando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-check text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Cambiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingAdmin(null) }}
        onConfirm={handleDelete}
        title="Eliminar Administrador"
        message="¿Estás seguro de que deseas eliminar este administrador?"
        itemName={deletingAdmin?.name}
      />
    </>
  )
}
