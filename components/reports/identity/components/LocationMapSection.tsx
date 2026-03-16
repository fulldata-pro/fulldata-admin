'use client'

import React, { useLayoutEffect, useRef, useMemo } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { DiditLocationsInfo, DiditParsedAddress, DiditIPAnalysis } from '@/lib/types/report.types'

interface LocationMapSectionProps {
  locations_info?: DiditLocationsInfo
  parsed_address?: DiditParsedAddress
  ip_analysis?: DiditIPAnalysis
}

export default function LocationMapSection({
  locations_info,
  parsed_address,
  ip_analysis
}: LocationMapSectionProps) {
  const chartRef = useRef<am5.Root | null>(null)

  // Check if we have valid coordinates to show
  const hasIPLocation = useMemo(() =>
    !!(locations_info?.ip?.location?.latitude && locations_info?.ip?.location?.longitude),
    [locations_info]
  )

  const hasDocumentLocation = useMemo(() =>
    !!(parsed_address?.document_location?.latitude && parsed_address?.document_location?.longitude),
    [parsed_address]
  )

  const shouldRenderMap = hasIPLocation || hasDocumentLocation

  useLayoutEffect(() => {
    if (!shouldRenderMap) return

    // Create root element
    const root = am5.Root.new('chartdiv')

    // Set themes
    root.setThemes([am5themes_Animated.new(root)])

    // Configure tooltip with white card design
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 24,
      paddingRight: 24,
      maxWidth: 350,
      pointerOrientation: 'vertical',
      animationDuration: 200
    })

    tooltip.get('background')?.setAll({
      fill: am5.color(0xffffff),
      fillOpacity: 1,
      strokeOpacity: 0,
      shadowColor: am5.color(0x000000),
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowOpacity: 0.15
    })

    tooltip.label.setAll({
      fill: am5.color(0x1f2937),
      fontSize: 14,
      oversizedBehavior: 'wrap',
      maxWidth: 300,
      lineHeight: 1.6
    })

    // Determine center point for the map
    const centerLat = hasIPLocation
      ? locations_info!.ip.location.latitude
      : parsed_address!.document_location!.latitude
    const centerLng = hasIPLocation
      ? locations_info!.ip.location.longitude
      : parsed_address!.document_location!.longitude

    // Create the map chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'rotateX',
        panY: 'translateY',
        projection: am5map.geoMercator(),
        homeGeoPoint: {
          latitude: centerLat,
          longitude: centerLng
        },
        homeZoomLevel: 3
      })
    )

    // Create polygon series for the world map
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ['AQ']
      })
    )

    // Configure polygon appearance
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: '{name}',
      fill: am5.color(0xe5e7eb),
      stroke: am5.color(0xffffff),
      strokeWidth: 0.5
    })

    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(0xd1d5db)
    })

    // Create point series for markers
    const pointSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    )

    // Configure marker template with tooltip
    pointSeries.bullets.push(() => {
      const container = am5.Container.new(root, {
        cursorOverStyle: 'pointer'
      })

      // Outer pulse circle
      const outerCircle = container.children.push(
        am5.Circle.new(root, {
          radius: 20,
          fill: am5.color(0x3b82f6),
          fillOpacity: 0.3,
          strokeOpacity: 0
        })
      )

      // Animate outer circle pulse
      outerCircle.animate({
        key: 'radius',
        from: 20,
        to: 30,
        duration: 2000,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      })

      outerCircle.animate({
        key: 'fillOpacity',
        from: 0.3,
        to: 0,
        duration: 2000,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      })

      // Inner circle with tooltip
      container.children.push(
        am5.Circle.new(root, {
          radius: 8,
          fill: am5.color(0x3b82f6),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          tooltipY: 0,
          tooltipText: '{tooltipContent}',
          tooltip: tooltip
        })
      )

      return am5.Bullet.new(root, {
        sprite: container
      })
    })

    // Prepare location data
    const locations: any[] = []

    // IP Location
    if (hasIPLocation && ip_analysis) {
      const ipTooltip = `[fontSize: 16px bold]UBICACION DE LA IP[/]\n\n` +
        `${ip_analysis.ip_city || ''}, ${ip_analysis.ip_state || ''}\n` +
        `${ip_analysis.ip_country || ''}`

      locations.push({
        geometry: {
          type: 'Point',
          coordinates: [
            locations_info!.ip.location.longitude,
            locations_info!.ip.location.latitude
          ]
        },
        title: 'IP Location',
        tooltipContent: ipTooltip
      })
    }

    // Document Location
    if (hasDocumentLocation && parsed_address) {
      const documentTooltip = `[fontSize: 16px bold]UBICACION DEL DOCUMENTO[/]\n\n` +
        `${parsed_address.formatted_address || ''}`

      locations.push({
        geometry: {
          type: 'Point',
          coordinates: [
            parsed_address.document_location!.longitude,
            parsed_address.document_location!.latitude
          ]
        },
        title: 'Document Location',
        tooltipContent: documentTooltip
      })
    }

    // Set data
    pointSeries.data.setAll(locations)

    // Add zoom control
    chart.set('zoomControl', am5map.ZoomControl.new(root, {}))

    // Store root for cleanup
    chartRef.current = root

    // Cleanup
    return () => {
      root.dispose()
    }
  }, [locations_info, parsed_address, ip_analysis, hasIPLocation, hasDocumentLocation, shouldRenderMap])

  if (!shouldRenderMap) {
    return null
  }

  return (
    <div className="w-full">
      <div
        id="chartdiv"
        className="w-full h-[400px] rounded-lg"
      />
    </div>
  )
}
