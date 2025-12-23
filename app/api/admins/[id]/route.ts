import { NextRequest, NextResponse } from 'next/server'
import { adminRepository } from '@/lib/db/repositories'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin: currentAdmin, error } = await validateAdminRequest(request)
    if (error || !currentAdmin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const admin = await adminRepository.findById(id, { select: '-password' })

    if (!admin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Get admin error:', error)
    return NextResponse.json(
      { error: 'Error al obtener administrador' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin: currentAdmin, error } = await validateAdminRequest(request)
    if (error || !currentAdmin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingAdmin = await adminRepository.findById(id)
    if (!existingAdmin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 })
    }

    // Only SUPER_ADMIN can modify other admins
    if (currentAdmin.role !== 'SUPER_ADMIN' && currentAdmin._id.toString() !== id) {
      return NextResponse.json({ error: 'Sin permisos para modificar este administrador' }, { status: 403 })
    }

    // Prevent changing role to SUPER_ADMIN unless current is SUPER_ADMIN
    if (body.role === 'SUPER_ADMIN' && currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sin permisos para asignar rol SUPER_ADMIN' }, { status: 403 })
    }

    // Check email uniqueness if changing email
    if (body.email && body.email !== existingAdmin.email) {
      const emailExists = await adminRepository.emailExists(body.email, id)
      if (emailExists) {
        return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
      }
    }

    const admin = await adminRepository.updateAdmin(id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      status: body.status,
      password: body.password,
    }, currentAdmin._id)

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Update admin error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar administrador' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin: currentAdmin, error } = await validateAdminRequest(request)
    if (error || !currentAdmin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    // Only SUPER_ADMIN can delete admins
    if (currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede eliminar administradores' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (currentAdmin._id.toString() === id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    const admin = await adminRepository.findById(id)
    if (!admin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 })
    }

    await adminRepository.softDelete(id, currentAdmin._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete admin error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar administrador' },
      { status: 500 }
    )
  }
}
