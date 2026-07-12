import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import PageContainer from '@/components/layout/PageContainer'
import useAutomationRunner from '@/hooks/useAutomationRunner'
import '@/styles/dashboard-clay.css'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  useAutomationRunner()

  return (
    <div className="clay-app clay-app-shell flex h-screen gap-3 overflow-hidden p-3 lg:gap-4 lg:p-4">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="clay-main-panel clay-app flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="clay-scroll-hidden flex-1 overflow-x-hidden overflow-y-auto">
          <PageContainer className="clay-app px-4 py-4 lg:px-7 lg:py-5">
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  )
}
