import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Proxy from '@/lib/db/models/Proxy'
import { validateAdminRequest } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const proxy = await Proxy.findById(id)

    if (!proxy) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ proxy })
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicio' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    await dbConnect()

    const proxy = await Proxy.findById(id)
    if (!proxy) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    if (body.name !== undefined) proxy.name = body.name
    if (body.countryCode !== undefined) proxy.countryCode = body.countryCode.toUpperCase()
    if (body.services !== undefined) proxy.services = body.services

    await proxy.save()

    return NextResponse.json({ proxy })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const proxy = await Proxy.findById(id)
    if (!proxy) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    proxy.deletedAt = new Date()
    proxy.deletedBy = admin._id
    await proxy.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    )
  }
}
