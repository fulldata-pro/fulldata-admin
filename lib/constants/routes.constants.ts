/**
 * Application routes constants
 * Use these constants instead of hardcoding paths
 */

export const ROUTES = {
  // Dashboard
  HOME: '/',

  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: (uid: string) => `/accounts/${uid}`,

  // Billing
  BILLING: {
    RECEIPTS: '/billing/receipts',
    RECEIPT_DETAIL: (uid: string) => `/billing/receipts/${uid}`,
    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (uid: string) => `/billing/invoices/${uid}`,
  },

  // Settings
  SETTINGS: '/settings',
} as const
