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
  ACCOUNT_EDIT: (uid: string) => `/accounts/${uid}/edit`,

  // Users
  USERS: '/users',
  USER_DETAIL: (uid: string) => `/users/${uid}`,
  USER_EDIT: (uid: string) => `/users/${uid}/edit`,

  // Billing
  BILLING: {
    RECEIPTS: '/billing/receipts',
    RECEIPT_DETAIL: (uid: string) => `/billing/receipts/${uid}`,
    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (uid: string) => `/billing/invoices/${uid}`,
  },

  // Reports
  REPORTS: '/reports',
  REPORT_DETAIL: (uid: string) => `/reports/${uid}`,

  // Settings
  SETTINGS: '/settings',
} as const
