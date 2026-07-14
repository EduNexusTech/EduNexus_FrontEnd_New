import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import Card from '@/components/ui/Card'
import { cn } from '@/utils/format'

const accents = {
  primary: 'clay-card-glass-teal',
  sage: 'clay-card-green',
  forest: 'clay-card-glass-forest',
  mint: 'clay-card-mint',
}

export default function HubFeatureCard({ to, icon: Icon, title, description, accent = 'primary' }) {
  return (
    <Link to={to} className="block h-full">
      <Card hover className={cn('flex h-full flex-col', accents[accent] || accents.primary)}>
        <div className="clay-icon-3d mb-4 inline-flex h-12 w-12 items-center justify-center">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--clay-text-sharp)]">{title}</h3>
        <p className="mt-2 flex-1 text-sm font-medium text-[var(--clay-primary-soft)]">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--clay-teal)]">
          Open <FiArrowRight className="h-4 w-4" />
        </span>
      </Card>
    </Link>
  )
}
