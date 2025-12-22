/**
 * Movement Constants
 *
 * Tipos y constantes relacionados con movimientos (transacciones)
 */

export enum MovementType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',

  // Sistema de tokens
  TOKENS_PURCHASED = 'TOKENS_PURCHASED',      // Compra de tokens
  TOKENS_CONSUMED = 'TOKENS_CONSUMED',        // Consumo de tokens en servicio
  TOKENS_REFUNDED = 'TOKENS_REFUNDED',        // Devolución de tokens
  TOKENS_BONUS = 'TOKENS_BONUS',              // Tokens de bonificación
  TOKENS_ADJUSTMENT = 'TOKENS_ADJUSTMENT'     // Ajuste manual de tokens
}

export enum MovementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED'
}

// Labels para UI (español)
export const MovementTypeLabel: Record<MovementType, string> = {
  // Verificaciones
  [MovementType.EMAIL_VERIFICATION]: 'Verificación de Email',
  [MovementType.PHONE_VERIFICATION]: 'Verificación de Teléfono',
  [MovementType.ACCOUNT_VERIFICATION]: 'Verificación de Cuenta',

  // Tokens
  [MovementType.TOKENS_PURCHASED]: 'Compra de Tokens',
  [MovementType.TOKENS_CONSUMED]: 'Consumo de Tokens',
  [MovementType.TOKENS_REFUNDED]: 'Devolución de Tokens',
  [MovementType.TOKENS_BONUS]: 'Tokens de Bonificación',
  [MovementType.TOKENS_ADJUSTMENT]: 'Ajuste de Tokens'
}

export const MovementStatusLabel: Record<MovementStatus, string> = {
  [MovementStatus.PENDING]: 'Pendiente',
  [MovementStatus.APPROVED]: 'Aprobado',
  [MovementStatus.EXPIRED]: 'Expirado'
}

// Helper para determinar si es un movimiento de tokens
export const isTokenMovement = (type: MovementType): boolean => {
  return type.startsWith('TOKENS_')
}
