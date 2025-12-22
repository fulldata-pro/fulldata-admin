import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { paymentMethodRepository } from '@/lib/db/repositories'
import { toPaymentMethodDetailDTO } from '@/lib/dto/payment-method.dto'

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

    // Try to find by uid first, then by _id
    let paymentMethod = await paymentMethodRepository.findByUid(id)
    if (!paymentMethod) {
      paymentMethod = await paymentMethodRepository.findById(id)
    }

    if (!paymentMethod || paymentMethod.deletedAt) {
      return NextResponse.json({ error: 'Método de pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ paymentMethod: toPaymentMethodDetailDTO(paymentMethod) })
  } catch (error) {
    console.error('Get payment method error:', error)
    return NextResponse.json(
      { error: 'Error al obtener método de pago' },
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

    // Try to find by uid first, then by _id
    let paymentMethod = await paymentMethodRepository.findByUid(id)
    if (!paymentMethod) {
      paymentMethod = await paymentMethodRepository.findById(id)
    }

    if (!paymentMethod || paymentMethod.deletedAt) {
      return NextResponse.json({ error: 'Método de pago no encontrado' }, { status: 404 })
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.color !== undefined) updateData.color = body.color
    if (body.currency !== undefined) updateData.currency = body.currency.toUpperCase()
    if (body.acceptedMethods !== undefined) updateData.acceptedMethods = body.acceptedMethods
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled

    const updatedPaymentMethod = await paymentMethodRepository.update(paymentMethod._id, updateData)

    if (!updatedPaymentMethod) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ paymentMethod: toPaymentMethodDetailDTO(updatedPaymentMethod) })
  } catch (error) {
    console.error('Update payment method error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar método de pago' },
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

    // Try to find by uid first, then by _id
    let paymentMethod = await paymentMethodRepository.findByUid(id)
    if (!paymentMethod) {
      paymentMethod = await paymentMethodRepository.findById(id)
    }

    if (!paymentMethod || paymentMethod.deletedAt) {
      return NextResponse.json({ error: 'Método de pago no encontrado' }, { status: 404 })
    }

    await paymentMethodRepository.softDelete(paymentMethod._id, admin._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete payment method error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar método de pago' },
      { status: 500 }
    )
  }
}
