import { IBulkDiscount, IDiscountTier, IBulkDiscountStats } from '@/lib/db/models/BulkDiscount'

/**
 * DTO for Discount Tier
 */
export interface DiscountTierDTO {
  minTokens: number
  maxTokens?: number
  discountPercentage: number
  label?: string
  isEnabled: boolean
}

/**
 * DTO for Bulk Discount Stats
 */
export interface BulkDiscountStatsDTO {
  totalUses: number
  totalTokensSold: number
  totalDiscountGiven: number
  lastUsedAt?: string
}

/**
 * DTO for Bulk Discount list item
 */
export interface BulkDiscountListItemDTO {
  id: number
  uid: string
  name: string
  description?: string
  isDefault: boolean
  tiersCount: number
  priority: number
  isEnabled: boolean
  validFrom?: string
  validUntil?: string
  createdAt: string
}

/**
 * DTO for Bulk Discount detail
 */
export interface BulkDiscountDetailDTO extends BulkDiscountListItemDTO {
  tiers: DiscountTierDTO[]
  applicableCurrencies: string[]
  applicableCountries: string[]
  requiresVerification: boolean
  minAccountAge?: number
  stats?: BulkDiscountStatsDTO
  updatedAt?: string
}

/**
 * Transform tier to DTO
 */
function toDiscountTierDTO(tier: IDiscountTier): DiscountTierDTO {
  return {
    minTokens: tier.minTokens,
    maxTokens: tier.maxTokens,
    discountPercentage: tier.discountPercentage,
    label: tier.label,
    isEnabled: tier.isEnabled ?? true,
  }
}

/**
 * Transform stats to DTO
 */
function toBulkDiscountStatsDTO(stats: IBulkDiscountStats): BulkDiscountStatsDTO {
  return {
    totalUses: stats.totalUses,
    totalTokensSold: stats.totalTokensSold,
    totalDiscountGiven: stats.totalDiscountGiven,
    lastUsedAt: stats.lastUsedAt?.toISOString(),
  }
}

/**
 * Transform a BulkDiscount document to list item DTO
 */
export function toBulkDiscountListItemDTO(bulkDiscount: IBulkDiscount): BulkDiscountListItemDTO {
  return {
    id: bulkDiscount.id,
    uid: bulkDiscount.uid,
    name: bulkDiscount.name,
    description: bulkDiscount.description,
    isDefault: bulkDiscount.isDefault ?? false,
    tiersCount: bulkDiscount.tiers?.length ?? 0,
    priority: bulkDiscount.priority,
    isEnabled: bulkDiscount.isEnabled,
    validFrom: bulkDiscount.validFrom?.toISOString(),
    validUntil: bulkDiscount.validUntil?.toISOString(),
    createdAt: bulkDiscount.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

/**
 * Transform a BulkDiscount document to detail DTO
 */
export function toBulkDiscountDetailDTO(bulkDiscount: IBulkDiscount): BulkDiscountDetailDTO {
  return {
    id: bulkDiscount.id,
    uid: bulkDiscount.uid,
    name: bulkDiscount.name,
    description: bulkDiscount.description,
    isDefault: bulkDiscount.isDefault ?? false,
    tiersCount: bulkDiscount.tiers?.length ?? 0,
    priority: bulkDiscount.priority,
    isEnabled: bulkDiscount.isEnabled,
    validFrom: bulkDiscount.validFrom?.toISOString(),
    validUntil: bulkDiscount.validUntil?.toISOString(),
    tiers: (bulkDiscount.tiers || []).map(toDiscountTierDTO),
    applicableCurrencies: bulkDiscount.applicableCurrencies || [],
    applicableCountries: bulkDiscount.applicableCountries || [],
    requiresVerification: bulkDiscount.requiresVerification ?? false,
    minAccountAge: bulkDiscount.minAccountAge,
    stats: bulkDiscount.stats ? toBulkDiscountStatsDTO(bulkDiscount.stats) : undefined,
    createdAt: bulkDiscount.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: bulkDiscount.updatedAt?.toISOString(),
  }
}

/**
 * Transform an array of BulkDiscount documents to list DTOs
 */
export function toBulkDiscountListDTO(bulkDiscounts: IBulkDiscount[]): BulkDiscountListItemDTO[] {
  return bulkDiscounts.map(toBulkDiscountListItemDTO)
}
