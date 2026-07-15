const ALLOWED_TAGS = new Set([
  'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'BR', 'P', 'UL', 'OL', 'LI', 'A', 'SPAN', 'DIV',
])

const ALLOWED_ATTRS = {
  A: ['href', 'target', 'rel'],
  SPAN: ['style'],
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName
  if (!ALLOWED_TAGS.has(tag)) {
    return Array.from(node.childNodes).map(sanitizeNode).join('')
  }

  const attrs = ALLOWED_ATTRS[tag] || []
  const attrStr = attrs
    .filter((a) => node.hasAttribute(a))
    .map((a) => {
      const val = node.getAttribute(a) || ''
      if (a === 'href' && !/^https?:\/\//i.test(val) && !/^mailto:/i.test(val)) return ''
      if (a === 'style') {
        const safe = val.match(/color:\s*#[0-9a-f]{3,8}|color:\s*rgb\([^)]+\)/i)
        return safe ? ` style="${safe[0]}"` : ''
      }
      if (a === 'target') return ' target="_blank"'
      if (a === 'rel') return ' rel="noopener noreferrer"'
      return ` ${a}="${val.replace(/"/g, '')}"`
    })
    .join('')

  const inner = Array.from(node.childNodes).map(sanitizeNode).join('')
  if (tag === 'BR') return '<br>'
  return `<${tag.toLowerCase()}${attrStr}>${inner}</${tag.toLowerCase()}>`
}

/** Strip to plain text for fallback display. */
export function toPlainText(html = '') {
  if (!html || !/<[a-z][\s\S]*>/i.test(html)) return html
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

/** Returns safe HTML string for rendering. */
export function sanitizeRichHtml(html = '') {
  if (!html) return ''
  if (!/<[a-z][\s\S]*>/i.test(html)) return escapeHtml(html)

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return sanitizeNode(doc.body).trim()
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function hasRichFormatting(html = '') {
  return /<[a-z][\s\S]*>/i.test(html || '')
}
