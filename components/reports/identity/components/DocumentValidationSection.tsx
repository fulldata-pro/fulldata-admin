'use client'

import React from 'react'
import { DiditIDVerification } from '@/lib/types/report.types'
import StatusChip from './StatusChip'

interface DocumentValidationSectionProps {
  id_verification: DiditIDVerification | null
}

function formatDate(dateString: string, locale: string = 'es-ES') {
  const [year, month, day] = dateString.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export default function DocumentValidationSection({ id_verification }: DocumentValidationSectionProps) {
  if (!id_verification) return null

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <StatusChip status={id_verification.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Informacion Personal
            </h3>
            <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Nombre:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.first_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Apellido:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.last_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Tipo de Documento:</span>
              <span className="text-sm text-gray-900 font-medium">
                {id_verification.document_type === 'Identity Card'
                  ? 'Cedula de Identidad'
                  : id_verification.document_type === 'Passport'
                    ? 'Pasaporte'
                    : id_verification.document_type === 'Driver License'
                      ? 'Licencia de Conducir'
                      : id_verification.document_type}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Pais Emisor:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.issuing_state_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Numero de Documento:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.document_number}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Numero de Tramite:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.personal_number}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Fecha de Nacimiento:</span>
              <span className="text-sm text-gray-900 font-medium">{formatDate(id_verification.date_of_birth)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Expiracion:</span>
              <span className="text-sm text-gray-900 font-medium">{formatDate(id_verification.expiration_date)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Genero:</span>
              <span className="text-sm text-gray-900 font-medium">
                {id_verification.gender === 'M'
                  ? 'Masculino'
                  : id_verification.gender === 'F'
                    ? 'Femenino'
                    : id_verification.gender === 'Male'
                      ? 'Masculino'
                      : id_verification.gender === 'Female'
                        ? 'Femenino'
                        : id_verification.gender}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Estado Civil:</span>
              <span className="text-sm text-gray-900 font-medium">
                {id_verification.marital_status === 'SINGLE'
                  ? 'Soltero/a'
                  : id_verification.marital_status === 'MARRIED'
                    ? 'Casado/a'
                    : id_verification.marital_status === 'DIVORCED'
                      ? 'Divorciado/a'
                      : id_verification.marital_status === 'WIDOWED'
                        ? 'Viudo/a'
                        : id_verification.marital_status === 'UNKNOWN'
                          ? 'Desconocido'
                          : id_verification.marital_status}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Nacionalidad:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.nationality}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Lugar de Nacimiento:</span>
              <span className="text-sm text-gray-900 font-medium">{id_verification.place_of_birth}</span>
            </div>
          </div>

          {/* Address Information */}
          {id_verification.formatted_address && (
            <div className="mt-6">
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Direccion
                </h3>
                <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent w-16"></div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                  {id_verification.formatted_address}
                </div>
                {id_verification.parsed_address?.postal_code && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Codigo Postal:</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {id_verification.parsed_address.postal_code}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Document Images */}
        <div className="space-y-6">
          {/* Front Image */}
          <div className="space-y-3">
            <div className="mb-3">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Frontal del Documento
              </h3>
              <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
            </div>
            <div className="relative group max-w-full aspect-video flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {id_verification.full_front_image ? (
                <img
                  src={id_verification.full_front_image}
                  alt="Imagen de la parte frontal del documento"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500 text-sm">Imagen no disponible</span>
              )}
            </div>
          </div>

          {/* Back Image */}
          <div className="space-y-3">
            <div className="mb-3">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Reverso del Documento
              </h3>
              <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent w-16"></div>
            </div>
            <div className="relative group max-w-full aspect-video flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {id_verification.full_back_image ? (
                <img
                  src={id_verification.full_back_image}
                  alt="Imagen de la parte trasera del documento"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500 text-sm">Imagen no disponible</span>
              )}
            </div>
          </div>

          {/* Portrait Image */}
          {id_verification.portrait_image && (
            <div className="space-y-3">
              <div className="mb-3">
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Foto del Documento
                </h3>
                <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-16"></div>
              </div>
              <div className="relative group max-w-[200px] aspect-square flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 mx-auto">
                <img
                  src={id_verification.portrait_image}
                  alt="Foto del documento"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
