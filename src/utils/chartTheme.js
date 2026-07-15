/**
 * Standard dashboard chart palette — aligned with LMS action colors.
 * Order: primary → view → success → refresh → filter → download → warning → danger
 */
export const CHART_SERIES_COLORS = [
  '#4f46e5', // brand primary
  '#6366f1', // brand light
  '#10b981', // success
  '#3b82f6', // info
  '#8b5cf6', // purple
  '#0d9488', // teal
  '#f59e0b', // warning
  '#ef4444', // danger
]

/** @deprecated Use CHART_SERIES_COLORS */
export const CHART_3D_COLORS = CHART_SERIES_COLORS

export const CHART_THEME = {
  series: CHART_SERIES_COLORS,
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  line: '#4f46e5',
  lineSecondary: '#6366f1',
  grid: '#e2e8f0',
  gridOpacity: 0.9,
  tick: '#475569',
  axis: '#94a3b8',
  label: '#0f172a',
  muted: '#64748b',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#0f172a',
  tooltipShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  cursor: 'rgba(79, 70, 229, 0.12)',
  donutStroke: '#ffffff',
  donutStrokeWidth: 2,
  activeDot: '#4f46e5',
  activeDotRing: 'rgba(79, 70, 229, 0.22)',
  areaFillStart: 'rgba(79, 70, 229, 0.28)',
  areaFillEnd: 'rgba(79, 70, 229, 0.02)',
  barHighlight: 'rgba(255, 255, 255, 0.45)',
  legendBg: '#f8fafc',
}

export function getChartColor(index = 0) {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]
}

export const chartTooltipStyle = {
  borderRadius: 12,
  border: `1px solid ${CHART_THEME.tooltipBorder}`,
  background: CHART_THEME.tooltipBg,
  boxShadow: CHART_THEME.tooltipShadow,
  fontSize: 13,
  fontWeight: 600,
  color: CHART_THEME.tooltipText,
  pointerEvents: 'none',
}

/** Keep Recharts tooltip above bars / pie slices */
export const chartTooltipWrapperStyle = {
  zIndex: 50,
  outline: 'none',
  pointerEvents: 'none',
}

export const chartTickStyle = {
  fill: CHART_THEME.tick,
  fontSize: 12,
  fontWeight: 600,
}
