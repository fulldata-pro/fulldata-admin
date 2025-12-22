import { NextRequest, NextResponse } from 'next/server'
import { adminRepository } from '@/lib/db/repositories'
import { validateAdminRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { admin: currentAdmin, error } = await validateAdminRequest(request)
    if (error || !currentAdmin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    // Only SUPER_ADMIN and ADMIN can list admins
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentAdmin.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const result = await adminRepository.list(
      { search, role, status },
      page,
      limit
    )

    return NextResponse.json({
      admins: result.data,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get admins error:', error)
    return NextResponse.json(
      { error: 'Error al obtener administradores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin: currentAdmin, error } = await validateAdminRequest(request)
    if (error || !currentAdmin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    // Only SUPER_ADMIN can create admins
    if (currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo SUPER_ADMIN puede crear administradores' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Check if email exists
    const emailExists = await adminRepository.emailExists(body.email)
    if (emailExists) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    const admin = await adminRepository.createAdmin({
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone,
      role: body.role || 'ADMIN',
      status: body.status || 'ACTIVE',
      createdBy: currentAdmin._id,
    })

    // Remove password from response
    const { password: _, ...adminObj } = admin.toObject()

    return NextResponse.json({ admin: adminObj }, { status: 201 })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Error al crear administrador' },
      { status: 500 }
    )
  }
}
