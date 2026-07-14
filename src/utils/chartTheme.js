/**
 * Standard dashboard chart palette — aligned with LMS action colors.
 * Order: primary → view → success → refresh → filter → download → warning → danger
 */
export const CHART_SERIES_COLORS = [
  '#2563eb', // primary / edit
  '#0ea5e9', // view / info
  '#16a34a', // success / create
  '#0891b2', // refresh / cyan
  '#7c3aed', // filter / purple
  '#0f766e', // download / teal
  '#f59e0b', // warning / pending
  '#dc2626', // danger
]

/** @deprecated Use CHART_SERIES_COLORS */
export const CHART_3D_COLORS = CHART_SERIES_COLORS

export const CHART_THEME = {
  series: CHART_SERIES_COLORS,
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  line: '#2563eb',
  lineSecondary: '#0ea5e9',
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
  cursor: 'rgba(37, 99, 235, 0.12)',
  donutStroke: '#ffffff',
  donutStrokeWidth: 2,
  activeDot: '#2563eb',
  activeDotRing: 'rgba(37, 99, 235, 0.22)',
  areaFillStart: 'rgba(37, 99, 235, 0.28)',
  areaFillEnd: 'rgba(37, 99, 235, 0.02)',
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
}

export const chartTickStyle = {
  fill: CHART_THEME.tick,
  fontSize: 12,
  fontWeight: 600,
}
