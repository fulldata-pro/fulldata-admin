'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'

interface MapLocation {
  id: string
  name: string
  address: string
  position: {
    lat: number
    lng: number
  }
  rating?: number
  date?: string
  comment?: string
  type?: string
  tags?: string[]
}

interface OsintMapProps {
  locations: MapLocation[]
  className?: string
}

const OsintMap: React.FC<OsintMapProps> = ({ locations, className = "" }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['marker']
  })

  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Calculate map center and zoom based on locations
  const mapCenter = useMemo(() => {
    if (locations.length === 0) {
      return { lat: -34.6037, lng: -58.3816 } // Buenos Aires default
    }

    if (locations.length === 1) {
      return locations[0].position
    }

    // Calculate center of all locations
    const totalLat = locations.reduce((sum, loc) => sum + loc.position.lat, 0)
    const totalLng = locations.reduce((sum, loc) => sum + loc.position.lng, 0)

    return {
      lat: totalLat / locations.length,
      lng: totalLng / locations.length
    }
  }, [locations])

  const mapZoom = useMemo(() => {
    if (locations.length <= 1) return 13

    // Calculate bounds and appropriate zoom
    const lats = locations.map(loc => loc.position.lat)
    const lngs = locations.map(loc => loc.position.lng)
    const latRange = Math.max(...lats) - Math.min(...lats)
    const lngRange = Math.max(...lngs) - Math.min(...lngs)
    const maxRange = Math.max(latRange, lngRange)

    if (maxRange > 10) return 6
    if (maxRange > 1) return 9
    if (maxRange > 0.1) return 12
    return 14
  }, [locations])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location)
  }

  const mapOptions = useMemo(() => ({
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  }), [])

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%',
          borderRadius: '0.5rem'
        }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            onClick={() => handleMarkerClick(location)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#ef4444',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="max-w-xs p-2">
              <div className="flex items-start gap-2 mb-2">
                <i className="ki-duotone ki-geolocation text-red-500 mt-0.5 flex-shrink-0">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    {selectedLocation.address}
                  </p>
                </div>
              </div>

              {selectedLocation.rating && (
                <div className="flex items-center gap-1 mb-2">
                  <i className="ki-duotone ki-star text-yellow-500 text-xs">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="text-xs font-medium text-gray-900">
                    {selectedLocation.rating}/5
                  </span>
                </div>
              )}

              {selectedLocation.date && (
                <div className="flex items-center gap-1 mb-2">
                  <i className="ki-duotone ki-calendar text-gray-500 text-xs">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="text-xs text-gray-600">
                    {selectedLocation.date}
                  </span>
                </div>
              )}

              {selectedLocation.comment && (
                <p className="text-xs text-gray-700 mb-2 italic">
                  &ldquo;{selectedLocation.comment}&rdquo;
                </p>
              )}

              {selectedLocation.tags && selectedLocation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedLocation.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${selectedLocation.position.lat},${selectedLocation.position.lng}`
                  window.open(url, '_blank')
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <i className="ki-duotone ki-exit-right-corner text-xs">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Ver en Google Maps
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Location counter */}
      {locations.length > 0 && (
        <div className="absolute top-3 right-3 bg-white rounded-lg shadow-lg border px-3 py-2">
          <div className="flex items-center gap-2">
            <i className="ki-duotone ki-geolocation text-red-500">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <span className="text-sm font-medium text-gray-900">
              {locations.length} ubicacion{locations.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default OsintMap
