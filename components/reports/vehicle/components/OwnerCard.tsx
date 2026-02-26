'use client'

import React from 'react'
import InfoCard from './InfoCard'
import DataField from './DataField'

interface PhoneData {
  phoneNumber: string
  operator?: string
  location?: string
  wsp?: boolean
}

interface OwnerData {
  type: 'PERSON' | 'COMPANY'
  taxId: number | string
  firstName?: string
  lastName?: string
  rz?: string
  percentage?: number
  nationalId?: string
  birthDate?: number
  sex?: string
  nationality?: string
  constitutionDate?: number
  employees?: number
  address?: string
  city?: string
  province?: string
  cp?: string
  phones?: PhoneData[]
  emails?: string[]
}

interface OwnerCardProps {
  owner: OwnerData
  index: number
  isHistorical?: boolean
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPhoneNumber = (phone: string): string => {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  }
  if (phone.length === 11 && phone.startsWith('0')) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)}-${phone.slice(7)}`
  }
  return phone
}

export default function OwnerCard({ owner, index, isHistorical = false }: OwnerCardProps) {
  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl border hover:shadow-xl shadow-lg shadow-slate-900/5 transition-all duration-300 overflow-hidden ${
      isHistorical
        ? 'border-amber-200/60 hover:border-amber-300/80'
        : 'border-slate-200/40 hover:border-slate-300/60'
    }`}>
      {/* Owner Header */}
      <div className={`p-6 border-b border-slate-100/50 ${
        isHistorical
          ? 'bg-gradient-to-r from-amber-50/50 via-amber-50/30 to-orange-50/20'
          : 'bg-gradient-to-r from-slate-50/50 via-white/90 to-gray-50/40'
      }`}>
        {isHistorical && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200/50">
              <i className="ki-duotone ki-time text-sm">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              Propietario Anterior
            </span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-sm ${
            owner.type === 'PERSON'
              ? 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400/20'
              : 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400/20'
          }`}>
            <i className={`ki-duotone text-xl text-white ${owner.type === 'PERSON' ? 'ki-profile-user' : 'ki-office-bag'}`}>
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
            </i>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800">
              {owner.type === 'PERSON'
                ? `${owner.firstName} ${owner.lastName}`
                : owner.rz
              }
            </h3>
            <p className="text-sm text-slate-600">
              {owner.percentage}% de participacion - {owner.type === 'PERSON' ? 'Persona Fisica' : 'Persona Juridica'}
            </p>
          </div>
        </div>
      </div>

      {/* Owner Details */}
      <div className="p-5 space-y-4">
        {/* Personal/Company Information */}
        <InfoCard
          title={owner.type === 'PERSON' ? "Informacion Personal" : "Informacion de la Empresa"}
          headerColor="slate"
          icon={owner.type === 'PERSON'
            ? <i className="ki-duotone ki-profile-circle text-lg text-gray-600"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
            : <i className="ki-duotone ki-office-bag text-lg text-gray-600"><span className="path1"></span><span className="path2"></span></i>
          }
        >
          <div className="space-y-2">
            {owner.type === 'PERSON' ? (
              <>
                <DataField label="DNI" value={owner.nationalId} icon="🆔" />
                <DataField label="CUIL/CUIT" value={owner.taxId} icon="📋" />
                <DataField label="Fecha de Nacimiento" value={owner.birthDate ? formatTimestamp(owner.birthDate) : null} icon="🎂" />
                <DataField label="Sexo" value={owner.sex === 'M' ? 'Masculino' : owner.sex === 'F' ? 'Femenino' : owner.sex} icon="👤" />
                <DataField label="Nacionalidad" value={owner.nationality} icon="🌍" />
              </>
            ) : (
              <>
                <DataField label="Razon Social" value={owner.rz} icon="🏢" />
                <DataField label="CUIT" value={owner.taxId} icon="📋" />
                <DataField label="Fecha de Constitucion" value={owner.constitutionDate ? formatTimestamp(owner.constitutionDate) : null} icon="📅" />
                <DataField label="Empleados" value={owner.employees} icon="👥" />
              </>
            )}
          </div>
        </InfoCard>

        {/* Address Information */}
        <InfoCard
          title="Domicilio"
          headerColor="slate"
          icon={<i className="ki-duotone ki-geolocation text-lg text-gray-600"><span className="path1"></span><span className="path2"></span></i>}
        >
          <div className="space-y-2">
            <DataField label="Direccion" value={owner.address} icon="📍" />
            <DataField label="Ciudad" value={owner.city} icon="🏙️" />
            <DataField label="Provincia" value={owner.province} icon="🗺️" />
            <DataField label="Codigo Postal" value={owner.cp} icon="📮" />
          </div>
        </InfoCard>

        {/* Contact Information */}
        {(owner.phones && owner.phones.length > 0 || owner.emails && owner.emails.length > 0) && (
          <InfoCard
            title="Informacion de Contacto"
            headerColor="slate"
            icon={<i className="ki-duotone ki-notification-bing text-lg text-gray-600"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>}
          >
            <div className="space-y-3">
              {/* Phones */}
              {owner.phones && owner.phones.length > 0 && (
                <div className="space-y-2">
                  <div className="mb-4">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Telefonos
                    </h3>
                    <div className="h-0.5 bg-gradient-to-r from-gray-500 via-gray-400 to-transparent w-16"></div>
                  </div>
                  {owner.phones.map((phone: PhoneData, phoneIndex: number) => (
                    <div key={phoneIndex} className="bg-gradient-to-r from-zinc-50/50 to-slate-50/40 border border-slate-200/30 rounded-xl p-4 space-y-2 hover:from-zinc-50/70 hover:to-slate-50/60 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">
                          {formatPhoneNumber(phone.phoneNumber)}
                        </span>
                        {phone.wsp && (
                          <a
                            href={`https://wa.me/${phone.phoneNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gradient-to-r from-green-100/80 to-green-100/80 text-green-600 px-2.5 py-1 rounded-full font-medium border border-emerald-200/50 hover:bg-green-200/80 transition-colors"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {phone.operator && <div>📞 {phone.operator}</div>}
                        {phone.location && <div>📍 {phone.location}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Emails */}
              {owner.emails && owner.emails.length > 0 && (
                <div className="space-y-2">
                  <div className="mb-4">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Correos Electronicos
                    </h3>
                    <div className="h-0.5 bg-gradient-to-r from-gray-500 via-gray-400 to-transparent w-16"></div>
                  </div>
                  {owner.emails.map((email: string, emailIndex: number) => (
                    <div key={emailIndex} className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-zinc-50/50 to-slate-50/40 border border-slate-200/30 rounded-xl hover:from-zinc-50/70 hover:to-slate-50/60 transition-all duration-200">
                      <span className="text-sm opacity-70">📧</span>
                      <span className="text-sm text-slate-800 font-medium">{email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoCard>
        )}
      </div>
    </div>
  )
}
