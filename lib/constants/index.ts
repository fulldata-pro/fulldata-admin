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

export const ServicesType = {
  PEOPLE: 'people',
  COMPANIES: 'companies',
  VEHICLES: 'vehicles',
  PHONES: 'phones',
  BANKS: 'banks',
  OSINT: 'osint',
  IDENTITY: 'identity',
} as const

export type ServiceType = (typeof ServicesType)[keyof typeof ServicesType]

export const ServiceLabels: Record<ServiceType, string> = {
  people: 'Personas',
  companies: 'Empresas',
  vehicles: 'Vehículos',
  phones: 'Teléfonos',
  banks: 'Bancos',
  osint: 'OSINT',
  identity: 'Identidad',
}

export const ServiceColors: Record<ServiceType, string> = {
  people: '#1E90FF',
  companies: '#FF4500',
  vehicles: '#9370DB',
  phones: '#ffa500',
  banks: '#0e7490',
  osint: '#FF6347',
  identity: '#c9ab02',
}

export const ReceiptStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type ReceiptStatusType = (typeof ReceiptStatus)[keyof typeof ReceiptStatus]

export const MovementTypes = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  ACCOUNT_VERIFICATION: 'ACCOUNT_VERIFICATION',
  REQUEST_CONSUMED: 'REQUEST_CONSUMED',
  BY_REFERRAL: 'BY_REFERRAL',
  BUY_SEARCHES: 'BUY_SEARCHES',
  UPDATE_SEARCHES: 'UPDATE_SEARCHES',
  EXPIRED_SEARCHES: 'EXPIRED_SEARCHES',
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

export const MovementStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  EXPIRED: 'EXPIRED',
} as const

export type MovementStatusType = (typeof MovementStatus)[keyof typeof MovementStatus]

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

export const PaymentMethodType = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CRYPTO: 'CRYPTO',
  PAYPAL: 'PAYPAL',
  MERCADO_PAGO: 'MERCADO_PAGO',
  STRIPE: 'STRIPE',
  OTHER: 'OTHER',
} as const

export type PaymentMethodTypeValue = (typeof PaymentMethodType)[keyof typeof PaymentMethodType]

export const PaymentMethodAccepted = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  ACCOUNT_MONEY: 'ACCOUNT_MONEY',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const

export type PaymentMethodAcceptedValue = (typeof PaymentMethodAccepted)[keyof typeof PaymentMethodAccepted]

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
