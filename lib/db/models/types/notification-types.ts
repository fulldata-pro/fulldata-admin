/**
 * Tipos de notificaciones disponibles en el sistema
 */
export enum NotificationType {
  CREDIT_CONSUMPTION = 'CREDIT_CONSUMPTION',
  CREDIT_PURCHASE = 'CREDIT_PURCHASE',
  SEARCH_COMPLETED = 'SEARCH_COMPLETED',
  LOW_BALANCE = 'LOW_BALANCE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
  USER_INVITED = 'USER_INVITED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_REJECTED = 'INVITATION_REJECTED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  GENERAL = 'GENERAL'
}

/**
 * Array de valores de NotificationType para validaciones
 */
export const notificationTypes = Object.values(NotificationType);
