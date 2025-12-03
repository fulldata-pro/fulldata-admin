# Claude Code Project Guidelines

## Date Formatting

**IMPORTANTE**: Para todo formateo de fechas en este proyecto, usar **siempre** las funciones del archivo `lib/utils/dateUtils.ts`.

### Funciones disponibles:

- `parseDate()` - Convierte varios formatos de fecha a Date de JavaScript
- `formatDate()` - Formato: "6 nov 2025"
- `formatTimestamp()` - Formato: "6 de noviembre de 2025"
- `formatDateTime()` - Formato: "6 nov 2025, 15:06"
- `formatDateTimeNumeric()` - Formato: "06/11/2025, 15:06"
- `calculateAge()` - Calcula edad desde fecha de nacimiento
- `formatBirthDateWithAge()` - Formato: "6 nov 2025 (25 años)"
- `getRelativeTime()` - Formato: "hace 2 horas", "hace 3 días"
- `isValidDate()` - Verifica si una fecha es válida
- `getMonthsList()` - Lista de meses en español

### Ejemplo de uso:

```typescript
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils/dateUtils';

// En componentes
<span>{formatDate(user.createdAt)}</span>
<span>{formatDateTime(invoice.date)}</span>
<span>{getRelativeTime(notification.timestamp)}</span>
```

### Soporta los siguientes formatos de entrada:

- ISO 8601 strings: `"2025-11-06T15:06:08.040+00:00"`
- MongoDB Date: `{ $date: "..." }`
- MongoDB NumberLong: `{ $numberLong: "..." }`
- Date objects
- Timestamps (números)
- Strings de fecha estándar

**NO crear nuevas funciones de formateo de fechas. Usar siempre dateUtils.ts.**
