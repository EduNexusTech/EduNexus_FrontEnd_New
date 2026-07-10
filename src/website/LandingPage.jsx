import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Feedback'
import WebsiteHeader from './components/WebsiteHeader'
import WebsiteFooter from './components/WebsiteFooter'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import TrustMarquee from './components/TrustMarquee'
import AudienceSection from './components/AudienceSection'
import FeaturesSection from './components/FeaturesSection'
import InstructionsSection from './components/InstructionsSection'
import ModulesSection from './components/ModulesSection'
import CtaSection from './components/CtaSection'
import './website.css'

export default function LandingPage() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) return <PageLoader />

  return (
    <div className="landing-page landing-mesh landing-grain relative min-h-screen w-full">
      <WebsiteHeader isAuthenticated={isAuthenticated} />
      <main className="w-full">
        <HeroSection isAuthenticated={isAuthenticated} />
        <StatsSection />
        <TrustMarquee />
        <AudienceSection />
        <FeaturesSection />
        <InstructionsSection />
        <ModulesSection />
        <CtaSection isAuthenticated={isAuthenticated} />
      </main>
      <WebsiteFooter />
    </div>
  )
}
