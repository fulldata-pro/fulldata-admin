'use client'

import React, { useState } from 'react'
import { AMLScreening } from '@/lib/types/report.types'
import StatusChip from './StatusChip'

interface AMLSectionProps {
  aml: AMLScreening
}

export default function AMLSection({ aml }: AMLSectionProps) {
  const [expandedHit, setExpandedHit] = useState<number | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-blue-600'
    return 'text-green-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-red-50 border-red-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'bg-blue-50 border-blue-200'
    return 'bg-green-50 border-green-200'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible'
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AML Screening</h3>
          <p className="text-gray-600 text-sm">Anti-Money Laundering y verificacion de sanciones</p>
        </div>
        <StatusChip status={aml.status} />
      </div>

      {/* Score Overview */}
      <div className={`border rounded-lg p-6 ${getScoreBackground(aml.score)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-lg">Puntuacion de Riesgo</h4>
            <p className="text-sm opacity-75">Basado en coincidencias encontradas</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(aml.score)}`}>{aml.score}/100</div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              aml.score >= 80
                ? 'bg-red-500'
                : aml.score >= 60
                  ? 'bg-yellow-500'
                  : aml.score >= 40
                    ? 'bg-blue-500'
                    : 'bg-green-500'
            }`}
            style={{ width: `${aml.score}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm">
          <span>Bajo Riesgo</span>
          <span>Alto Riesgo</span>
        </div>
      </div>

      {/* Screened Data */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Datos Verificados</h3>
          <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Nombre Completo:</span>
            <span className="text-gray-900">{aml.screened_data.full_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Nacionalidad:</span>
            <span className="text-gray-900">{aml.screened_data.nationality}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Fecha de Nacimiento:</span>
            <span className="text-gray-900">{formatDate(aml.screened_data.date_of_birth)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Numero de Documento:</span>
            <span className="text-gray-900">{aml.screened_data.document_number}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{aml.total_hits}</div>
          <div className="text-sm text-gray-600">Total Coincidencias</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {aml.hits.filter((hit) => hit.pep_matches.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Coincidencias PEP</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {aml.hits.filter((hit) => hit.sanction_matches.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Sanciones</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {aml.hits.filter((hit) => hit.adverse_media_matches.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Medios Adversos</div>
        </div>
      </div>

      {/* Warnings */}
      {aml.warnings && aml.warnings.length > 0 && (
        <div className="space-y-3">
          <div className="mb-3">
            <h3 className="text-base font-medium text-gray-900 mb-2">Advertencias</h3>
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
          </div>
          {aml.warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="ki-duotone ki-warning-2 text-xl text-yellow-600 mt-0.5">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                <div>
                  <h5 className="font-medium text-yellow-900">{warning.short_description}</h5>
                  <p className="text-sm text-yellow-800 mt-1">{warning.long_description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-yellow-700">
                    <span>Riesgo: {warning.risk}</span>
                    <span>Tipo: {warning.log_type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hits Details */}
      {aml.hits && aml.hits.length > 0 && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 mb-2">Detalles de Coincidencias</h3>
            <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
          </div>
          {aml.hits.map((hit, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div
                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedHit(expandedHit === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {hit.caption || hit.rca_name || `Coincidencia ${index + 1}`}
                    </span>
                    {hit.match_score && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hit.match_score >= 80
                            ? 'bg-red-100 text-red-800'
                            : hit.match_score >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {hit.match_score.toFixed(1)}% coincidencia
                      </span>
                    )}
                  </div>
                  <i className={`ki-duotone ki-arrow-${expandedHit === index ? 'up' : 'down'} text-lg text-gray-400`}>
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
              </div>

              {expandedHit === index && (
                <div className="p-4 border-t border-gray-200">
                  {/* PEP Matches */}
                  {hit.pep_matches && hit.pep_matches.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-purple-900 mb-2">PEP (Persona Expuesta Politicamente)</h5>
                      {hit.pep_matches.map((pep, pepIndex) => (
                        <div key={pepIndex} className="bg-purple-50 rounded p-3 mb-2">
                          <div className="font-medium">{pep.matched_name}</div>
                          <div className="text-sm text-gray-600">{pep.description}</div>
                          {pep.pep_position && (
                            <div className="text-sm">
                              <strong>Posicion:</strong> {pep.pep_position}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sanction Matches */}
                  {hit.sanction_matches && hit.sanction_matches.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-orange-900 mb-2">Sanciones</h5>
                      {hit.sanction_matches.map((sanction, sanctionIndex) => (
                        <div key={sanctionIndex} className="bg-orange-50 rounded p-3 mb-2">
                          <div className="font-medium">{sanction.matched_name}</div>
                          <div className="text-sm text-gray-600">{sanction.description}</div>
                          {sanction.reason && (
                            <div className="text-sm">
                              <strong>Razon:</strong> {sanction.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Adverse Media */}
                  {hit.adverse_media_matches && hit.adverse_media_matches.length > 0 && (
                    <div>
                      <h5 className="font-medium text-red-900 mb-2">Medios Adversos</h5>
                      {hit.adverse_media_matches.map((media, mediaIndex) => (
                        <div key={mediaIndex} className="bg-red-50 rounded p-3 mb-2">
                          <div className="font-medium">{media.headline}</div>
                          <div className="text-sm text-gray-600">{media.summary}</div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Sentimiento: {media.sentiment}</span>
                            <span>Fecha: {formatDate(media.publication_date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Hits Message */}
      {aml.total_hits === 0 && (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
          <i className="ki-duotone ki-shield-tick text-xl text-green-600 mb-2">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
          <h4 className="font-medium text-green-900">No se encontraron coincidencias</h4>
          <p className="text-sm text-green-700">
            La deteccion AML no encontro coincidencias en listas de sanciones o PEP
          </p>
        </div>
      )}
    </div>
  )
}
