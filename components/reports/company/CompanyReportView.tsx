'use client'

import React from 'react'
import { ReportResponse, CompaniesData, CompaniesDataTypes } from '@/lib/types/report.types'
import CompanySummary from './sections/CompanySummary'
import CompanyAddressSection from './sections/CompanyAddressSection'
import CompanyContactSection from './sections/CompanyContactSection'
import CompanyTaxSection from './sections/CompanyTaxSection'
import CompanyFinancialSection from './sections/CompanyFinancialSection'
import CompanyAssetsSection from './sections/CompanyAssetsSection'
import CompanyCorporateRelationsSection from './sections/CompanyCorporateRelationsSection'

interface CompanyReportViewProps {
  reportData: ReportResponse
  companyData: CompaniesData
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function CompanyReportView({
  reportData,
  companyData,
  activeSection,
  onSectionChange,
}: CompanyReportViewProps) {
  if (!companyData) return null

  return (
    <div className="space-y-6">
      {/* Resumen Section */}
      <section id="resumen" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Resumen</h2>
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-24 rounded-full"></div>
        </div>
        <div className="p-6">
          <CompanySummary
            summary={companyData[CompaniesDataTypes.summary]}
            scoreHistory={companyData[CompaniesDataTypes.summary]?.score || []}
          />
        </div>
      </section>

      {/* Direcciones Section */}
      <section id="direcciones" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Direcciones</h2>
          <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 w-24 rounded-full"></div>
        </div>
        <div className="p-6">
          <CompanyAddressSection
            addresses={companyData[CompaniesDataTypes.addressData] || []}
          />
        </div>
      </section>

      {/* Datos de Contacto Section */}
      <section id="datos-de-contacto" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Datos de Contacto</h2>
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 w-24 rounded-full"></div>
        </div>
        <div className="p-6">
          <CompanyContactSection
            contactData={companyData[CompaniesDataTypes.contactData] || null}
          />
        </div>
      </section>

      {/* Situacion Financiera Section */}
      <section id="situacion-financiera" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Situacion Financiera</h2>
          <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 w-24 rounded-full"></div>
        </div>
        <div className="p-6">
          <CompanyFinancialSection
            financialData={companyData[CompaniesDataTypes.financialSituation] || null}
          />
        </div>
      </section>

      {/* Impuestos Section */}
      <section id="impuestos" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Impuestos</h2>
          <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 w-24 rounded-full"></div>
        </div>
        <div className="p-6">
          <CompanyTaxSection
            taxData={companyData[CompaniesDataTypes.taxes] || null}
          />
        </div>
      </section>

      {/* Activos Section */}
      <section id="activos" className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Activos</h2>
          <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 w-24 rounded-full"></div>
        </div>
        <div className="p-6">
          <CompanyAssetsSection
            assetsData={companyData[CompaniesDataTypes.assets] || null}
          />
        </div>
      </section>

      {/* Nomina empresarial Section */}
      {companyData[CompaniesDataTypes.corporateRelations] && companyData[CompaniesDataTypes.corporateRelations].length > 0 && (
        <section id="relaciones-corporativas" className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Nomina Empresarial</h2>
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-24 rounded-full"></div>
          </div>
          <div className="p-6">
            <CompanyCorporateRelationsSection
              relations={companyData[CompaniesDataTypes.corporateRelations]}
              companyName={companyData[CompaniesDataTypes.summary]?.rz || 'Empresa'}
            />
          </div>
        </section>
      )}
    </div>
  )
}
