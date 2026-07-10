import { Link } from 'react-router-dom'
import { FiBell, FiFileText, FiMail, FiMessageSquare, FiSend } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const QUICK_LINKS = [
  { label: 'Announcements', path: '/communications/messages?category=announcement', icon: FiBell, desc: 'School-wide announcements' },
  { label: 'Circulars', path: '/communications/messages?category=circular', icon: FiFileText, desc: 'Official circulars & notices' },
  { label: 'Notifications', path: '/communications/messages?category=notification', icon: FiMessageSquare, desc: 'Targeted notifications' },
  { label: 'Templates', path: '/communications/templates', icon: FiMail, desc: 'Reusable email, SMS & push templates' },
  { label: 'All Messages', path: '/communications/messages', icon: FiSend, desc: 'Schedule, send & track delivery' },
]

const CHANNELS = [
  { label: 'Email', desc: 'SMTP delivery via school settings' },
  { label: 'SMS', desc: 'Twilio / SMS provider integration' },
  { label: 'WhatsApp', desc: 'WhatsApp messaging (stub ready)' },
  { label: 'Push', desc: 'In-app notifications for users' },
]

export default function CommunicationsHubPage() {
  return (
    <div className="w-full space-y-8">
      <Breadcrumb items={[{ label: 'Communications' }]} />
      <PageHeader
        title="Communications"
        subtitle="Announcements, circulars, multi-channel messaging, templates & delivery reports"
        actions={
          <Link to="/communications/messages/new"><Button><FiSend /> Compose Message</Button></Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.path} to={item.path}>
              <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{item.label}</p>
                    <p className="mt-1 text-sm text-muted">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text">Supported Channels</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((ch) => (
            <Card key={ch.label} className="p-4">
              <p className="font-medium text-text">{ch.label}</p>
              <p className="mt-1 text-xs text-muted">{ch.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <h3 className="font-semibold text-text">Audience targeting</h3>
        <p className="mt-2 text-sm text-muted">
          Send to Students, Teachers, Parents, Staff, or all school users. Optionally filter by class section.
          Parent communication preferences are respected for email, SMS, and push channels.
        </p>
      </Card>
    </div>
  )
}
