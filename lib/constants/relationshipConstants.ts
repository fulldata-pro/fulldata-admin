/**
 * Relationship constants and translations
 */

// Relationship mappings based on sex
export const RELATIONSHIP_MAPPINGS: Record<string, { M: string; F: string }> = {
  'PADRE/MADRE': { M: 'Padre', F: 'Madre' },
  'HIJO/HIJA': { M: 'Hijo', F: 'Hija' },
  'HERMANO/A': { M: 'Hermano', F: 'Hermana' },
  'HERMANO/HERMANA': { M: 'Hermano', F: 'Hermana' },
  'ABUELO/ABUELA': { M: 'Abuelo', F: 'Abuela' },
  'NIETO/NIETA': { M: 'Nieto', F: 'Nieta' },
  'TIO/TIA': { M: 'Tio', F: 'Tia' },
  'SOBRINO/SOBRINA': { M: 'Sobrino', F: 'Sobrina' },
  'PRIMO/PRIMA': { M: 'Primo', F: 'Prima' },
  'CUÑADO/CUÑADA': { M: 'Cuñado', F: 'Cuñada' },
  'SUEGRO/SUEGRA': { M: 'Suegro', F: 'Suegra' },
  'YERNO/NUERA': { M: 'Yerno', F: 'Nuera' },
  'ESPOSO/ESPOSA': { M: 'Esposo', F: 'Esposa' },
  'CONYUGE': { M: 'Conyuge', F: 'Conyuge' },
  'PAREJA': { M: 'Pareja', F: 'Pareja' },
  'CONCUBINO/CONCUBINA': { M: 'Concubino', F: 'Concubina' },
}

// Generic relationship translations (fallback)
export const GENERIC_RELATIONSHIP_LABELS: Record<string, string> = {
  'PADRE': 'Padre',
  'MADRE': 'Madre',
  'HIJO': 'Hijo',
  'HIJA': 'Hija',
  'HERMANO': 'Hermano',
  'HERMANA': 'Hermana',
  'ABUELO': 'Abuelo',
  'ABUELA': 'Abuela',
  'NIETO': 'Nieto',
  'NIETA': 'Nieta',
  'TIO': 'Tio',
  'TIA': 'Tia',
  'SOBRINO': 'Sobrino',
  'SOBRINA': 'Sobrina',
  'PRIMO': 'Primo',
  'PRIMA': 'Prima',
  'CUÑADO': 'Cuñado',
  'CUÑADA': 'Cuñada',
  'SUEGRO': 'Suegro',
  'SUEGRA': 'Suegra',
  'YERNO': 'Yerno',
  'NUERA': 'Nuera',
  'ESPOSO': 'Esposo',
  'ESPOSA': 'Esposa',
  'CONYUGE': 'Conyuge',
  'PAREJA': 'Pareja',
  'CONCUBINO': 'Concubino',
  'CONCUBINA': 'Concubina',
}

/**
 * Translates a relationship based on sex
 * @param relation - The relationship string from API (e.g., "PADRE/MADRE")
 * @param sex - The sex of the person ("M" or "F")
 * @returns The appropriate relationship string
 */
export function translateRelationship(relation: string, sex: string): string {
  if (!relation) return 'N/A'

  const relationUpper = relation.toUpperCase()

  // Check if it's a dual relationship (contains "/")
  if (relationUpper.includes('/')) {
    const mapping = RELATIONSHIP_MAPPINGS[relationUpper]
    if (mapping) {
      return mapping[sex as 'M' | 'F'] || relation
    }
  }

  // Check for generic relationship
  const generic = GENERIC_RELATIONSHIP_LABELS[relationUpper]
  if (generic) {
    return generic
  }

  // Return capitalized version as fallback
  return relation.charAt(0).toUpperCase() + relation.slice(1).toLowerCase()
}

/**
 * Gets the appropriate icon and color for a relationship
 */
export function getRelationshipStyle(relation: string, sex: string): {
  icon: 'heart' | 'people'
  colorClasses: string
} {
  const translatedRelation = translateRelationship(relation, sex).toLowerCase()

  // Spouse/partner relationships
  if (
    translatedRelation.includes('conyuge') ||
    translatedRelation.includes('esposo') ||
    translatedRelation.includes('esposa') ||
    translatedRelation.includes('pareja') ||
    translatedRelation.includes('concubino') ||
    translatedRelation.includes('concubina')
  ) {
    return {
      icon: 'heart',
      colorClasses: 'text-pink-600 bg-pink-50 border-pink-200'
    }
  }

  // Children relationships
  if (translatedRelation.includes('hijo') || translatedRelation.includes('hija')) {
    return {
      icon: 'people',
      colorClasses: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  // Parent relationships
  if (translatedRelation.includes('padre') || translatedRelation.includes('madre')) {
    return {
      icon: 'people',
      colorClasses: 'text-green-600 bg-green-50 border-green-200'
    }
  }

  // Sibling relationships
  if (translatedRelation.includes('hermano') || translatedRelation.includes('hermana')) {
    return {
      icon: 'people',
      colorClasses: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  }

  // Extended family
  if (
    translatedRelation.includes('abuelo') ||
    translatedRelation.includes('abuela') ||
    translatedRelation.includes('nieto') ||
    translatedRelation.includes('nieta')
  ) {
    return {
      icon: 'people',
      colorClasses: 'text-amber-600 bg-amber-50 border-amber-200'
    }
  }

  // Default
  return {
    icon: 'people',
    colorClasses: 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * Translates sex codes to readable text
 */
export function translateSex(sex: string): string {
  switch (sex?.toUpperCase()) {
    case 'M':
      return 'Masculino'
    case 'F':
      return 'Femenino'
    default:
      return sex || 'N/A'
  }
}
