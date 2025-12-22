import { IDiscountCode, IDiscountCodeUsage } from '@/lib/db/models/DiscountCode'
import { DiscountTypeType } from '@/lib/constants/discount.constants'

/**
 * DTO for Discount Code list item
 */
export interface DiscountCodeListItemDTO {
  id: number
  uid: string
  code: string
  name: string
  type: DiscountTypeType
  value: number
  isEnabled: boolean
  currentUses: number
  maxUses?: number
  validFrom?: string
  validUntil?: string
  createdAt: string
}

/**
 * DTO for Discount Code usage
 */
export interface DiscountCodeUsageDTO {
  accountId: string
  usedAt: string
  tokensAmount: number
  discountApplied: number
  currency: string
}

/**
 * DTO for Discount Code detail
 */
export interface DiscountCodeDetailDTO extends DiscountCodeListItemDTO {
  description?: string
  applicableCurrencies: string[]
  minimumPurchase?: number
  maximumDiscount?: number
  maxUsesPerAccount?: number
  requiresVerification: boolean
  firstPurchaseOnly: boolean
  termsAndConditions?: string
  usageHistory: DiscountCodeUsageDTO[]
  updatedAt?: string
}

/**
 * Transform usage to DTO
 */
function toDiscountCodeUsageDTO(usage: IDiscountCodeUsage): DiscountCodeUsageDTO {
  return {
    accountId: usage.accountId.toString(),
    usedAt: usage.usedAt.toISOString(),
    tokensAmount: usage.tokensAmount,
    discountApplied: usage.discountApplied,
    currency: usage.currency,
  }
}

/**
 * Transform a DiscountCode document to list item DTO
 */
export function toDiscountCodeListItemDTO(discountCode: IDiscountCode): DiscountCodeListItemDTO {
  return {
    id: discountCode.id,
    uid: discountCode.uid,
    code: discountCode.code,
    name: discountCode.name,
    type: discountCode.type,
    value: discountCode.value,
    isEnabled: discountCode.isEnabled,
    currentUses: discountCode.currentUses,
    maxUses: discountCode.maxUses,
    validFrom: discountCode.validFrom?.toISOString(),
    validUntil: discountCode.validUntil?.toISOString(),
    createdAt: discountCode.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

/**
 * Transform a DiscountCode document to detail DTO
 */
export function toDiscountCodeDetailDTO(discountCode: IDiscountCode): DiscountCodeDetailDTO {
  return {
    id: discountCode.id,
    uid: discountCode.uid,
    code: discountCode.code,
    name: discountCode.name,
    type: discountCode.type,
    value: discountCode.value,
    isEnabled: discountCode.isEnabled,
    currentUses: discountCode.currentUses,
    maxUses: discountCode.maxUses,
    maxUsesPerAccount: discountCode.maxUsesPerAccount,
    validFrom: discountCode.validFrom?.toISOString(),
    validUntil: discountCode.validUntil?.toISOString(),
    description: discountCode.description,
    applicableCurrencies: discountCode.applicableCurrencies || [],
    minimumPurchase: discountCode.minimumPurchase,
    maximumDiscount: discountCode.maximumDiscount,
    requiresVerification: discountCode.requiresVerification ?? false,
    firstPurchaseOnly: discountCode.firstPurchaseOnly ?? false,
    termsAndConditions: discountCode.termsAndConditions,
    usageHistory: (discountCode.usageHistory || []).slice(0, 100).map(toDiscountCodeUsageDTO),
    createdAt: discountCode.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: discountCode.updatedAt?.toISOString(),
  }
}

/**
 * Transform an array of DiscountCode documents to list DTOs
 */
export function toDiscountCodeListDTO(discountCodes: IDiscountCode[]): DiscountCodeListItemDTO[] {
  return discountCodes.map(toDiscountCodeListItemDTO)
}
