import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { bulkDiscountRepository } from '@/lib/db/repositories'
import { toBulkDiscountListDTO } from '@/lib/dto/bulk-discount.dto'

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
    const isEnabled = searchParams.get('isEnabled')
    const isDefault = searchParams.get('isDefault')

    const result = await bulkDiscountRepository.list({
      page,
      limit,
      filters: {
        search,
        isEnabled: isEnabled !== null ? isEnabled === 'true' : undefined,
        isDefault: isDefault !== null ? isDefault === 'true' : undefined,
      },
    })

    return NextResponse.json({
      bulkDiscounts: toBulkDiscountListDTO(result.data),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get bulk discounts error:', error)
    return NextResponse.json(
      { error: 'Error al obtener descuentos por cantidad' },
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
    if (!body.name || !body.tiers || body.tiers.length === 0) {
      return NextResponse.json(
        { error: 'Nombre y al menos un nivel de descuento son requeridos' },
        { status: 400 }
      )
    }

    // Validate tiers
    for (const tier of body.tiers) {
      if (tier.minTokens === undefined || tier.discountPercentage === undefined) {
        return NextResponse.json(
          { error: 'Cada nivel debe tener cantidad mínima y porcentaje de descuento' },
          { status: 400 }
        )
      }
      if (tier.discountPercentage < 0 || tier.discountPercentage > 100) {
        return NextResponse.json(
          { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
          { status: 400 }
        )
      }
    }

    // Check if name already exists
    const nameExists = await bulkDiscountRepository.nameExists(body.name)
    if (nameExists) {
      return NextResponse.json(
        { error: `El nombre "${body.name}" ya existe` },
        { status: 400 }
      )
    }

    const bulkDiscount = await bulkDiscountRepository.createBulkDiscount(
      {
        name: body.name,
        description: body.description,
        isDefault: body.isDefault,
        tiers: body.tiers,
        applicableCurrencies: body.applicableCurrencies,
        applicableCountries: body.applicableCountries,
        requiresVerification: body.requiresVerification,
        minAccountAge: body.minAccountAge,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        isEnabled: body.isEnabled ?? true,
        priority: body.priority ?? 0,
      },
      admin._id
    )

    // If this is set as default, update other discounts
    if (body.isDefault) {
      await bulkDiscountRepository.setAsDefault(bulkDiscount._id, admin._id)
    }

    return NextResponse.json({
      bulkDiscount: {
        id: bulkDiscount.id,
        uid: bulkDiscount.uid,
        name: bulkDiscount.name,
        tiersCount: bulkDiscount.tiers.length,
        isEnabled: bulkDiscount.isEnabled,
        isDefault: bulkDiscount.isDefault,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create bulk discount error:', error)
    return NextResponse.json(
      { error: 'Error al crear descuento por cantidad' },
      { status: 500 }
    )
  }
}
