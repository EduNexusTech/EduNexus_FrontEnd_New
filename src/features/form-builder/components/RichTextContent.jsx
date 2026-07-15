import { sanitizeRichHtml, hasRichFormatting } from '../utils/richText'
import { cn } from '@/lib/utils'

export default function RichTextContent({ html, className, as: Tag = 'div', fallback = '' }) {
  const content = html || fallback
  if (!content) return null

  if (!hasRichFormatting(content)) {
    return <Tag className={className}>{content}</Tag>
  }

  return (
    <Tag
      className={cn(
        className,
        '[&_strong]:font-bold [&_b]:font-bold',
        '[&_em]:italic [&_i]:italic',
        '[&_u]:underline [&_s]:line-through [&_strike]:line-through',
        '[&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal',
        '[&_a]:text-brand-600 [&_a]:underline',
        '[&_p]:mb-1',
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
    />
  )
}
