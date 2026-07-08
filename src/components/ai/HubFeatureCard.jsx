import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import Card from '@/components/ui/Card'
import { cn } from '@/utils/format'

export default function HubFeatureCard({ to, icon: Icon, title, description, accent = 'primary' }) {
  const accents = {
    primary: 'from-primary/15 to-secondary/10 text-primary',
    violet: 'from-violet-100 to-purple-50 text-violet-600',
    amber: 'from-amber-50 to-orange-50 text-amber-600',
    cyan: 'from-cyan-50 to-sky-50 text-cyan-600',
  }

  return (
    <Link to={to} className="block h-full">
      <Card hover className="flex h-full flex-col">
        <div className={cn('mb-4 inline-flex rounded-2xl bg-gradient-to-br p-3 w-fit', accents[accent])}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Open <FiArrowRight className="h-4 w-4" />
        </span>
      </Card>
    </Link>
  )
}
