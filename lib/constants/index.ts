export const AdminRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const

export type AdminRole = (typeof AdminRoles)[keyof typeof AdminRoles]

export const AdminStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export type AdminStatusType = (typeof AdminStatus)[keyof typeof AdminStatus]

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const

export type AccountStatusType = (typeof AccountStatus)[keyof typeof AccountStatus]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
} as const

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus]

export const AuthProvider = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
} as const

export type AuthProviderType = (typeof AuthProvider)[keyof typeof AuthProvider]

/** @deprecated Use AccountBillingType instead */
export const AccountType = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
} as const

/** @deprecated Use AccountBillingTypeValue instead */
export type AccountTypeValue = (typeof AccountType)[keyof typeof AccountType]

export const AccountBillingType = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
} as const

export type AccountBillingTypeValue = (typeof AccountBillingType)[keyof typeof AccountBillingType]

export const ServicesType = {
  PEOPLE: 'PEOPLE',
  COMPANIES: 'COMPANIES',
  VEHICLES: 'VEHICLES',
  PHONES: 'PHONES',
  BANKS: 'BANKS',
  OSINT: 'OSINT',
  IDENTITY: 'IDENTITY',
} as const

export type ServiceType = (typeof ServicesType)[keyof typeof ServicesType]

export const ServiceLabels: Record<ServiceType, string> = {
  PEOPLE: 'Personas',
  COMPANIES: 'Empresas',
  VEHICLES: 'Vehículos',
  PHONES: 'Teléfonos',
  BANKS: 'Bancos',
  OSINT: 'WEB',
  IDENTITY: 'Identidad',
}

export const ServiceColors: Record<ServiceType, string> = {
  PEOPLE: '#1E90FF',
  COMPANIES: '#FF4500',
  VEHICLES: '#9370DB',
  PHONES: '#ffa500',
  BANKS: '#0e7490',
  OSINT: '#FF6347',
  IDENTITY: '#c9ab02',
}

export const ReceiptStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type ReceiptStatusType = (typeof ReceiptStatus)[keyof typeof ReceiptStatus]

// Re-export movement constants from dedicated file
export { MovementType, MovementStatus, MovementTypeLabel, MovementStatusLabel, isTokenMovement } from './movement.constants'

// Re-export routes
export { ROUTES } from './routes.constants'

/** @deprecated Use MovementType enum instead */
export const MovementTypes = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  ACCOUNT_VERIFICATION: 'ACCOUNT_VERIFICATION',
  REQUEST_CONSUMED: 'REQUEST_CONSUMED',
  BY_REFERRAL: 'BY_REFERRAL',
  BUY_SEARCHES: 'BUY_SEARCHES',
  UPDATE_SEARCHES: 'UPDATE_SEARCHES',
  EXPIRED_SEARCHES: 'EXPIRED_SEARCHES',
  // Token types
  TOKENS_PURCHASED: 'TOKENS_PURCHASED',
  TOKENS_CONSUMED: 'TOKENS_CONSUMED',
  TOKENS_REFUNDED: 'TOKENS_REFUNDED',
  TOKENS_BONUS: 'TOKENS_BONUS',
  TOKENS_ADJUSTMENT: 'TOKENS_ADJUSTMENT',
} as const

export const BenefitAdvantageTypes = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
  CREDITS: 'CREDITS',
} as const

export type BenefitAdvantageType = (typeof BenefitAdvantageTypes)[keyof typeof BenefitAdvantageTypes]

export const Currencies = {
  ARS: 'ARS',
  USD: 'USD',
  EUR: 'EUR',
  BRL: 'BRL',
} as const

export type CurrencyType = (typeof Currencies)[keyof typeof Currencies]

export const InvoiceTypes = {
  AFIP: 'AFIP',
  INTERNATIONAL: 'INTERNATIONAL',
  GENERIC: 'GENERIC',
} as const

export type InvoiceType = (typeof InvoiceTypes)[keyof typeof InvoiceTypes]

export type MovementStatusType = (typeof import('./movement.constants').MovementStatus)[keyof typeof import('./movement.constants').MovementStatus]

export const RequestStatus = {
  PENDING: 'PENDING',
  REVIEW_NEEDED: 'REVIEW_NEEDED',
  PROCESSING: 'PROCESSING',
  PARTIAL: 'PARTIAL',
  NOT_FOUND: 'NOT_FOUND',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
} as const

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus]

export const RequestSource = {
  API: 'API',
  WEB: 'WEB',
} as const

export type RequestSourceType = (typeof RequestSource)[keyof typeof RequestSource]

export const RequestSourceLabels: Record<RequestSourceType, string> = {
  API: 'API',
  WEB: 'Web',
}

export const PaymentProvider = {
  MERCADO_PAGO: 'MERCADO_PAGO',
  STRIPE: 'STRIPE',
} as const

export type PaymentProviderType = (typeof PaymentProvider)[keyof typeof PaymentProvider]

export const AccountInvitationRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const

export type AccountInvitationRoleType = (typeof AccountInvitationRole)[keyof typeof AccountInvitationRole]

export const AccountCreditSource = {
  PURCHASE: 'PURCHASE',
  SUBSCRIPTION: 'SUBSCRIPTION',
  ADMIN: 'ADMIN',
  LEGACY: 'LEGACY',
} as const

export type AccountCreditSourceType = (typeof AccountCreditSource)[keyof typeof AccountCreditSource]

export const AccountCreditStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CONSUMED: 'CONSUMED',
  ARCHIVED: 'ARCHIVED',
} as const

export type AccountCreditStatusType = (typeof AccountCreditStatus)[keyof typeof AccountCreditStatus]

export const WebhookEvent = {
  SEARCH_COMPLETED: 'SEARCH_COMPLETED',
} as const

export type WebhookEventType = (typeof WebhookEvent)[keyof typeof WebhookEvent]

export const WebhookLogStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  TIMEOUT: 'TIMEOUT',
} as const

export type WebhookLogStatusType = (typeof WebhookLogStatus)[keyof typeof WebhookLogStatus]

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const

export type InvitationStatusType = (typeof InvitationStatus)[keyof typeof InvitationStatus]

export const ReferralType = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const

export type ReferralTypeValue = (typeof ReferralType)[keyof typeof ReferralType]
