import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { paymentMethodRepository } from '@/lib/db/repositories'
import { toPaymentMethodListDTO, groupPaymentMethodsByCurrency } from '@/lib/dto/payment-method.dto'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const groupByCurrency = searchParams.get('groupByCurrency') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const currency = searchParams.get('currency') || undefined

    // If grouping by currency, return all methods grouped
    if (groupByCurrency) {
      const result = await paymentMethodRepository.list({ limit: 100 })
      return NextResponse.json({
        paymentMethods: groupPaymentMethodsByCurrency(result.data),
      })
    }

    // Standard list with pagination
    const result = await paymentMethodRepository.list({
      page,
      limit,
      filters: { currency },
    })

    return NextResponse.json({
      paymentMethods: toPaymentMethodListDTO(result.data),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get payment methods error:', error)
    return NextResponse.json(
      { error: 'Error al obtener métodos de pago' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.type || !body.name || !body.currency) {
      return NextResponse.json(
        { error: 'Tipo, nombre y moneda son requeridos' },
        { status: 400 }
      )
    }

    const paymentMethod = await paymentMethodRepository.createPaymentMethod({
      type: body.type,
      name: body.name,
      currency: body.currency,
      icon: body.icon,
      color: body.color,
      acceptedMethods: body.acceptedMethods,
    })

    return NextResponse.json({
      paymentMethod: {
        id: paymentMethod.id,
        uid: paymentMethod.uid,
        type: paymentMethod.type,
        name: paymentMethod.name,
        currency: paymentMethod.currency,
        isEnabled: paymentMethod.isEnabled,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create payment method error:', error)
    return NextResponse.json(
      { error: 'Error al crear método de pago' },
      { status: 500 }
    )
  }
}
