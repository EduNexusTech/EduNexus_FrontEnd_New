import { useEffect, useState } from 'react'
import { FiMail, FiSave, FiServer } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'

export function AdmissionEmailSettingsCard() {
  const { emailSettings, updateEmailSettings } = useAdmissionSetup()
  const [draft, setDraft] = useState(emailSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDraft(emailSettings)
  }, [emailSettings])

  const handleSave = () => {
    updateEmailSettings(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card padding={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FiMail className="h-5 w-5 text-brand-600" />
          Application Link Email
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize the sender and intro message sent when an enquiry receives an online application
          link.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <FiServer className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Email settings</p>
            <p className="mt-1 text-muted-foreground">
              Placeholders: {'{studentName}'}, {'{parentName}'}, {'{schoolName}'}, {'{academicYear}'},{' '}
              {'{gradeApplying}'}, {'{enquiryNumber}'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Sender name"
            value={draft.senderName}
            onChange={(e) => setDraft((d) => ({ ...d, senderName: e.target.value }))}
          />
          <Input
            label="Sender / reply-to email"
            type="email"
            value={draft.senderEmail}
            onChange={(e) => setDraft((d) => ({ ...d, senderEmail: e.target.value }))}
          />
        </div>
        <Textarea
          label="Email intro message"
          rows={4}
          value={draft.emailIntro}
          onChange={(e) => setDraft((d) => ({ ...d, emailIntro: e.target.value }))}
        />
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            <FiSave className="h-4 w-4" />
            {saved ? 'Saved' : 'Save email settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
