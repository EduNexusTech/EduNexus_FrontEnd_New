import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listAutomations } from '@/utils/automationStorage'
import { runAutomationIfDue } from '@/services/automationEngine'

/** Runs due automations while the app is open (app_load + interval triggers). */
export default function useAutomationRunner() {
  const navigate = useNavigate()

  useEffect(() => {
    const runDue = async (intervalTick = false) => {
      const automations = listAutomations()
      for (const automation of automations) {
        await runAutomationIfDue(automation, { navigate, intervalTick })
      }
    }

    runDue(false)

    const timer = setInterval(() => runDue(true), 60 * 1000)
    return () => clearInterval(timer)
  }, [navigate])
}
