'use client'

import React from 'react'

interface BankOwner {
  id: string
  displayName: string
  idType: string
  isPhysicalPerson: boolean
}

interface BankOwnersProps {
  owners: BankOwner[]
}

export default function BankOwners({ owners }: BankOwnersProps) {
  if (!owners || owners.length === 0) return null

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/60 hover:shadow-xl rounded-2xl p-8 shadow-lg shadow-slate-900/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Titulares de la Cuenta</h3>
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
        </div>
        <div className="text-sm text-gray-500">
          {owners.length} {owners.length === 1 ? 'titular' : 'titulares'}
        </div>
      </div>

      <div className="space-y-8">
        {owners.map((owner, index) => (
          <div key={owner.id} className="relative group">
            <div className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-full flex items-center justify-center shadow-sm">
                      <i className={`ki-duotone ${owner.isPhysicalPerson ? 'ki-profile-user' : 'ki-office-bag'} text-lg text-gray-600`}>
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                      </i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {owner.displayName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 text-gray-700">
                          {owner.isPhysicalPerson ? 'Persona Fisica' : 'Persona Juridica'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Tipo de Documento
                      </div>
                      <div className="text-base text-gray-900 font-medium">
                        {owner.idType}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Numero
                      </div>
                      <div className="text-base font-mono text-gray-900 tracking-wider font-medium">
                        {owner.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
