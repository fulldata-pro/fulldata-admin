'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { getBankImage, classNames, getSituationLabel } from '@/lib/utils/bankUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'

// Interface generica para datos BCRA que funciona tanto para personas como empresas
export interface BCRAItem {
  name: string
  period?: number
  situation: string
  loan?: number
  type?: string
  bankCode?: string
}

interface BCRATableProps {
  bcraInfo: BCRAItem[]
  countryCode?: string
  title?: string
}

export default function BCRATable({ bcraInfo, title = 'Informacion BCRA' }: BCRATableProps) {
  // Año actual para expandir por defecto
  const year = new Date().getFullYear()

  // Estado para controlar que años estan expandidos
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({
    [year]: true,
  })

  // Funcion para alternar la expansion de un año
  const toggleYear = (year: string) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }))
  }

  // Meses en español
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  // Funcion para obtener el año y mes de un timestamp
  const getYearAndMonth = (timestamp?: number) => {
    if (!timestamp) return { year: "", month: "" }

    const date = new Date(timestamp)
    const yearStr = date.getFullYear().toString()
    const month = months[date.getMonth()]

    return { year: yearStr, month }
  }

  // Funcion para obtener el color del chip de situacion
  const getSituationChipColor = (situation: string) => {
    const code = parseInt(situation)
    switch (code) {
      case 0:
        return 'bg-slate-100 text-slate-600'
      case 1:
        return 'bg-emerald-100 text-emerald-700'
      case 2:
        return 'bg-yellow-100 text-yellow-700'
      case 3:
        return 'bg-orange-100 text-orange-700'
      case 4:
      case 5:
      case 6:
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  // Funcion para obtener descripcion detallada de situacion
  const getSituationDescription = (situation: string) => {
    const normalizedSituation = situation.padStart(2, '0')
    switch (normalizedSituation) {
      case "00":
        return "Sin informacion disponible en el sistema del BCRA."
      case "01":
        return "Situacion normal - Cumplimiento puntual de obligaciones o con atrasos no superiores a 31 dias."
      case "02":
        return "Con seguimiento especial - Situacion con riesgo potencial, atrasos de 32 a 90 dias."
      case "03":
        return "Con problemas - Cumplimiento deficiente de las obligaciones, atrasos de 91 a 180 dias."
      case "04":
        return "Con alto riesgo de insolvencia - Situacion financiera critica, atrasos de 181 dias a 1 año."
      case "05":
        return "Irrecuperable - Deudas con muy pocas posibilidades de cobro, atrasos superiores a 1 año."
      case "06":
        return "Irrecuperable por disposicion tecnica - Entidades en liquidacion, disolucion, quiebra o gestion judicial."
      default:
        return "Situacion no definida."
    }
  }

  // Transformar los datos planos en una estructura jerarquica
  const processData = () => {
    // Extraer años unicos de los timestamps
    const yearsSet = new Set<string>()
    bcraInfo.forEach((item) => {
      if (item.period) {
        const { year } = getYearAndMonth(item.period)
        if (year) yearsSet.add(year)
      }
    })

    const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a))
    const financialData: Record<string, any> = {}

    // Inicializar la estructura de datos
    years.forEach((year) => {
      financialData[year] = {
        total: 0,
      }

      months.forEach((month) => {
        financialData[year][month] = {}
      })
    })

    // Llenar la estructura con los datos
    bcraInfo.forEach((item) => {
      if (!item || !item.period || !item.name) return

      const { year, month } = getYearAndMonth(item.period)
      if (!year || !month) return

      let category = item.type ? String(item.type).toLowerCase().replace('_', ' ') : "sin categoria"
      if (category === 'banking entity') {
        category = 'entidad bancaria'
      }
      if (category === 'financial') {
        category = 'entidades financieras'
      }
      const { name, situation, loan } = item

      if (!financialData[year]) {
        financialData[year] = { total: 0 }
        months.forEach((m) => {
          financialData[year][m] = {}
        })
      }

      if (!financialData[year][month]) {
        financialData[year][month] = {}
      }

      if (!financialData[year][month][category]) {
        financialData[year][month][category] = []
      }

      financialData[year][month][category].push({ name, situation, loan })
    })

    // Calcular totales por año y mes
    years.forEach((year) => {
      let yearTotal = 0

      months.forEach((month) => {
        let monthTotal = 0

        Object.keys(financialData[year][month]).forEach((category) => {
          financialData[year][month][category].forEach((data: any) => {
            if (data.loan) {
              monthTotal += data.loan
              yearTotal += data.loan
            }
          })
        })

        // Guardar el total mensual para usarlo en la visualizacion
        financialData[year][`${month}_total`] = monthTotal
      })

      // Guardar el total anual
      financialData[year].total = yearTotal
    })

    return { financialData, years }
  }

  const { financialData, years } = processData()

  // Si no hay datos, mostrar mensaje
  if (!bcraInfo || bcraInfo.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="space-y-2">
          <div className="text-slate-400">
            <i className="ki-duotone ki-document text-4xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
          <p className="text-slate-500 font-medium">No hay informacion del BCRA disponible</p>
          <p className="text-sm text-slate-400">Los datos del Banco Central apareceran aqui cuando esten disponibles</p>
        </div>
      </div>
    )
  }

  // Funcion para renderizar una celda con datos
  const renderDataCell = (year: string, month: string, category: string, entityName: string) => {
    // Validar que existan todas las estructuras necesarias
    if (!financialData ||
      !financialData[year] ||
      !financialData[year][month] ||
      !financialData[year][month][category]) {
      return <td className="whitespace-nowrap bg-slate-50/50 px-3 py-2 text-center text-slate-400 text-sm min-w-[100px]">-</td>
    }

    const entityData = financialData[year][month][category].find((data: any) => data && data.name === entityName)

    if (!entityData || !entityData.loan) {
      return <td className="whitespace-nowrap bg-slate-50/50 px-3 py-2 text-center text-slate-400 text-sm min-w-[100px]">-</td>
    }

    return (
      <td className="whitespace-nowrap px-3 py-2 text-center min-w-[100px]">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">
            {formatCurrency(entityData.loan, 'ARS')}
          </div>
          {entityData.situation && (
            <span
              className={classNames(
                'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                getSituationChipColor(entityData.situation)
              )}
            >
              {getSituationLabel(entityData.situation)}
            </span>
          )}
        </div>
      </td>
    )
  }

  // Funcion para renderizar una fila de año (totales)
  const renderYearRow = (year: string) => {
    return (
      <tr
        key={`year-${year}`}
        className="cursor-pointer border-b border-cyan-200/30 bg-white/70 backdrop-blur-lg text-sm font-medium text-slate-700 hover:bg-cyan-50/30 transition-colors"
        onClick={() => toggleYear(year)}
      >
        <td className="sticky left-0 z-10 bg-white/70 backdrop-blur-lg border-r border-cyan-200/30 whitespace-nowrap px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            {expandedYears[year] ? (
              <i className="ki-duotone ki-down text-cyan-600">
                <span className="path1"></span>
              </i>
            ) : (
              <i className="ki-duotone ki-right text-cyan-600">
                <span className="path1"></span>
              </i>
            )}
            <span className="font-bold text-cyan-900">{year}</span>
          </div>
        </td>
        {months.map((month) => {
          const total = (financialData[year] && financialData[year][`${month}_total`]) || 0
          const hasData = total > 0

          return (
            <td
              key={`year-${year}-month-${month}`}
              className={`whitespace-nowrap px-3 py-4 text-center text-sm min-w-[100px] ${!hasData ? "text-slate-400" : "text-slate-800 font-semibold"
                }`}
            >
              {total ? formatCurrency(total, 'ARS') : '-'}
            </td>
          )
        })}
      </tr>
    )
  }

  // Funcion para renderizar las filas de categoria y entidades
  const renderCategoryRows = (year: string) => {
    if (!expandedYears[year]) return null

    // Obtener todas las categorias unicas para este año
    const categories = new Set<string>()
    bcraInfo
      .filter((item) => {
        if (!item || !item.period || !item.name) return false
        const { year: itemYear } = getYearAndMonth(item.period)
        return itemYear === year
      })
      .forEach((item) => {
        let category = item.type ? String(item.type).toLowerCase().replace('_', ' ') : "sin categoria"
        if (category === 'banking entity') {
          category = 'entidad bancaria'
        }
        if (category === 'financial') {
          category = 'entidades financieras'
        }
        categories.add(category)
      })

    return Array.from(categories).map((category) => {
      // Obtener todas las entidades unicas para esta categoria y año
      const entities = new Set<string>()
      bcraInfo
        .filter((item) => {
          if (!item || !item.period || !item.name) return false
          const { year: itemYear } = getYearAndMonth(item.period)
          let itemCategory = item.type ? String(item.type).toLowerCase().replace('_', ' ') : "sin categoria"
          if (itemCategory === 'banking entity') {
            itemCategory = 'entidad bancaria'
          }
          if (itemCategory === 'financial') {
            itemCategory = 'entidades financieras'
          }
          return itemYear === year && itemCategory === category
        })
        .forEach((item) => {
          entities.add(item.name)
        })

      return (
        <React.Fragment key={`year-${year}-category-${category}`}>
          <tr className="border-b border-cyan-200/30 bg-gradient-to-r from-cyan-100/30 to-blue-100/20 backdrop-blur-lg text-xs font-bold uppercase tracking-wider text-cyan-700">
            <td className="sticky left-0 z-10 bg-gradient-to-r from-cyan-100/30 to-blue-100/20 backdrop-blur-lg border-r border-cyan-200/30 whitespace-nowrap px-4 py-3 pl-8 font-bold shadow-sm">
              {category}
            </td>
            {months.map((month) => (
              <td key={`category-${category}-month-${month}`} className="whitespace-nowrap px-3 py-3 text-center text-xs text-slate-500 min-w-[100px]">
                {month.substring(0, 3)}
              </td>
            ))}
          </tr>
          {Array.from(entities).map((entity) => {
            const bankImage = getBankImage(entity)
            // Get bankCode for this entity from the original data
            const entityItem = bcraInfo.find(item =>
              item.name === entity &&
              item.type && String(item.type).toLowerCase().replace('_', ' ') === category
            )
            const bankCode = entityItem?.bankCode

            return (
              <tr key={`year-${year}-category-${category}-entity-${entity}`} className="border-b border-cyan-200/30 text-sm hover:bg-cyan-50/20 transition-colors">
                <td className="sticky left-0 z-10 bg-white/70 backdrop-blur-lg border-r border-cyan-200/30 whitespace-nowrap px-4 py-3 pl-8 font-semibold text-slate-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    {bankImage ? (
                      <div className="flex flex-col items-start gap-1">
                        <Image
                          title={entity}
                          src={bankImage}
                          alt={entity}
                          width={80}
                          height={48}
                          className="w-20 h-12 object-contain flex-shrink-0"
                          unoptimized
                        />
                        {bankCode && (
                          <span className="text-xs text-gray-500 font-mono">
                            Codigo: {bankCode}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className="truncate text-xs">{entity}</span>
                        {bankCode && (
                          <span className="text-xs text-gray-500 font-mono">
                            Codigo: {bankCode}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                {months.map((month) => (
                  <React.Fragment key={`entity-${entity}-month-${month}`}>
                    {renderDataCell(year, month, category, entity)}
                  </React.Fragment>
                ))}
              </tr>
            )
          })}
        </React.Fragment>
      )
    })
  }

  const situationLegend = [
    { code: '01', label: '1 - Normal', description: getSituationDescription('01'), color: 'bg-emerald-100 text-emerald-700' },
    { code: '02', label: '2 - Seguimiento especial', description: getSituationDescription('02'), color: 'bg-yellow-100 text-yellow-700' },
    { code: '03', label: '3 - Con problemas', description: getSituationDescription('03'), color: 'bg-orange-100 text-orange-700' },
    { code: '04', label: '4 - Alto riesgo', description: getSituationDescription('04'), color: 'bg-red-100 text-red-700' },
    { code: '05', label: '5 - Irrecuperable', description: getSituationDescription('05'), color: 'bg-red-100 text-red-700' },
    { code: '06', label: '6 - Irrecuperable tecnico', description: getSituationDescription('06'), color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-3">
            <Image
              src="/images/brands/bcra.png"
              alt="BCRA"
              width={24}
              height={24}
              className="object-contain"
              unoptimized
            />
            <h3 className="text-base font-medium text-gray-900">
              {title}
            </h3>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-cyan-600 to-cyan-500 text-white">
            Historico
          </span>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
      </div>

      {/* Tabla principal con primera columna fija */}
      <div className="bg-white/70 backdrop-blur-lg border border-cyan-100/30 rounded-xl shadow-sm overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-200/30 bg-gradient-to-r from-cyan-50/30 to-blue-50/20 backdrop-blur-lg">
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-cyan-50/30 to-blue-50/20 backdrop-blur-lg border-r border-cyan-200/30 whitespace-nowrap px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-cyan-700 shadow-sm">
                    Periodo
                  </th>
                  {months.map((month) => (
                    <th key={`header-${month}`} className="whitespace-nowrap px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-cyan-700 min-w-[100px]">
                      {month.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map((year) => (
                  <React.Fragment key={`year-section-${year}`}>
                    {renderYearRow(year)}
                    {renderCategoryRows(year)}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leyenda de situaciones */}
      <div className="mt-6 bg-gradient-to-br from-cyan-50/30 to-blue-50/20 backdrop-blur-lg border border-cyan-100/30 rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-cyan-900 mb-2">Situaciones BCRA</h4>
          <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-12"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {situationLegend.map((item) => (
            <div key={item.code} className="flex items-start gap-3 bg-white/70 backdrop-blur-lg rounded-lg p-3 border border-white/30">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${item.color} flex-shrink-0 shadow-sm`}>
                {item.label}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
