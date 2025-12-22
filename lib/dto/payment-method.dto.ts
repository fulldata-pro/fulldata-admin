import { IPaymentMethod } from '@/lib/db/models/PaymentMethod'

/**
 * DTO for Payment Method list item
 */
export interface PaymentMethodListItemDTO {
  id: number
  uid: string
  type: string
  name: string
  icon?: string
  color?: string
  currency: string
  acceptedMethods: string[]
  isEnabled: boolean
}

/**
 * DTO for Payment Method detail
 */
export interface PaymentMethodDetailDTO extends PaymentMethodListItemDTO {
  createdAt: string
  updatedAt?: string
}

/**
 * Transform a PaymentMethod document to list item DTO
 */
export function toPaymentMethodListItemDTO(paymentMethod: IPaymentMethod): PaymentMethodListItemDTO {
  return {
    id: paymentMethod.id,
    uid: paymentMethod.uid,
    type: paymentMethod.type,
    name: paymentMethod.name,
    icon: paymentMethod.icon,
    color: paymentMethod.color,
    currency: paymentMethod.currency,
    acceptedMethods: paymentMethod.acceptedMethods || [],
    isEnabled: paymentMethod.isEnabled,
  }
}

/**
 * Transform a PaymentMethod document to detail DTO
 */
export function toPaymentMethodDetailDTO(paymentMethod: IPaymentMethod): PaymentMethodDetailDTO {
  return {
    ...toPaymentMethodListItemDTO(paymentMethod),
    createdAt: paymentMethod.createdAt.toISOString(),
    updatedAt: paymentMethod.updatedAt?.toISOString(),
  }
}

/**
 * Transform an array of PaymentMethod documents to list DTOs
 */
export function toPaymentMethodListDTO(paymentMethods: IPaymentMethod[]): PaymentMethodListItemDTO[] {
  return paymentMethods.map(toPaymentMethodListItemDTO)
}

/**
 * Group payment methods by currency
 */
export interface PaymentMethodsByCurrencyDTO {
  currency: string
  methods: PaymentMethodListItemDTO[]
}

export function groupPaymentMethodsByCurrency(
  paymentMethods: IPaymentMethod[]
): PaymentMethodsByCurrencyDTO[] {
  const grouped: Record<string, PaymentMethodListItemDTO[]> = {}

  for (const pm of paymentMethods) {
    if (!grouped[pm.currency]) {
      grouped[pm.currency] = []
    }
    grouped[pm.currency].push(toPaymentMethodListItemDTO(pm))
  }

  return Object.entries(grouped)
    .map(([currency, methods]) => ({ currency, methods }))
    .sort((a, b) => a.currency.localeCompare(b.currency))
}
