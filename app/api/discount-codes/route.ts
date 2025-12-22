import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { discountCodeRepository } from '@/lib/db/repositories'
import { toDiscountCodeListDTO } from '@/lib/dto/discount-code.dto'
import { DiscountType, DiscountTypeType } from '@/lib/constants/discount.constants'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const type = searchParams.get('type') as DiscountTypeType | undefined
    const isEnabled = searchParams.get('isEnabled')

    const result = await discountCodeRepository.list({
      page,
      limit,
      filters: {
        search,
        type,
        isEnabled: isEnabled !== null ? isEnabled === 'true' : undefined,
      },
    })

    return NextResponse.json({
      discountCodes: toDiscountCodeListDTO(result.data),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get discount codes error:', error)
    return NextResponse.json(
      { error: 'Error al obtener códigos de descuento' },
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

    // Validate required fields
    if (!body.code || !body.name || !body.type || body.value === undefined) {
      return NextResponse.json(
        { error: 'Código, nombre, tipo y valor son requeridos' },
        { status: 400 }
      )
    }

    // Validate type
    if (!Object.values(DiscountType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo de descuento inválido' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const codeExists = await discountCodeRepository.codeExists(body.code)
    if (codeExists) {
      return NextResponse.json(
        { error: `El código ${body.code.toUpperCase()} ya existe` },
        { status: 400 }
      )
    }

    const discountCode = await discountCodeRepository.createDiscountCode(
      {
        code: body.code,
        name: body.name,
        description: body.description,
        type: body.type,
        value: body.value,
        applicableCurrencies: body.applicableCurrencies,
        minimumPurchase: body.minimumPurchase,
        maximumDiscount: body.maximumDiscount,
        maxUses: body.maxUses,
        maxUsesPerAccount: body.maxUsesPerAccount,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        requiresVerification: body.requiresVerification,
        firstPurchaseOnly: body.firstPurchaseOnly,
        isEnabled: body.isEnabled ?? true,
        termsAndConditions: body.termsAndConditions,
      },
      admin._id
    )

    return NextResponse.json({
      discountCode: {
        id: discountCode.id,
        uid: discountCode.uid,
        code: discountCode.code,
        name: discountCode.name,
        type: discountCode.type,
        value: discountCode.value,
        isEnabled: discountCode.isEnabled,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create discount code error:', error)
    return NextResponse.json(
      { error: 'Error al crear código de descuento' },
      { status: 500 }
    )
  }
}
