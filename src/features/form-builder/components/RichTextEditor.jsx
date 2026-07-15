import { useEffect, useRef, useCallback } from 'react'
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiLink,
  FiAlignLeft,
  FiType,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { sanitizeRichHtml } from '../utils/richText'

const TOOLBAR = [
  { cmd: 'bold', icon: FiBold, title: 'Bold (Ctrl+B)' },
  { cmd: 'italic', icon: FiItalic, title: 'Italic (Ctrl+I)' },
  { cmd: 'underline', icon: FiUnderline, title: 'Underline (Ctrl+U)' },
  { cmd: 'strikeThrough', icon: FiType, title: 'Strikethrough' },
  { cmd: 'insertUnorderedList', icon: FiList, title: 'Bullet list' },
  { cmd: 'insertOrderedList', icon: FiAlignLeft, title: 'Numbered list' },
]

export default function RichTextEditor({ value = '', onChange, placeholder = 'Enter text...', minHeight = 100 }) {
  const editorRef = useRef(null)
  const lastValue = useRef(value)

  const sync = useCallback(() => {
    if (!editorRef.current) return
    const html = sanitizeRichHtml(editorRef.current.innerHTML)
    lastValue.current = html
    onChange?.(html)
  }, [onChange])

  useEffect(() => {
    if (!editorRef.current) return
    if (value !== lastValue.current) {
      editorRef.current.innerHTML = value || ''
      lastValue.current = value
    }
  }, [value])

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    sync()
  }

  const addLink = () => {
    const url = window.prompt('Enter URL (https://...)')
    if (!url) return
    exec('createLink', url.startsWith('http') ? url : `https://${url}`)
  }

  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); exec('bold') }
      if (e.key === 'i') { e.preventDefault(); exec('italic') }
      if (e.key === 'u') { e.preventDefault(); exec('underline') }
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1">
        {TOOLBAR.map(({ cmd, icon: Icon, title }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault()
              exec(cmd)
            }}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Add link"
          onMouseDown={(e) => { e.preventDefault(); addLink() }}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
        >
          <FiLink className="h-4 w-4" />
        </button>
        <span className="ml-auto pr-2 text-[10px] text-muted-foreground">Bold · Italic · Lists</span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        onKeyDown={onKeyDown}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={cn(
          'px-3 py-2.5 text-sm outline-none',
          'empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]',
          '[&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal',
          '[&_a]:text-brand-600 [&_a]:underline',
        )}
      />
    </div>
  )
}
