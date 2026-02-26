/**
 * Labor-related constants and translations
 */

// Spanish translations for labor situations
export const LABOR_SITUATION_LABELS: Record<string, string> = {
  MONOTRIBUTE: "Monotributista",
  AUTONOMOUS: "Autónomo",
  EMPLOYED: "Relación de dependencia",
  EMPLOYEE: "Empleado",
  EMPLOYER: "Empleador",
  RETIRED: "Jubilado",
  UNEMPLOYED: "Desempleado",
  INFORMAL: "Informal",
  DOMESTIC_WORKER: "Empleado doméstico",
  SOCIAL_MONOTRIBUTE: "Monotributo social",
  INDEPENDENT: "Independiente",
  UNKNOWN: "Desconocido",
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  P: "Principal",
  S: "Secundaria",
  T: "Terciaria",
}

// Helper function to translate labor situation
export function translateLaborSituation(situation: string): string {
  return LABOR_SITUATION_LABELS[situation] || situation
}

// Helper function to translate activity type
export function translateActivityType(type: string): string {
  return ACTIVITY_TYPE_LABELS[type] || type
}

// Salary range data for tooltips
export const SALARY_RANGES = [
  { name: "A1", from: 1, to: 500000, average: 250000, equalsTo: "S/Cat" },
  { name: "A2", from: 500001, to: 800000, average: 650000, equalsTo: "A" },
  { name: "A3", from: 800001, to: 1400000, average: 1100000, equalsTo: "B - C" },
  { name: "A4", from: 1400001, to: 2200000, average: 1800000, equalsTo: "D" },
  { name: "A5", from: 2200001, to: 3500000, average: 2850000, equalsTo: "E" },
  { name: "A6", from: 3500001, to: 5500000, average: 4500000, equalsTo: "F" },
  { name: "A7", from: 5500001, to: 8500000, average: 7000000, equalsTo: "G" },
  { name: "A8", from: 8500001, to: null, average: null, equalsTo: "RI" },
]

// Helper to get salary range info
export function getSalaryRangeInfo(category: string) {
  return SALARY_RANGES.find(r => r.name === category)
}

// Helper to calculate months between dates
export function getMonthsBetweenDates(startDate: number, endDate: number): number {
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    return 0
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0
  }

  if (end.getTime() < start.getTime()) {
    return 0
  }

  let months = (end.getFullYear() - start.getFullYear()) * 12 +
               (end.getMonth() - start.getMonth())

  if (end.getDate() >= start.getDate()) {
    months += 1
  }

  return months
}

// Helper to format duration label
export function formatDurationLabel(months: number): string {
  if (months === 0) return "0 meses"
  if (months < 1) return "< 1 mes"

  if (months < 12) {
    return `${months} mes${months > 1 ? "es" : ""}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  let result = `${years} año${years > 1 ? "s" : ""}`

  if (remainingMonths > 0) {
    result += ` y ${remainingMonths} mes${remainingMonths > 1 ? "es" : ""}`
  }

  return result
}

// Helper to generate theme colors for charts
export function generateThemeColors(count: number): string[] {
  const colors = [
    "#eb4d63", "#3a4a66", "#f78a9b", "#4a5a77", "#ee5a74",
    "#6b7b98", "#f2a1b3", "#8a9ab7", "#f5b8c7", "#a9b9d6",
    "#e8708a", "#2a3a57", "#d9889e", "#5a6a87", "#ff9aaa",
  ]

  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

// Helper to calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
