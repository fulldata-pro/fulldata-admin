import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import AccountApi from '@/lib/db/models/AccountApi'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/accounts/[id]/api-keys
 * Get API keys for an account
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    // Find all API keys for this account
    const accountApis = await AccountApi.find({
      accountId: id,
      deletedAt: null
    })
    .select('id uid apiKey isEnabled createdAt updatedAt lastUsedAt usage')
    .sort({ createdAt: -1 })
    .lean()

    // Transform the data for frontend
    const apiKeys = accountApis.map((api: any) => ({
      _id: api._id,
      id: api.id,
      uid: api.uid,
      apiKey: api.apiKey,
      isEnabled: api.isEnabled,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
      lastUsedAt: api.lastUsedAt,
      usage: api.usage || {
        totalRequests: 0,
        todayRequests: 0,
        monthRequests: 0
      }
    }))

    return NextResponse.json({
      apiKeys,
      total: apiKeys.length
    })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { error: 'Error al obtener API keys' },
      { status: 500 }
    )
  }
}