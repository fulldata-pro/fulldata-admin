import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { tokenPricingRepository } from '@/lib/db/repositories'
import { toTokenPricingListDTO, toTokenPriceSimpleListDTO } from '@/lib/dto/token-pricing.dto'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const simple = searchParams.get('simple') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const countryCode = searchParams.get('countryCode') || undefined
    const currency = searchParams.get('currency') || undefined

    // If simple mode, return just active prices for services page
    if (simple) {
      const activePrices = await tokenPricingRepository.getAllActive()
      return NextResponse.json({
        prices: toTokenPriceSimpleListDTO(activePrices),
      })
    }

    // Full list with pagination
    const result = await tokenPricingRepository.list({
      page,
      limit,
      filters: {
        countryCode,
        currency,
      },
    })

    return NextResponse.json({
      pricing: toTokenPricingListDTO(result.data),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get token pricing error:', error)
    return NextResponse.json(
      { error: 'Error al obtener precios de tokens' },
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

    if (!body.countryCode || !body.currency || body.price === undefined) {
      return NextResponse.json(
        { error: 'País, moneda y precio son requeridos' },
        { status: 400 }
      )
    }

    // Check if pricing already exists for this country
    const existing = await tokenPricingRepository.findByCountry(body.countryCode)
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe configuración de precios para ${body.countryCode}` },
        { status: 400 }
      )
    }

    const pricing = await tokenPricingRepository.createPricing({
      countryCode: body.countryCode,
      currency: body.currency,
      price: body.price,
      minPurchase: body.minPurchase,
      maxPurchase: body.maxPurchase,
      packages: body.packages || [],
      createdBy: admin._id,
    })

    return NextResponse.json({
      pricing: {
        id: pricing.id,
        uid: pricing.uid,
        countryCode: pricing.countryCode,
        currency: pricing.currency,
        price: pricing.price,
        minPurchase: pricing.minPurchase,
        isEnabled: pricing.isEnabled,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create token pricing error:', error)
    return NextResponse.json(
      { error: 'Error al crear configuración de precios' },
      { status: 500 }
    )
  }
}
