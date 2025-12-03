/**
 * Utility functions for handling dates across the application
 */

export interface MongoDate {
  $date: string | number;
}

export interface MongoNumberLong {
  $numberLong: string;
}

/**
 * Converts various date formats (MongoDB, timestamp, Date, ISO 8601) to a JavaScript Date object
 * Supports formats like:
 * - ISO 8601 strings: "2025-11-06T15:06:08.040+00:00"
 * - MongoDB Date format: { $date: "..." }
 * - MongoDB NumberLong: { $numberLong: "..." }
 * - Date objects, timestamps, and standard date strings
 */
export function parseDate(
  date: Date | number | MongoDate | MongoNumberLong | null | undefined | string
): Date | null {
  if (!date) return null;

  // Handle MongoDB Date format { $date: "..." }
  if (typeof date === "object" && "$date" in date) {
    return new Date(date.$date);
  }

  // Handle MongoDB NumberLong format { $numberLong: "..." }
  if (typeof date === "object" && "$numberLong" in date) {
    return new Date(parseInt(date.$numberLong));
  }

  // Handle regular Date object
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle timestamp number
  if (typeof date === "number") {
    return new Date(date);
  }

  // Handle string dates (including ISO 8601 format)
  if (typeof date === "string") {
    try {
      const parsed = new Date(date);
      // Validate the parsed date is valid
      if (isNaN(parsed.getTime())) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  // Fallback for any other type
  try {
    const parsed = new Date(date as any);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Formats a date to Spanish locale string with custom options
 */
export function formatDate(
  date: Date | number | MongoDate | MongoNumberLong | null | undefined | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "No disponible";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return parsedDate.toLocaleDateString("es-ES", options || defaultOptions);
}

/**
 * Formats a timestamp or date to Spanish locale string
 * Accepts timestamp numbers, Date objects, or ISO 8601 strings
 */
export const formatTimestamp = (
  timestamp: number | Date | string | MongoDate | MongoNumberLong | null | undefined
): string => {
  const date = parseDate(timestamp);
  if (!date) return "No disponible";

  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a date with time to Spanish locale string
 */
export function formatDateTime(
  date: Date | number | MongoDate | MongoNumberLong | null | undefined | string
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "No disponible";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return parsedDate.toLocaleDateString("es-ES", options);
}

/**
 * Formats a date with time in numeric format (DD/MM/YYYY HH:mm)
 * Supports ISO 8601 strings like "2025-11-06T15:06:08.040+00:00"
 * Uses Argentina locale by default
 */
export function formatDateTimeNumeric(
  date: Date | number | MongoDate | MongoNumberLong | string | null | undefined,
  locale: string = "es-AR"
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "No disponible";

  return parsedDate.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculates age from a birth date
 * Supports ISO 8601 strings like "2025-11-06T15:06:08.040+00:00"
 */
export function calculateAge(
  birthDate: Date | number | MongoDate | MongoNumberLong | string | null | undefined
): number | null {
  const parsedDate = parseDate(birthDate);
  if (!parsedDate) return null;

  const today = new Date();
  const birth = new Date(parsedDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Formats a birth date with age
 * Supports ISO 8601 strings like "2025-11-06T15:06:08.040+00:00"
 */
export function formatBirthDateWithAge(
  birthDate: Date | number | MongoDate | MongoNumberLong | string | null | undefined,
  providedAge?: number
): string {
  const formattedDate = formatDate(birthDate);
  if (formattedDate === "No disponible") return formattedDate;

  const age = providedAge ?? calculateAge(birthDate);
  if (age === null) return formattedDate;

  return `${formattedDate} (${age} años)`;
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: any): boolean {
  const parsed = parseDate(date);
  return parsed !== null && !isNaN(parsed.getTime());
}

/**
 * Gets relative time from now (e.g., "hace 2 horas", "hace 3 días")
 * Supports ISO 8601 strings like "2025-11-06T15:06:08.040+00:00"
 */
export function getRelativeTime(
  date: Date | number | MongoDate | MongoNumberLong | string | null | undefined
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "No disponible";

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `hace ${diffYears} ${diffYears === 1 ? "año" : "años"}`;
  } else if (diffMonths > 0) {
    return `hace ${diffMonths} ${diffMonths === 1 ? "mes" : "meses"}`;
  } else if (diffDays > 0) {
    return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  } else if (diffHours > 0) {
    return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  } else if (diffMins > 0) {
    return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
  } else {
    return "hace un momento";
  }
}

/**
 * Returns a list of months in Spanish
 */
export function getMonthsList(): string[] {
  return [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
}
