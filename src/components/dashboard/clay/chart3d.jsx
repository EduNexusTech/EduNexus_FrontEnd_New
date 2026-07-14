/** Dashboard chart shapes — standard LMS color palette */

import {
  CHART_SERIES_COLORS,
  CHART_THEME,
  getChartColor,
} from '@/utils/chartTheme'

export { CHART_SERIES_COLORS, CHART_SERIES_COLORS as CHART_3D_COLORS } from '@/utils/chartTheme'

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function parseHex(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function toHex(r, g, b) {
  return `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`
}

export function shadeColor(hex, amount) {
  const { r, g, b } = parseHex(hex)
  const factor = 1 + amount
  return toHex(r * factor, g * factor, b * factor)
}

export function Chart3DDefs({ colors = CHART_SERIES_COLORS }) {
  return (
    <defs>
      {colors.map((color, i) => (
        <linearGradient key={`bar-${color}`} id={`bar3d-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shadeColor(color, 0.18)} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      ))}
      {colors.map((color, i) => (
        <linearGradient key={`pie-${color}`} id={`pie3d-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shadeColor(color, 0.12)} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      ))}
      <linearGradient id="line3d-area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CHART_THEME.areaFillStart} />
        <stop offset="100%" stopColor={CHART_THEME.areaFillEnd} />
      </linearGradient>
      <linearGradient id="line3d-stroke-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={CHART_THEME.line} />
        <stop offset="100%" stopColor={CHART_THEME.lineSecondary} />
      </linearGradient>
    </defs>
  )
}

/** Flat bar with standard series colors */
export function Bar3DShape(props) {
  const { x, y, width, height, index = 0 } = props
  if (height == null || height <= 0 || width == null) return null

  const frontX = x + 4
  const frontW = Math.max(width - 8, 8)
  const gradId = `bar3d-grad-${index % CHART_SERIES_COLORS.length}`

  return (
    <g>
      <rect x={frontX} y={y} width={frontW} height={height} fill={`url(#${gradId})`} rx={8} ry={8} />
      <rect
        x={frontX + 3}
        y={y + 3}
        width={Math.max(frontW * 0.28, 4)}
        height={Math.max(height - 6, 0)}
        fill={CHART_THEME.barHighlight}
        rx={5}
      />
    </g>
  )
}

export function Dot3DShape({ cx, cy, index }) {
  if (cx == null || cy == null) return null
  const color = getChartColor(index)
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#ffffff" strokeWidth={2} />
    </g>
  )
}

export function ActiveDot3DShape({ cx, cy }) {
  if (cx == null || cy == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={CHART_THEME.activeDotRing} />
      <circle cx={cx} cy={cy} r={6} fill={CHART_THEME.activeDot} stroke="#ffffff" strokeWidth={2} />
    </g>
  )
}
