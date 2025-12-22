/**
 * Discount Constants
 *
 * Constantes para el sistema de descuentos de tokens
 */

// Tipos de descuento para códigos
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',        // Descuento porcentual (ej: 20% off)
  FIXED_AMOUNT = 'FIXED_AMOUNT',   // Descuento fijo en tokens (ej: 100 tokens gratis)
  BONUS_TOKENS = 'BONUS_TOKENS'    // Tokens extra (ej: compra 1000, recibe 1200)
}

export type DiscountTypeType = `${DiscountType}`

// Labels para tipos de descuento
export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: 'Porcentaje de descuento',
  [DiscountType.FIXED_AMOUNT]: 'Descuento fijo',
  [DiscountType.BONUS_TOKENS]: 'Tokens de bonificación'
}

// Configuración por defecto
export const DEFAULT_MAX_USES_PER_ACCOUNT = 1
export const DEFAULT_DISCOUNT_PRIORITY = 0

// Límites
export const MAX_DISCOUNT_PERCENTAGE = 100
export const MIN_DISCOUNT_PERCENTAGE = 0
export const MIN_TOKEN_AMOUNT = 1
