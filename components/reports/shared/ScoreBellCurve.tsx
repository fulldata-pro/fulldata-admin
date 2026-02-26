'use client'

import InfoTooltip from './InfoTooltip'

interface ScoreBellCurveProps {
  score: number
  average?: number
  max?: number
}

export default function ScoreBellCurve({
  score,
  average = 666,
  max = 999
}: ScoreBellCurveProps) {
  const scorePosition = (score / max) * 100
  const averagePosition = (average / max) * 100

  const generateBellCurve = () => {
    const points: string[] = []
    const steps = 100
    const stdDev = max / 6

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * max
      const normalizedX = (x - average) / stdDev
      const y = Math.exp(-0.5 * normalizedX * normalizedX)
      const svgX = (i / steps) * 100
      const svgY = 100 - (y * 80)
      points.push(`${svgX},${svgY}`)
    }

    return points.join(' ')
  }

  const bellCurvePoints = generateBellCurve()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-xs font-semibold text-gray-900">
          Distribucion del Score
        </h4>
        <InfoTooltip content="Este grafico muestra la distribucion normal de scores en el mercado. La linea gris punteada indica el promedio y la linea roja solida muestra la posicion de este score en comparacion." />
      </div>

      <svg
        viewBox="0 0 100 100"
        className="w-full h-20"
        preserveAspectRatio="none"
      >
        <polyline
          points={`0,100 ${bellCurvePoints} 100,100`}
          fill="url(#bellGradient)"
          opacity="0.5"
        />

        <polyline
          points={bellCurvePoints}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        <line
          x1={averagePosition}
          y1="15"
          x2={averagePosition}
          y2="100"
          stroke="#6b7280"
          strokeWidth="0.6"
          strokeDasharray="2,2"
          vectorEffect="non-scaling-stroke"
        />

        <line
          x1={scorePosition}
          y1="15"
          x2={scorePosition}
          y2="100"
          stroke="#eb1034"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        <circle
          cx={scorePosition}
          cy="15"
          r="2.2"
          fill="#eb1034"
          stroke="#fff"
          strokeWidth="0.5"
        />

        <defs>
          <linearGradient id="bellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eb1034" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#eb1034" stopOpacity="0.08" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex justify-between items-center mt-2 text-[11px]">
        <span className="text-gray-500 font-medium">0</span>
        <span className="text-gray-500 font-medium">{max}</span>
      </div>
    </div>
  )
}
