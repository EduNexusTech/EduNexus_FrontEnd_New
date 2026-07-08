import { AI_API_BASE, AI_API_KEY, AI_IS_LIVE, AI_MODEL, LMS_AI_SYSTEM_PROMPT } from '@/config/ai'

function lastUserMessage(messages) {
  return [...messages].reverse().find((m) => m.role === 'user')?.content || ''
}

function mockAssistantReply(messages) {
  const q = lastUserMessage(messages).toLowerCase()

  if (/organization|org|tenant/.test(q)) {
    return `To manage organizations in EduNexus:
1. Go to **Management → Organizations**
2. Click **Add New** for the guided wizard (Identity → Contact → Location → Review)
3. Enable **Organization details are same for school** to create a matching school in one step
4. Use **Edit** later to sync school details if you forgot during create

Need help with a specific field? Ask me about organization codes or logos.`
  }

  if (/school/.test(q)) {
    return `Schools belong to an organization. Path: **Management → Schools → Add New**.
Pick the organization from the dropdown, then fill school name, code, and contact details.
School code is locked after creation. Use the eye icon on the list to preview details in a popup.`
  }

  if (/role|permission/.test(q)) {
    return `**Roles** define job functions; **Permissions** define what actions are allowed.
Flow: create permissions → assign to roles under **Access Control → Roles → Permissions** → assign roles to users via **User Roles**.
Use the permission matrix for a bird's-eye view.`
  }

  if (/mail|email|post/.test(q)) {
    return `Use **EduNexus Post** (mail icon in the top bar or System → EduNexus Post).
Compose sends from sharanreddy26372@gmail.com. With EmailJS configured in \`.env\`, delivery is one-click; otherwise your mail app opens pre-filled.`
  }

  if (/automation|automate/.test(q)) {
    return `Open **AI Hub → Automations** to enable workflow templates:
- Welcome email drafts
- Onboarding reminders
- Audit log review nudges
- AI dashboard tips

Automations run in the browser — no backend required. Toggle templates on/off and click **Run now** anytime.`
  }

  if (/audit/.test(q)) {
    return `Audit logs track who changed what. Find them under **System → Audit Logs**.
Click the eye icon to see old/new JSON data. Filter and export from the list page.`
  }

  if (/welcome|email template/.test(q)) {
    return `Subject: Welcome to EduNexus LMS

Dear {{name}},

Your organization has been onboarded to EduNexus. You can now add schools, users, and roles.

Login: use the credentials provided by your administrator.

Best regards,
EduNexus Team`
  }

  return `I'm **Nexus AI** (local mode — add \`VITE_AI_API_KEY\` in \`.env\` for live GPT responses).

I can help with organizations, schools, users, roles, permissions, masters, audit logs, EduNexus Post, and automations.

Try: "How do I onboard a new organization?" or use a quick prompt below.`
}

export async function chatWithNexusAi(messages) {
  if (!AI_IS_LIVE) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      role: 'assistant',
      content: mockAssistantReply(messages),
      mode: 'local',
    }
  }

  const response = await fetch(`${AI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'system', content: LMS_AI_SYSTEM_PROMPT }, ...messages],
      temperature: 0.6,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err || 'AI request failed')
  }

  const data = await response.json()
  return {
    role: 'assistant',
    content: data.choices?.[0]?.message?.content || 'No response from AI.',
    mode: 'live',
  }
}

export async function generateAiTip(context = 'dashboard') {
  const prompts = {
    dashboard: 'Give one short actionable tip for an EduNexus LMS super admin reviewing their dashboard today.',
    audit: 'Give one sentence about why reviewing audit logs matters in a school ERP.',
    onboarding: 'Give one tip for onboarding a new organization in EduNexus.',
  }
  return chatWithNexusAi([{ role: 'user', content: prompts[context] || prompts.dashboard }])
}
