import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Admin from '@/lib/db/models/Admin'
import { validateAdminRequest } from '@/lib/auth'

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
    await dbConnect()

    const admin = await Admin.findById(id).select('-password')

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

    await dbConnect()

    const admin = await Admin.findById(id)
    if (!admin) {
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

    if (body.name !== undefined) admin.name = body.name
    if (body.email !== undefined) admin.email = body.email
    if (body.phone !== undefined) admin.phone = body.phone
    if (body.role !== undefined) admin.role = body.role
    if (body.status !== undefined) admin.status = body.status
    if (body.password) admin.password = body.password // Will be hashed by pre-save hook

    admin.updatedBy = currentAdmin._id
    await admin.save()

    const { password: _, ...adminObj } = admin.toObject()

    return NextResponse.json({ admin: adminObj })
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

    await dbConnect()

    const admin = await Admin.findById(id)
    if (!admin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 })
    }

    admin.deletedAt = new Date()
    admin.deletedBy = currentAdmin._id
    await admin.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete admin error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar administrador' },
      { status: 500 }
    )
  }
}
