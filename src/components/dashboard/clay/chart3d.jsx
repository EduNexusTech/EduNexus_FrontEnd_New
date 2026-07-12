/** 3D chart helpers — extruded bars, gradients, depth shadows */

export const CHART_3D_COLORS = ['#40916c', '#52b788', '#74c69d', '#2d6a4f', '#95d5b2', '#1b4332']

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

export function Chart3DDefs({ colors = CHART_3D_COLORS }) {
  return (
    <defs>
      <filter id="chart3d-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="rgba(27, 67, 50, 0.28)" />
      </filter>
      <filter id="chart3d-line-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(82, 183, 136, 0.45)" />
      </filter>
      <filter id="chart3d-dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(27, 67, 50, 0.35)" />
      </filter>
      {colors.map((color, i) => (
        <linearGradient key={color} id={`bar3d-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shadeColor(color, 0.22)} />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={shadeColor(color, -0.28)} />
        </linearGradient>
      ))}
      {colors.map((color, i) => (
        <linearGradient key={`pie-${color}`} id={`pie3d-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shadeColor(color, 0.3)} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={shadeColor(color, -0.32)} />
        </linearGradient>
      ))}
      <linearGradient id="line3d-area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(82, 183, 136, 0.45)" />
        <stop offset="100%" stopColor="rgba(82, 183, 136, 0.04)" />
      </linearGradient>
      <linearGradient id="line3d-stroke-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#40916c" />
        <stop offset="50%" stopColor="#74c69d" />
        <stop offset="100%" stopColor="#52b788" />
      </linearGradient>
    </defs>
  )
}

/** Extruded 3D bar shape for Recharts */
export function Bar3DShape(props) {
  const { fill, x, y, width, height, index = 0 } = props
  if (height == null || height <= 0 || width == null) return null

  const depth = clamp(width * 0.14, 6, 12)
  const lift = clamp(depth * 0.55, 4, 7)
  const frontX = x + 3
  const frontW = Math.max(width - 6, 6)
  const gradId = `bar3d-grad-${index % CHART_3D_COLORS.length}`
  const sideFill = shadeColor(CHART_3D_COLORS[index % CHART_3D_COLORS.length], -0.35)
  const topFill = shadeColor(CHART_3D_COLORS[index % CHART_3D_COLORS.length], 0.15)

  const right = frontX + frontW
  const bottom = y + height

  return (
    <g filter="url(#chart3d-shadow)">
      {/* depth — right face */}
      <path
        d={`M${right} ${y} L${right + depth} ${y - lift} L${right + depth} ${bottom - lift} L${right} ${bottom} Z`}
        fill={sideFill}
      />
      {/* depth — top face */}
      <path
        d={`M${frontX} ${y} L${frontX + depth} ${y - lift} L${right + depth} ${y - lift} L${right} ${y} Z`}
        fill={topFill}
      />
      {/* front face */}
      <rect
        x={frontX}
        y={y}
        width={frontW}
        height={height}
        fill={`url(#${gradId})`}
        rx={6}
        ry={6}
      />
      {/* front highlight */}
      <rect
        x={frontX + 2}
        y={y + 2}
        width={Math.max(frontW * 0.22, 4)}
        height={Math.max(height - 4, 0)}
        fill="rgba(255,255,255,0.22)"
        rx={3}
      />
    </g>
  )
}

/** 3D dot for line chart */
export function Dot3DShape({ cx, cy, index }) {
  if (cx == null || cy == null) return null
  const color = CHART_3D_COLORS[index % CHART_3D_COLORS.length]
  return (
    <g filter="url(#chart3d-dot-shadow)">
      <ellipse cx={cx} cy={cy + 2} rx={5} ry={2} fill="rgba(27, 67, 50, 0.2)" />
      <circle cx={cx} cy={cy} r={5} fill={shadeColor(color, -0.2)} />
      <circle cx={cx - 1.5} cy={cy - 1.5} r={2} fill="rgba(255,255,255,0.55)" />
    </g>
  )
}

export function ActiveDot3DShape({ cx, cy }) {
  if (cx == null || cy == null) return null
  return (
    <g filter="url(#chart3d-dot-shadow)">
      <ellipse cx={cx} cy={cy + 3} rx={8} ry={3} fill="rgba(27, 67, 50, 0.25)" />
      <circle cx={cx} cy={cy} r={8} fill="#2d6a4f" />
      <circle cx={cx} cy={cy} r={5} fill="#74c69d" />
      <circle cx={cx - 2} cy={cy - 2} r={2.5} fill="rgba(255,255,255,0.7)" />
    </g>
  )
}
