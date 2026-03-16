'use client'

import React from 'react'
import { ReportResponse, PeopleData } from '@/lib/types/report.types'
import PeopleSummary from './sections/PeopleSummary'
import BondsSection from './sections/BondsSection'
import CorporateRelationsSection from './sections/CorporateRelations'
import FinancialSection from './sections/FinancialSection'
import LaborSection from './sections/LaborSection'
import TaxSection from './sections/TaxSection'
import PersonalPropertySection from './sections/PersonalPropertySection'
import OfficialBulletinSection from './sections/OfficialBulletinSection'
import AdditionalDataSection from './sections/AdditionalDataSection'
import AddressSection from '@/components/reports/shared/AddressSection'

interface PeopleReportViewProps {
  reportData: ReportResponse
  peopleData: PeopleData
  activeSection: string
  onSectionChange?: (section: string) => void
}

export default function PeopleReportView({
  reportData,
  peopleData,
  activeSection,
  onSectionChange,
}: PeopleReportViewProps) {
  if (!peopleData) return null

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <section id="resumen" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-medium text-gray-900 mb-3">Resumen</h2>
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-32 rounded-full"></div>
        </div>
        <div className="p-8">
          <PeopleSummary
            summary={peopleData.summary}
            scoreHistory={peopleData.summary?.score || []}
          />
        </div>
      </section>

      {/* Addresses Section */}
      {peopleData.addressData && peopleData.addressData.length > 0 && (() => {
        // Group addresses by type
        const allAddresses = peopleData.addressData.map((addr: any) => ({
          address: addr.street,
          addressNumber: addr.number,
          floor: addr.floor,
          appartment: addr.apartment,
          city: addr.city,
          province: addr.province,
          postalCode: addr.postalCode,
          country: addr.country,
          type: addr.type
        }))

        const mainAddresses = allAddresses.filter((addr: any) =>
          addr.type && addr.type.toUpperCase() === 'MAIN'
        )
        const fiscalAddresses = allAddresses.filter((addr: any) =>
          addr.type && ['LEGAL', 'TAX'].includes(addr.type.toUpperCase())
        )
        const otherAddresses = allAddresses.filter((addr: any) =>
          !addr.type || !['MAIN', 'LEGAL', 'TAX'].includes(addr.type.toUpperCase())
        )

        return (
          <section id="direcciones" className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-medium text-gray-900 mb-3">Direcciones</h2>
              <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 w-32 rounded-full"></div>
            </div>
            <div className="p-8 space-y-10">
              {/* Domicilio Principal */}
              <AddressSection
                addresses={mainAddresses}
                title="Domicilio Principal"
                showTitle={true}
                colorScheme="emerald"
              />

              {/* Domicilios Fiscales */}
              <AddressSection
                addresses={fiscalAddresses}
                title="Domicilios Fiscales"
                showTitle={true}
                colorScheme="blue"
              />

              {/* Otros Domicilios */}
              {otherAddresses.length > 0 && (
                <AddressSection
                  addresses={otherAddresses}
                  title="Otros Domicilios"
                  showTitle={true}
                  colorScheme="orange"
                />
              )}
            </div>
          </section>
        )
      })()}

      {/* Contact Section */}
      {peopleData.contactData && (peopleData.contactData.emails?.length > 0 || peopleData.contactData.phones?.length > 0) && (
        <section id="contacto" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Informacion de Contacto</h2>
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8 space-y-10">
            {/* Phones */}
            {peopleData.contactData.phones && peopleData.contactData.phones.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-medium text-gray-900">Telefonos</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                    {peopleData.contactData.phones.length}
                  </span>
                </div>
                <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16 mb-4"></div>
                <div className="divide-y divide-gray-100">
                  {peopleData.contactData.phones.map((phone: any, index: number) => {
                    const areaCode = typeof phone === 'string' ? '' : (phone.areaCode || phone.code || '')
                    const phoneNumber = typeof phone === 'string' ? phone : (phone.phoneNumber || phone.phone || phone.number || '')

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 py-4 first:pt-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <i className="ki-duotone ki-phone text-lg text-purple-600">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 font-mono">
                            {areaCode && <span className="mr-2">{areaCode}</span>}
                            {phoneNumber}
                          </span>
                          {phone.operator && (
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{phone.operator}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {phone.wsp && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-green-300 text-green-600 rounded-full text-xs font-medium">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </span>
                          )}
                          <a
                            href={`tel:${areaCode}${phoneNumber}`}
                            className="text-gray-400 hover:text-white hover:bg-green-500 transition-all p-2 rounded-lg bg-white/30 backdrop-blur-sm border border-gray-200/30 hover:shadow-sm"
                            title="Llamar"
                          >
                            <i className="ki-duotone ki-phone text-base">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Emails */}
            {peopleData.contactData.emails && peopleData.contactData.emails.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-medium text-gray-900">Emails</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                    {peopleData.contactData.emails.length}
                  </span>
                </div>
                <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent w-16 mb-4"></div>
                <div className="divide-y divide-gray-100">
                  {peopleData.contactData.emails.map((email: any, index: number) => {
                    const emailAddress = typeof email === 'string' ? email : (email.email || email.address || '')

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 py-4 first:pt-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <i className="ki-duotone ki-sms text-lg text-orange-600">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-gray-900 break-all">
                            {emailAddress}
                          </span>
                        </div>
                        <a
                          href={`mailto:${emailAddress}`}
                          className="text-gray-400 hover:text-white hover:bg-orange-500 transition-all p-2 rounded-lg bg-white/30 backdrop-blur-sm border border-gray-200/30 hover:shadow-sm"
                          title="Enviar email"
                        >
                          <i className="ki-duotone ki-sms text-base">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Labor Section */}
      {peopleData.laborData && (
        <section id="laborales" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Datos Laborales</h2>
            <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8">
            <LaborSection laborData={peopleData.laborData} />
          </div>
        </section>
      )}

      {/* Tax Section */}
      {peopleData.taxData && (
        <section id="impositiva" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Informacion Impositiva</h2>
            <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8">
            <TaxSection taxData={peopleData.taxData} />
          </div>
        </section>
      )}

      {/* Financial Section */}
      {peopleData.financialSituation && (
        <section id="financiera" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Situacion Financiera</h2>
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8">
            <FinancialSection financialData={peopleData.financialSituation} />
          </div>
        </section>
      )}

      {/* Bonds Section */}
      {(peopleData.bonds && (peopleData.bonds.main?.length > 0 || peopleData.bonds.others?.length > 0)) ||
       (peopleData.corporateRelations && peopleData.corporateRelations.length > 0) ? (
        <section id="vinculos" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Vinculos</h2>
            <div className="h-1 bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8 space-y-12">
            {peopleData.bonds && (peopleData.bonds.main?.length > 0 || peopleData.bonds.others?.length > 0) && (
              <BondsSection bondsData={peopleData.bonds} />
            )}
            {peopleData.corporateRelations && peopleData.corporateRelations.length > 0 && (
              <CorporateRelationsSection corporateRelations={peopleData.corporateRelations} />
            )}
          </div>
        </section>
      ) : null}

      {/* Personal Property Section */}
      {peopleData.personalProperty && (
        peopleData.personalProperty.cars?.length > 0 ||
        peopleData.personalProperty.carsEmbargoes?.length > 0 ||
        peopleData.personalProperty.buildings?.length > 0 ||
        peopleData.personalProperty.registeredTrademarks?.length > 0 ||
        peopleData.personalProperty.registeredTrademarksCount
      ) && (
        <section id="bienes" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Bienes Personales</h2>
            <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8">
            <PersonalPropertySection propertyData={peopleData.personalProperty} />
          </div>
        </section>
      )}

      {/* Official Bulletin Section */}
      {peopleData.officialBulletin && (
        peopleData.officialBulletin.publications?.length > 0 ||
        peopleData.officialBulletin.embargoes?.length > 0 ||
        peopleData.officialBulletin.corporateParticipation?.length > 0 ||
        peopleData.officialBulletin.trialsAsPlaintiff?.length > 0 ||
        peopleData.officialBulletin.trialsAsDefendant?.length > 0
      ) && (
        <section id="boletin" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Boletin Oficial</h2>
            <div className="h-1 bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8">
            <OfficialBulletinSection bulletinData={peopleData.officialBulletin} />
          </div>
        </section>
      )}

      {/* Additional Data Section */}
      {(peopleData.nicDomains?.length > 0 ||
        peopleData.isDuplicated !== undefined ||
        peopleData.duplicatedList?.length > 0 ||
        peopleData.isBanked !== undefined ||
        peopleData.reportingEntity) && (
        <section id="adicional" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Datos Adicionales</h2>
            <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 w-32 rounded-full"></div>
          </div>
          <div className="p-8">
            <AdditionalDataSection
              nicDomains={peopleData.nicDomains}
              isDuplicated={peopleData.isDuplicated}
              duplicatedList={peopleData.duplicatedList}
              isBanked={peopleData.isBanked}
              reportingEntity={peopleData.reportingEntity}
            />
          </div>
        </section>
      )}

    </div>
  )
}
