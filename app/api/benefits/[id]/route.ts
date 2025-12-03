import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Benefit from '@/lib/db/models/Benefit'
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

    const benefit = await Benefit.findById(id)

    if (!benefit) {
      return NextResponse.json({ error: 'Beneficio no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ benefit })
  } catch (error) {
    console.error('Get benefit error:', error)
    return NextResponse.json(
      { error: 'Error al obtener beneficio' },
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

    const benefit = await Benefit.findById(id)
    if (!benefit) {
      return NextResponse.json({ error: 'Beneficio no encontrado' }, { status: 404 })
    }

    // Check if new code exists
    if (body.code && body.code.toUpperCase() !== benefit.code) {
      const existingBenefit = await Benefit.findOne({
        code: body.code.toUpperCase(),
        deletedAt: null,
        _id: { $ne: id },
      })
      if (existingBenefit) {
        return NextResponse.json({ error: 'El código ya existe' }, { status: 400 })
      }
    }

    if (body.name !== undefined) benefit.name = body.name
    if (body.description !== undefined) benefit.description = body.description
    if (body.code !== undefined) benefit.code = body.code.toUpperCase()
    if (body.advantage !== undefined) benefit.advantage = body.advantage
    if (body.isEnabled !== undefined) benefit.isEnabled = body.isEnabled
    if (body.startDate !== undefined) benefit.startDate = body.startDate
    if (body.endDate !== undefined) benefit.endDate = body.endDate
    if (body.minimumPurchase !== undefined) benefit.minimumPurchase = body.minimumPurchase
    if (body.selfApply !== undefined) benefit.selfApply = body.selfApply
    if (body.maxUses !== undefined) benefit.maxUses = body.maxUses
    if (body.maxUsesPerAccount !== undefined) benefit.maxUsesPerAccount = body.maxUsesPerAccount

    await benefit.save()

    return NextResponse.json({ benefit })
  } catch (error) {
    console.error('Update benefit error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar beneficio' },
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

    const benefit = await Benefit.findById(id)
    if (!benefit) {
      return NextResponse.json({ error: 'Beneficio no encontrado' }, { status: 404 })
    }

    benefit.deletedAt = new Date()
    benefit.deletedBy = admin._id
    await benefit.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete benefit error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar beneficio' },
      { status: 500 }
    )
  }
}
