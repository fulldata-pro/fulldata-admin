'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
      render: () => null,
      className: 'hidden'
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

  const actions: ActionMenuItem<Admin>[] = [
    {
      label: 'Editar',
      icon: <ActionIcon icon="pencil" className="text-gray-500" />,
      onClick: (admin) => {
        setEditingAdmin(admin)
        setShowModal(true)
      }
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
            className="btn-primary flex items-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md m-4 shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-secondary">
                {editingAdmin._id ? 'Editar Administrador' : 'Nuevo Administrador'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
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
              <div>
                <label className="label">
                  Contraseña {editingAdmin._id && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={editingAdmin.password || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                  className="input-field"
                  required={!editingAdmin._id}
                />
              </div>
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
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingAdmin(null)
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button onClick={handleSave} className="btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
