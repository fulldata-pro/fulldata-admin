'use client'

import React from 'react'
import { CompanyContactData } from '@/lib/types/report.types'

interface CompanyContactSectionProps {
  contactData: CompanyContactData | null
}

export default function CompanyContactSection({ contactData }: CompanyContactSectionProps) {
  if (!contactData || (!contactData.email?.length && !contactData.phones?.length)) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-message-text text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No hay datos de contacto disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Emails */}
      {contactData.email && contactData.email.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Correos Electronicos</h4>
            <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {contactData.email.length}
            </span>
          </div>

          <div className="space-y-3">
            {contactData.email.map((email, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <i className="ki-duotone ki-sms text-white">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <span className="text-sm font-medium text-gray-900 break-all">{email}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telefonos */}
      {contactData.phones && contactData.phones.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Telefonos</h4>
            <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              {contactData.phones.length}
            </span>
          </div>

          <div className="space-y-3">
            {contactData.phones.map((phone, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <i className="ki-duotone ki-phone text-white">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {phone.code && `+${phone.code} `}{phone.phoneNumber}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {phone.operator && (
                      <span className="text-xs text-gray-500">{phone.operator}</span>
                    )}
                    {phone.wsp && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        WhatsApp
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
