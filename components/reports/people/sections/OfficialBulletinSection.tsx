'use client'

import React from 'react'
import { formatDate } from '@/lib/utils/dateUtils'

interface BulletinItem {
  rz: string
  source: string
  date?: number | { $numberLong: string }
  report?: string
}

interface EmbargoItem {
  jobNumber: string
  date?: number | { $numberLong: string }
  jobDate?: number | { $numberLong: string }
  liftingDate?: number | { $numberLong: string }
  cover: string
  court: string
  proceedings?: string
  address?: string
  phone?: string
}

interface ParticipationItem {
  rz: string
  charge: string
  source: string
  publishDate?: number | { $numberLong: string }
  constitutionDate?: number | { $numberLong: string }
  file: string
  bulletinId: string
}

interface TrialActorItem {
  defendant: string
  rol: string
  date?: number | { $numberLong: string }
  province: string
  court: string
  object: string
  proceedings?: string
  text?: string
}

interface TrialDefendantItem {
  actor: string
  rol: string
  date?: number | { $numberLong: string }
  province: string
  court: string
  object: string
  proceedings?: string
  text?: string
}

interface OfficialBulletinData {
  bulletin?: BulletinItem[]
  embargoes?: EmbargoItem[]
  participationSocietal?: ParticipationItem[]
  trialsActor?: TrialActorItem[]
  trialsDefendant?: TrialDefendantItem[]
}

interface OfficialBulletinSectionProps {
  bulletinData: OfficialBulletinData
}

