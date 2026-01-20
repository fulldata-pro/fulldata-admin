import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import dbConnect from '@/lib/db/connection'
import { receiptRepository } from '@/lib/db/repositories'

export async function GET(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { admin, error } = await validateAdminRequest(req)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const { uid } = params

    // Get the receipt with populated data
    const receipt = await receiptRepository.findOne(
      { uid },
      {
        populate: [
          {
            path: 'accountId',
            select: 'uid email billingName avatar billing',
          },
          {
            path: 'invoiceId',
            select: 'uid data',
          },
          {
            path: 'discountCodeId',
            select: 'code name value type',
          },
          {
            path: 'bulkDiscountId',
            select: 'name appliedTier',
          },
          {
            path: 'benefitId',
            select: 'name description',
          },
        ],
      }
    )

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Transform the receipt data for frontend
    const transformedReceipt = {
      id: receipt.id,
      uid: receipt.uid,
      status: receipt.status,
      statusMessage: receipt.statusMessage,
      total: receipt.total,
      subtotal: receipt.subtotal,
      currency: receipt.currency,
      paymentProvider: receipt.paymentProvider,
      tokens: receipt.tokens,
      providerTransactionId: receipt.providerTransactionId,
      providerTransactionUrl: receipt.providerTransactionUrl,
      account: receipt.accountId
        ? {
            uid: (receipt.accountId as any).uid,
            email: (receipt.accountId as any).email,
            billingName: (receipt.accountId as any).billingName,
            avatar: (receipt.accountId as any).avatar,
            billing: (receipt.accountId as any).billing,
          }
        : null,
      invoice: receipt.invoiceId
        ? {
            uid: (receipt.invoiceId as any).uid,
            data: (receipt.invoiceId as any).data,
          }
        : null,
      discountCode: receipt.discountCodeId
        ? {
            code: (receipt.discountCodeId as any).code,
            name: (receipt.discountCodeId as any).name,
            value: (receipt.discountCodeId as any).value,
            type: (receipt.discountCodeId as any).type,
          }
        : null,
      bulkDiscount: receipt.bulkDiscountId
        ? {
            name: (receipt.bulkDiscountId as any).name,
            appliedTier: (receipt.bulkDiscountId as any).appliedTier,
          }
        : null,
      benefit: receipt.benefitId
        ? {
            name: (receipt.benefitId as any).name,
            description: (receipt.benefitId as any).description,
          }
        : null,
      expiredAt: receipt.expiredAt,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    }

    return NextResponse.json({ receipt: transformedReceipt })
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}