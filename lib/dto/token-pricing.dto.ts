import { ITokenPricing, ITokenPackage } from '@/lib/db/models/TokenPricing'

/**
 * DTO for Token Package
 */
export interface TokenPackageDTO {
  id: string
  name: string
  amount: number
  price: number
  discount: number
  popular: boolean
  description?: string
}

/**
 * DTO for Token Pricing list item
 */
export interface TokenPricingListItemDTO {
  id: number
  uid: string
  countryCode: string
  currency: string
  price: number
  minPurchase: number
  maxPurchase?: number
  packagesCount: number
  isEnabled: boolean
}

/**
 * DTO for Token Pricing detail
 */
export interface TokenPricingDetailDTO extends TokenPricingListItemDTO {
  packages: TokenPackageDTO[]
  createdAt: string
  updatedAt?: string
}

/**
 * Transform a TokenPackage to DTO
 */
function toTokenPackageDTO(pkg: ITokenPackage): TokenPackageDTO {
  return {
    id: pkg.id,
    name: pkg.name,
    amount: pkg.amount,
    price: pkg.price,
    discount: pkg.discount,
    popular: pkg.popular ?? false,
    description: pkg.description,
  }
}

/**
 * Transform a TokenPricing document to list item DTO
 */
export function toTokenPricingListItemDTO(pricing: ITokenPricing): TokenPricingListItemDTO {
  return {
    id: pricing.id,
    uid: pricing.uid,
    countryCode: pricing.countryCode,
    currency: pricing.currency,
    price: pricing.price,
    minPurchase: pricing.minPurchase,
    maxPurchase: pricing.maxPurchase,
    packagesCount: pricing.packages?.length ?? 0,
    isEnabled: pricing.isEnabled,
  }
}

/**
 * Transform a TokenPricing document to detail DTO
 */
export function toTokenPricingDetailDTO(pricing: ITokenPricing): TokenPricingDetailDTO {
  return {
    id: pricing.id,
    uid: pricing.uid,
    countryCode: pricing.countryCode,
    currency: pricing.currency,
    price: pricing.price,
    minPurchase: pricing.minPurchase,
    maxPurchase: pricing.maxPurchase,
    packagesCount: pricing.packages?.length ?? 0,
    isEnabled: pricing.isEnabled,
    packages: (pricing.packages || []).map(toTokenPackageDTO),
    createdAt: pricing.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: pricing.updatedAt?.toISOString(),
  }
}

/**
 * Transform an array of TokenPricing documents to list DTOs
 */
export function toTokenPricingListDTO(pricings: ITokenPricing[]): TokenPricingListItemDTO[] {
  return pricings.map(toTokenPricingListItemDTO)
}

/**
 * Simple DTO for showing token prices on services page (by currency)
 */
export interface TokenPriceSimpleDTO {
  currency: string
  price: number
}

/**
 * Transform TokenPricing to simple DTO for services page
 */
export function toTokenPriceSimpleDTO(pricing: ITokenPricing): TokenPriceSimpleDTO {
  return {
    currency: pricing.currency,
    price: pricing.price,
  }
}

/**
 * Transform array of TokenPricing to simple DTOs (unique by currency)
 */
export function toTokenPriceSimpleListDTO(pricings: ITokenPricing[]): TokenPriceSimpleDTO[] {
  // Get unique prices by currency (first one wins)
  const seen = new Set<string>()
  return pricings
    .filter((p) => {
      if (seen.has(p.currency)) return false
      seen.add(p.currency)
      return true
    })
    .map(toTokenPriceSimpleDTO)
}
