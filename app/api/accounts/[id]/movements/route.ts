import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Movement from '@/lib/db/models/Movement'
// Import User model for populate
import '@/lib/db/models/User'
import { validateAdminRequest } from '@/lib/auth'
import { MovementType } from '@/lib/constants/movement.constants'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Token-related movement types to filter
const TOKEN_MOVEMENT_TYPES = [
  MovementType.TOKENS_PURCHASED,
  MovementType.TOKENS_BONUS,
  MovementType.TOKENS_REFUNDED,
  MovementType.TOKENS_ADJUSTMENT,
]

/**
 * GET /api/accounts/[id]/movements
 * Get token movements for an account with pagination
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    await dbConnect()

    // Build query for token movements
    const query = {
      accountId: id,
      type: { $in: TOKEN_MOVEMENT_TYPES },
      deletedAt: null,
    }

    // Get total count and movements in parallel
    const [total, movements] = await Promise.all([
      Movement.countDocuments(query),
      Movement.find(query)
        .select('id uid type status metadata createdAt createdBy')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error) {
    console.error('Get movements error:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}
