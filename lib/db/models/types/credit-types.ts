/**
 * Tipos compartidos para el sistema de créditos
 */

export type SearchType =
  | "PEOPLE"
  | "COMPANIES"
  | "BANKS"
  | "VEHICLES"
  | "PHONES"
  | "OSINT"
  | "IDENTITY"

export type CreditSource = 'PURCHASE' | 'SUBSCRIPTION' | 'ADMIN' | 'LEGACY' | 'REFUND';

export type CreditStatus = 'ACTIVE' | 'EXPIRED' | 'CONSUMED' | 'ARCHIVED';

export interface CreditMetadata {
  purchasePrice?: number;
  currency?: string;
  promotionCode?: string;
  description?: string;
}
