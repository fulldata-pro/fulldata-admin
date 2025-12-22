/**
 * Currency formatting utilities
 * Uses Intl.NumberFormat for locale-aware formatting
 */

type CurrencyCode = 'USD' | 'ARS' | 'EUR' | 'BRL' | string

interface FormatCurrencyOptions {
  showCurrencyCode?: boolean
  locale?: string
}

// Map currency codes to their typical locales
const currencyLocales: Record<string, string> = {
  ARS: 'es-AR',
  USD: 'en-US',
  EUR: 'es-ES',
  BRL: 'pt-BR',
}

/**
 * Format a number as currency with locale-aware formatting
 *
 * @example
 * formatCurrency(1500.50, 'ARS') // "$1.500,50 ARS" (Argentine format)
 * formatCurrency(1500.50, 'USD') // "$1,500.50 USD" (US format)
 * formatCurrency(1500.50, 'USD', { showCurrencyCode: false }) // "$1,500.50"
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options: FormatCurrencyOptions = {}
): string {
  const { showCurrencyCode = true, locale } = options

  // Get locale based on currency or use provided locale
  const resolvedLocale = locale || currencyLocales[currency] || 'en-US'

  const formatter = new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatted = formatter.format(amount)

  // Optionally append currency code (some prefer "$1,500.50 USD" over just "$1,500.50")
  if (showCurrencyCode) {
    // Remove the currency symbol that Intl adds and use our format
    const numberOnly = new Intl.NumberFormat(resolvedLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return `$${numberOnly} ${currency}`
  }

  return formatted
}

/**
 * Format a number with locale-aware thousand separators (no currency symbol)
 *
 * @example
 * formatNumber(1500, 'es-AR') // "1.500"
 * formatNumber(1500, 'en-US') // "1,500"
 */
export function formatNumber(amount: number, locale: string = 'es-AR'): string {
  return new Intl.NumberFormat(locale).format(amount)
}