export default function OfficialBulletinSection({ bulletinData }: OfficialBulletinSectionProps) {
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url
    const start = url.substring(0, maxLength / 2)
    const end = url.substring(url.length - maxLength / 2)
    return `${start}...${end}`
  }

  const isEmpty = (
    (!bulletinData.bulletin || bulletinData.bulletin.length === 0) &&
    (!bulletinData.embargoes || bulletinData.embargoes.length === 0) &&
    (!bulletinData.participationSocietal || bulletinData.participationSocietal.length === 0) &&
    (!bulletinData.trialsActor || bulletinData.trialsActor.length === 0) &&
    (!bulletinData.trialsDefendant || bulletinData.trialsDefendant.length === 0)
  )

  if (isEmpty) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Boletin Oficial</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              0
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
        </div>
        <div className="text-center py-8">
          <i className="ki-duotone ki-note-2 text-4xl text-gray-300 mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
            <span className="path4"></span>
          </i>
          <p className="text-sm font-medium text-gray-500">No se encontraron registros en boletin oficial</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">

      <div className="space-y-8">
        {/* Boletines */}
        {bulletinData.bulletin && bulletinData.bulletin.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Publicaciones</h4>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  {bulletinData.bulletin.length}
                </span>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent w-12"></div>
            </div>
            <div className="space-y-4">
              {bulletinData.bulletin.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 backdrop-blur-lg border border-blue-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 opacity-70 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-base mb-4">{item.rz}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fuente</span>
                          {isValidUrl(item.source) ? (
                            <a
                              href={item.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm underline decoration-2 underline-offset-2 flex items-center gap-1 group break-all"
                              title={item.source}
                            >
                              <span className="flex-1">{truncateUrl(item.source)}</span>
                              <i className="ki-duotone ki-exit-right-corner text-xs opacity-70 group-hover:opacity-100">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                            </a>
                          ) : (
                            <span className="text-gray-800 font-medium text-sm break-all">{item.source}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(item.date)}</span>
                        </div>
                      </div>
                      {item.report && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-xs font-medium block mb-1">Reporte</span>
                          <span className="text-gray-800 text-sm">{item.report}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embargos */}
        {bulletinData.embargoes && bulletinData.embargoes.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Embargos</h4>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  {bulletinData.embargoes.length}
                </span>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-12"></div>
            </div>
            <div className="space-y-4">
              {bulletinData.embargoes.map((embargo, idx) => (
                <div key={idx} className="bg-gradient-to-br from-red-50/30 to-rose-50/20 backdrop-blur-lg border border-red-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 opacity-70 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Expediente</span>
                          <span className="text-gray-800 font-medium text-sm">{embargo.jobNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(embargo.date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Expediente</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(embargo.jobDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Levantamiento</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(embargo.liftingDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Caratula</span>
                          <span className="text-gray-800 font-medium text-sm">{embargo.cover}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Juzgado</span>
                          <span className="text-gray-800 font-medium text-sm">{embargo.court}</span>
                        </div>
                      </div>
                      {embargo.proceedings && (
                        <div className="mb-4 pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-xs font-medium block mb-1">Autos</span>
                          <span className="text-gray-800 text-sm">{embargo.proceedings}</span>
                        </div>
                      )}
                      {(embargo.address || embargo.phone) && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {embargo.address && (
                              <div>
                                <span className="text-gray-500 text-xs font-medium block mb-1">Direccion</span>
                                <span className="text-gray-800 text-sm">{embargo.address}</span>
                              </div>
                            )}
                            {embargo.phone && (
                              <div>
                                <span className="text-gray-500 text-xs font-medium block mb-1">Telefono</span>
                                <span className="text-gray-800 text-sm">{embargo.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participacion Societaria */}
        {bulletinData.participationSocietal && bulletinData.participationSocietal.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Participacion Societaria</h4>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  {bulletinData.participationSocietal.length}
                </span>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-12"></div>
            </div>
            <div className="space-y-4">
              {bulletinData.participationSocietal.map((participation, idx) => (
                <div key={idx} className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500 opacity-70 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-base mb-4">{participation.rz}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Cargo</span>
                          <span className="text-gray-800 font-medium text-sm">{participation.charge}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fuente</span>
                          <span className="text-gray-800 font-medium text-sm">{participation.source}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Publicacion</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(participation.publishDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Constitucion</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(participation.constitutionDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Expediente</span>
                          <span className="text-gray-800 font-medium text-sm">{participation.file}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Boletin ID</span>
                          <span className="text-gray-800 font-medium text-sm">{participation.bulletinId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Juicios como Actor */}
        {bulletinData.trialsActor && bulletinData.trialsActor.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Juicios como Actor</h4>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  {bulletinData.trialsActor.length}
                </span>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-12"></div>
            </div>
            <div className="space-y-4">
              {bulletinData.trialsActor.map((trial, idx) => (
                <div key={idx} className="bg-gradient-to-br from-indigo-50/30 to-blue-50/20 backdrop-blur-lg border border-indigo-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 opacity-70 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Demandado</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.defendant}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Rol</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.rol}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(trial.date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Provincia</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.province}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Juzgado</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.court}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Objeto</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.object}</span>
                        </div>
                      </div>
                      {trial.proceedings && (
                        <div className="mb-4 pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-xs font-medium block mb-1">Autos</span>
                          <span className="text-gray-800 text-sm">{trial.proceedings}</span>
                        </div>
                      )}
                      {trial.text && (
                        <div className="pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-xs font-medium block mb-1">Detalle</span>
                          <span className="text-gray-800 text-sm">{trial.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Juicios como Demandado */}
        {bulletinData.trialsDefendant && bulletinData.trialsDefendant.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Juicios como Demandado</h4>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  {bulletinData.trialsDefendant.length}
                </span>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-12"></div>
            </div>
            <div className="space-y-4">
              {bulletinData.trialsDefendant.map((trial, idx) => (
                <div key={idx} className="bg-gradient-to-br from-orange-50/30 to-amber-50/20 backdrop-blur-lg border border-orange-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-orange-500 opacity-70 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Actor</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.actor}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Rol</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.rol}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Fecha</span>
                          <span className="text-gray-800 font-medium text-sm">{formatDate(trial.date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Provincia</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.province}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Juzgado</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.court}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs font-medium block mb-1">Objeto</span>
                          <span className="text-gray-800 font-medium text-sm">{trial.object}</span>
                        </div>
                      </div>
                      {trial.proceedings && (
                        <div className="mb-4 pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-xs font-medium block mb-1">Autos</span>
                          <span className="text-gray-800 text-sm">{trial.proceedings}</span>
                        </div>
                      )}
                      {trial.text && (
                        <div className="pt-4 border-t border-gray-100">
                          <span className="text-gray-500 text-xs font-medium block mb-1">Detalle</span>
                          <span className="text-gray-800 text-sm">{trial.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
