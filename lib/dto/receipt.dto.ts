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
  billingName?: string
}

interface PaymentMethodDTO {
  name: string
  type?: string
  provider?: string
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
  tiers: Array<{
    minTokens: number
    maxTokens?: number
    discountPercentage: number
    label?: string
  }>
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
  tokens?: TokensDTO
  paymentMethod?: PaymentMethodDTO
  invoice?: InvoiceDTO
  discountCode?: DiscountCodeDTO
  bulkDiscount?: BulkDiscountDTO
  account: AccountDTO
  expiredAt?: string
  createdAt: string
}

/**
 * Transform a Receipt document to DTO format
 */
export function toReceiptListItemDTO(receipt: IReceipt): ReceiptListItemDTO {
  const doc = receipt as unknown as Record<string, unknown>

  // Transform account
  const accountId = doc.accountId as Record<string, unknown> | undefined
  const billing = accountId?.billing as { name?: string } | undefined
  const account: AccountDTO = accountId ? {
    id: accountId.id as number | undefined,
    uid: accountId.uid as string,
    email: accountId.email as string,
    avatar: accountId.avatar as string | undefined,
    billingName: billing?.name,
  } : {
    uid: '',
    email: '',
  }

  // Transform payment method
  const paymentMethodId = doc.paymentMethodId as Record<string, unknown> | undefined
  const paymentMethod: PaymentMethodDTO | undefined = paymentMethodId ? {
    name: paymentMethodId.name as string,
    type: paymentMethodId.type as string | undefined,
    provider: paymentMethodId.provider as string | undefined,
  } : undefined

  // Transform invoice
  const invoiceId = doc.invoiceId as Record<string, unknown> | undefined
  const invoice: InvoiceDTO | undefined = invoiceId ? {
    id: (invoiceId._id as { toString(): string })?.toString(),
    uid: invoiceId.uid as string,
    number: invoiceId.number as string | undefined,
    status: invoiceId.status as string,
  } : undefined

  // Transform discount code
  const discountCodeId = doc.discountCodeId as Record<string, unknown> | undefined
  const discountCode: DiscountCodeDTO | undefined = discountCodeId ? {
    code: discountCodeId.code as string,
    name: discountCodeId.name as string,
    value: discountCodeId.value as number,
    type: discountCodeId.type as string,
  } : undefined

  // Transform bulk discount
  const bulkDiscountId = doc.bulkDiscountId as Record<string, unknown> | undefined
  const bulkDiscount: BulkDiscountDTO | undefined = bulkDiscountId ? {
    name: bulkDiscountId.name as string,
    tiers: bulkDiscountId.tiers as BulkDiscountDTO['tiers'],
  } : undefined

  // Transform tokens
  const tokens = doc.tokens as TokensDTO | undefined

  return {
    id: receipt.id,
    uid: receipt.uid,
    status: receipt.status,
    total: receipt.total,
    subtotal: receipt.subtotal,
    currency: receipt.currency,
    tokens,
    paymentMethod,
    invoice,
    discountCode,
    bulkDiscount,
    account,
    expiredAt: receipt.expiredAt?.toISOString(),
    createdAt: receipt.createdAt.toISOString(),
  }
}

/**
 * Transform an array of Receipt documents to DTO format
 */
export function toReceiptListDTO(receipts: IReceipt[]): ReceiptListItemDTO[] {
  return receipts.map(toReceiptListItemDTO)
}
