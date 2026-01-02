# Claude Code Project Guidelines

## Repository Pattern

**REGLA OBLIGATORIA**: Siempre usar el patrón Repository para acceso a datos.

### Reglas:
1. **Nunca importar modelos directamente en endpoints/servicios** - Usar siempre los repositorios
2. **Al crear un nuevo schema, crear también su repositorio** correspondiente en `lib/db/repositories/`
3. Los repositorios deben extender `BaseRepository` de `lib/db/repositories/base.repository.ts`
4. Exportar el repositorio en `lib/db/repositories/index.ts`

### Estructura:
```
lib/db/
├── models/
│   └── Account.ts          # Schema/Model de Mongoose
├── repositories/
│   ├── base.repository.ts  # Clase base con métodos CRUD
│   ├── account.repository.ts
│   ├── user.repository.ts
│   └── index.ts            # Exportaciones
└── types/
    └── model.types.ts      # Tipos compartidos
```

### Ejemplo de uso:
```typescript
// ❌ MAL - No hacer esto
import Account from '@/lib/db/models/Account'
const accounts = await Account.find()

// ✅ BIEN - Usar repositorio
import { accountRepository } from '@/lib/db/repositories'
const accounts = await accountRepository.list({ page: 1, limit: 10 })
```

---

## API Security - Respuestas Mínimas

**REGLA DE SEGURIDAD**: Devolver solo los datos que el frontend necesita.

### Principios:
1. **No exponer datos sensibles** - Nunca devolver passwords, tokens, apiKeys, etc.
2. **Usar select() en queries** - Limitar campos devueltos
3. **No devolver datos internos** - Como `__v`, `deletedBy`, timestamps internos
4. **Evitar sobre-información** - Un atacante no debe obtener estructura de datos completa

### Ejemplo:
```typescript
// ❌ MAL - Devuelve todo
const user = await userRepository.findById(id)
return NextResponse.json({ user })

// ✅ BIEN - Solo campos necesarios
const user = await userRepository.findById(id, {
  select: 'uid firstName lastName email avatar'
})
return NextResponse.json({ user })
```

---

## Proyecto de Referencia

El proyecto **site-v2** (`/Users/maxi/Documents/Working/Fulldata/Front/site-v2`) es la fuente de verdad para:
- Schemas de MongoDB (Account, User, etc.)
- Componentes UI (Select, Checkbox, DataTable, etc.)
- Estilos y patrones de diseño

Antes de crear un componente nuevo, verificar si existe en site-v2 para mantener consistencia.

---

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

---

## Number Formatting

**IMPORTANTE**: Para todo formateo de números en este proyecto, usar **siempre** las funciones del archivo `lib/utils/currencyUtils.ts`.

En Argentina el separador de miles es `.` y el de decimales es `,`. Estas funciones ya manejan esto correctamente.

### Funciones disponibles:

- `formatNumber()` - Formatea números con separadores de miles (locale es-AR por defecto)
- `formatCurrency()` - Formatea montos como moneda con símbolo y código

### Ejemplo de uso:

```typescript
import { formatNumber, formatCurrency } from '@/lib/utils/currencyUtils';

// Formatear números
formatNumber(1500)        // "1.500"
formatNumber(1500000)     // "1.500.000"

// Formatear moneda
formatCurrency(1500.50, 'ARS')  // "$1.500,50 ARS"
formatCurrency(1500.50, 'USD')  // "$1,500.50 USD"
```

### Reglas:
1. **NUNCA usar `.toLocaleString()` directamente** - Usar siempre `formatNumber()` o `formatCurrency()`
2. **NUNCA usar template literals para formatear números** - Ej: `` `${number.toLocaleString()}` ``
3. Para tokens, balances, cantidades, etc. usar `formatNumber()`
4. Para precios y montos monetarios usar `formatCurrency()`

**NO crear nuevas funciones de formateo de números. Usar siempre currencyUtils.ts.**

---

## Routes

**IMPORTANTE**: Para todas las rutas de navegación, usar **siempre** las constantes definidas en `lib/constants/routes.constants.ts`.

### Ejemplo de uso:

```typescript
import { ROUTES } from '@/lib/constants';

// ❌ MAL - Rutas hardcodeadas
<Link href="/accounts">Cuentas</Link>
<Link href={`/accounts/${uid}`}>Ver cuenta</Link>
router.push('/billing/receipts')

// ✅ BIEN - Usar constantes
<Link href={ROUTES.ACCOUNTS}>Cuentas</Link>
<Link href={ROUTES.ACCOUNT_DETAIL(uid)}>Ver cuenta</Link>
router.push(ROUTES.BILLING.RECEIPTS)
```

### Reglas:
1. **NUNCA hardcodear rutas** - Usar siempre las constantes de `ROUTES`
2. **Al crear una nueva página, agregar su ruta** a `routes.constants.ts`
3. Las rutas dinámicas se definen como funciones: `ACCOUNT_DETAIL: (uid: string) => \`/accounts/${uid}\``

**NO hardcodear paths. Usar siempre ROUTES.**
