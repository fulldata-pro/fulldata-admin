'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { DiditFaceMatch, DiditLiveness } from '@/lib/types/report.types'
import StatusChip from './StatusChip'

interface BiometricControlSectionProps {
  face: DiditFaceMatch | null
  liveness: DiditLiveness | null
}

export default function BiometricControlSection({ face, liveness }: BiometricControlSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!face) return null

  const handleVideoToggle = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="space-y-6">
      {/* Header with Score and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-semibold text-blue-700">{face.score.toFixed(0)}%</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Similitud biometrica</p>
          </div>
        </div>
        <StatusChip status={face.status} />
      </div>

      {/* Visual Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selfie/Target Image */}
        <div className="space-y-3">
          <div className="mb-3 text-center">
            <h3 className="text-base font-medium text-gray-900 mb-2">Selfie</h3>
            <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16 mx-auto"></div>
          </div>
          <div className="relative group flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-[3/4] max-w-[200px] mx-auto">
            {face.target_image ? (
              <Image
                height={300}
                width={300}
                unoptimized
                src={face.target_image}
                alt="Imagen de referencia (selfie)"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm">Imagen no disponible</span>
            )}
          </div>
        </div>

        {/* Liveness Video or Reference Image */}
        <div className="space-y-3">
          <div className="mb-3 text-center">
            <h3 className="text-base font-medium text-gray-900 mb-2">Prueba de Vida</h3>
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-16 mx-auto"></div>
          </div>
          <div className="relative group flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-[3/4] max-w-[200px] mx-auto">
            {liveness?.video_url ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  controls={false}
                  src={liveness.video_url}
                  poster={liveness.reference_image || face.target_image}
                />
                <div
                  onClick={handleVideoToggle}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  {isPlaying ? (
                    <i className="ki-duotone ki-pause text-lg text-white">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  ) : (
                    <i className="ki-duotone ki-play text-lg text-white">
                      <span className="path1"></span>
                    </i>
                  )}
                </div>
              </>
            ) : liveness?.reference_image ? (
              <Image
                width={300}
                height={300}
                unoptimized
                src={liveness.reference_image}
                alt="Imagen de referencia de prueba de vida"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm">Video no disponible</span>
            )}
          </div>
          {!liveness?.video_url && liveness?.reference_image && (
            <p className="text-xs text-gray-500 text-center">
              * Video no disponible, mostrando imagen de referencia
            </p>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {liveness && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">Detalles</h3>
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Metodo:</span>
              <span className="text-sm text-gray-900 font-medium">
                {liveness.method === 'PASSIVE'
                  ? 'Pasivo'
                  : liveness.method === 'ACTIVE'
                    ? 'Activo'
                    : liveness.method}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Puntuacion:</span>
              <span className="text-sm text-gray-900 font-medium">{liveness.score}%</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Edad estimada:</span>
              <span className="text-sm text-gray-900 font-medium">{liveness.age_estimation ? Math.round(liveness.age_estimation) : '-'} anos</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="text-sm text-gray-900 font-medium">
                {liveness.status === 'Approved'
                  ? 'Aprobado'
                  : liveness.status === 'Declined'
                    ? 'Rechazado'
                    : liveness.status === 'In Review'
                      ? 'En Revision'
                      : liveness.status === 'Not Finished'
                        ? 'No Finalizado'
                        : liveness.status === 'Expired'
                          ? 'Expirado'
                          : liveness.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Face Match Score Visualization */}
      <div className="border border-blue-200 rounded-lg p-4">
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Analisis de Similitud</h3>
          <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Coincidencia:</span>
            <span className="text-sm font-semibold text-gray-900">{face.score.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(face.score, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600">
            {face.score >= 80
              ? 'Coincidencia alta'
              : face.score >= 60
                ? 'Coincidencia moderada'
                : 'Coincidencia baja'}
          </div>
        </div>
      </div>
    </div>
  )
}
