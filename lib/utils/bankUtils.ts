/**
 * Bank utilities for image matching and formatting
 */

/**
 * Bank mapping data for image matching
 */
const banksWithImage = [
  { name: "american express", image: "american-express.png" },
  { name: "bbva", image: "bbva.png" },
  { name: "bind", image: "bind.png" },
  { name: "banco de la nacion", image: "bna.png" },
  { name: "banco nacion", image: "bna.png" },
  { name: "bna", image: "bna.png" },
  { name: "citibank", image: "citibank.png" },
  { name: "banco ciudad", image: "ciudad.png" },
  { name: "banco de la ciudad", image: "ciudad.png" },
  { name: "comafi", image: "comafi.png" },
  { name: "banco de cordoba", image: "cordoba.png" },
  { name: "banco cordoba", image: "cordoba.png" },
  { name: "credicoop", image: "credicoop.png" },
  { name: "banco galicia", image: "galicia.png" },
  { name: "galicia", image: "galicia.png" },
  { name: "banco hipotecario", image: "hipotecario.png" },
  { name: "hipotecario", image: "hipotecario.png" },
  { name: "banco macro", image: "macro.png" },
  { name: "macro", image: "macro.png" },
  { name: "mercado pago", image: "mercado-libre.png" },
  { name: "mercado libre", image: "mercado-libre.png" },
  { name: "naranja x", image: "naranjax.png" },
  { name: "naranjax", image: "naranjax.png" },
  { name: "naranja", image: "naranjax.png" },
  { name: "banco patagonia", image: "patagonia.png" },
  { name: "patagonia", image: "patagonia.png" },
  { name: "banco provincia", image: "provincia.png" },
  { name: "banco de la provincia", image: "provincia.png" },
  { name: "provincia", image: "provincia.png" },
  { name: "mercadolibre", image: "mercadolibre.png" },
  { name: "santander", image: "santander.png" },
  { name: "banco santander", image: "santander.png" },
  { name: "supervielle", image: "supervielle.png" },
  { name: "banco supervielle", image: "supervielle.png" },
]

/**
 * Get bank image path based on bank name
 * @param bank - Bank name to search for
 * @returns Image path or null if not found
 */
export const getBankImage = (bank: string): string | null => {
  if (!bank) return null

  const bankFound = banksWithImage.find((b) =>
    bank.toLowerCase().trim().includes(b.name)
  )

  if (bankFound) return `/images/brands/banks/${bankFound.image}`

  return null
}

/**
 * Translate bank type codes to Spanish
 */
export const translateBankType = (type: string): string => {
  const translations: Record<string, string> = {
    'BANKING_ENTITY': 'Entidad Bancaria',
    'FINANCIAL': 'Entidad Financiera',
    'UNKNOWN': 'Tipo Desconocido'
  }
  return translations[type] || type
}

/**
 * Get situation color classes based on situation code
 */
export const getSituationColor = (situation: string): string => {
  const code = parseInt(situation)
  if (code === 1) return 'text-green-600 bg-green-50'
  if (code <= 3) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

/**
 * Get situation label from code
 */
export const getSituationLabel = (situation: string): string => {
  const normalizedSituation = situation.padStart(2, '0')
  const situations: Record<string, string> = {
    '00': 'Sin informacion',
    '01': '1 - Normal',
    '02': '2 - Riesgo potencial',
    '03': '3 - Deficiente',
    '04': '4 - Alto riesgo',
    '05': '5 - Irrecuperable',
    '06': '6 - Irrecuperable tecnico'
  }
  return situations[normalizedSituation] || situations[situation] || 'N/A'
}

/**
 * Utility function for merging class names
 */
export function classNames(...args: Array<string | undefined | boolean | object>): string {
  if (!args || args.length === 0) return ""
  return args
    .map((arg) => {
      if (typeof arg === "undefined" || arg === null) return null
      if (typeof arg === "boolean") return null
      if (typeof arg === "string") return arg
      if (Array.isArray(arg)) return classNames(...arg)
      return Object.entries(arg || {})
        .map(([key, value]) => (value ? key : null))
        .filter(Boolean)
        .join(" ")
    })
    .filter(Boolean)
    .join(" ")
}

/**
 * Get car logo URL based on brand name
 * @param brand - Car brand name
 * @returns Image path or null if not found
 */
export const getCarLogoUrl = (brand: string): string | null => {
  if (!brand) return null
  const path = "/images/brands/cars/" + brand.toLowerCase().replaceAll(" ", "").replaceAll("-", "") + ".png"
  return path
}
