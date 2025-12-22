import { NextRequest, NextResponse } from 'next/server'
import { receiptRepository } from '@/lib/db/repositories'
import { validateAdminRequest } from '@/lib/auth'
import { ReceiptStatusType } from '@/lib/constants'
import { toReceiptListDTO } from '@/lib/dto/receipt.dto'
import { IReceipt } from '@/lib/db/models/Receipt'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as ReceiptStatusType | null
    const accountId = searchParams.get('accountId') || ''

    const result = await receiptRepository.list({
      page,
      limit,
      filters: {
        ...(status && { status }),
        ...(accountId && { accountId }),
      },
    })

    return NextResponse.json({
      receipts: toReceiptListDTO(result.data as unknown as IReceipt[]),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Get receipts error:', error)
    return NextResponse.json(
      { error: 'Error al obtener recibos' },
      { status: 500 }
    )
  }
}
