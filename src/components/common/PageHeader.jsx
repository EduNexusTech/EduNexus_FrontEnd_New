import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      setMobileSidebarOpen,
    }),
    [sidebarCollapsed, toggleSidebar, mobileSidebarOpen],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) {
    throw new Error('useUI must be used within UIProvider')
  }
  return ctx
}

export function PageHeader({ title, description, subtitle, actions, className }) {
  const desc = description || subtitle
  if (!title && !desc && !actions) return null

  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        {title ? (
          <h1 className="page-title text-2xl font-bold tracking-tight text-black sm:text-3xl">{title}</h1>
        ) : null}
        {desc ? <p className="page-description mt-1 text-sm font-normal text-black">{desc}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
