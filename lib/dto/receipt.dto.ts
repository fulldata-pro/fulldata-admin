import { IReceipt } from '@/lib/db/models/Receipt'

/**
 * DTO for Receipt list response
 * Transforms database model to API response format
 */

interface AccountDTO {
  id?: number
  uid: string
  email: string
  avatar?: string
  name?: string
  billingName?: string
}

interface InvoiceDTO {
  id: string
  uid: string
  number?: string
  status: string
}

interface DiscountCodeDTO {
  code: string
  name: string
  value: number
  type: string
}

interface BulkDiscountDTO {
  name: string
  appliedTier?: {
    minTokens: number
    discountPercentage: number
    label?: string
  }
}

interface TokensDTO {
  quantity: number
  unitPrice: number
}

export interface ReceiptListItemDTO {
  id: number
  uid: string
  status: string
  total: number
  subtotal: number
  currency: string
  tokens: TokensDTO | null
  paymentProvider: string | null
  invoice: InvoiceDTO | null
  discountCode: DiscountCodeDTO | null
  bulkDiscount: BulkDiscountDTO | null
  account: AccountDTO
  expiredAt: string | null
  createdAt: string
}

/**
 * Transform a Receipt document to DTO format
 * Works with both Mongoose documents and lean objects
 */
export function toReceiptListItemDTO(receipt: IReceipt): ReceiptListItemDTO {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = receipt as any

  // Transform account
  const accountId = doc.accountId
  const account: AccountDTO = accountId ? {
    id: accountId.id,
    uid: accountId.uid,
    email: accountId.email,
    avatar: accountId.avatar,
    name: accountId.name,
    billingName: accountId.billing?.name,
  } : {
    uid: '',
    email: '',
  }

  // Get payment provider
  const paymentProvider = doc.paymentProvider as string | undefined

  // Transform invoice
  const invoiceId = doc.invoiceId
  const invoice: InvoiceDTO | undefined = invoiceId ? {
    id: invoiceId._id?.toString?.() || String(invoiceId._id),
    uid: invoiceId.uid,
    number: invoiceId.number,
    status: invoiceId.status,
  } : undefined

  // Transform discount code
  const discountCodeId = doc.discountCodeId
  const discountCode: DiscountCodeDTO | undefined = discountCodeId ? {
    code: discountCodeId.code,
    name: discountCodeId.name,
    value: discountCodeId.value,
    type: discountCodeId.type,
  } : undefined

  // Transform tokens
  const tokens = doc.tokens as TokensDTO | undefined

  // Transform bulk discount - only include the applied tier
  const bulkDiscountId = doc.bulkDiscountId
  let bulkDiscount: BulkDiscountDTO | undefined = undefined
  if (bulkDiscountId) {
    const tiers = bulkDiscountId.tiers as Array<{
      minTokens: number
      maxTokens?: number
      discountPercentage: number
      label?: string
      _id?: string
    }> | undefined

    // Find the applied tier based on token quantity
    const tokenQty = tokens?.quantity || 0
    const appliedTier = tiers
      ?.filter((t) => tokenQty >= t.minTokens)
      .sort((a, b) => b.minTokens - a.minTokens)[0]

    bulkDiscount = {
      name: bulkDiscountId.name,
      appliedTier: appliedTier ? {
        minTokens: appliedTier.minTokens,
        discountPercentage: appliedTier.discountPercentage,
        label: appliedTier.label,
      } : undefined,
    }
  }

  // Handle dates - could be Date objects or ISO strings from lean()
  const expiredAt = doc.expiredAt
    ? (typeof doc.expiredAt === 'string' ? doc.expiredAt : doc.expiredAt.toISOString?.() || String(doc.expiredAt))
    : undefined
  const createdAt = typeof doc.createdAt === 'string'
    ? doc.createdAt
    : doc.createdAt?.toISOString?.() || new Date(doc.createdAt).toISOString()

  return {
    id: doc.id,
    uid: doc.uid,
    status: doc.status,
    total: doc.total,
    subtotal: doc.subtotal,
    currency: doc.currency,
    tokens: tokens || null,
    paymentProvider: paymentProvider || null,
    invoice: invoice || null,
    discountCode: discountCode || null,
    bulkDiscount: bulkDiscount || null,
    account,
    expiredAt: expiredAt || null,
    createdAt,
  }
}

/**
 * Transform an array of Receipt documents to DTO format
 */
export function toReceiptListDTO(receipts: IReceipt[]): ReceiptListItemDTO[] {
  return receipts.map(toReceiptListItemDTO)
}
