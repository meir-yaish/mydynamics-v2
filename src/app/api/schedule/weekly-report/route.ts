import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/schedule/email'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      include: { milestones: true, recipients: { where: { active: true } } }
    })

    for (const project of projects) {
      if (!process.env.GMAIL_FROM || !process.env.GMAIL_APP_PASSWORD) continue

      const tasks = await prisma.task.findMany({ where: { projectId: project.id }, orderBy: { order: 'asc' } })
      const milestones = project.milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const recipients = project.recipients

      if (recipients.length === 0) continue

      const dateStr = new Date().toLocaleDateString('he-IL')

      const milestonesHtml = milestones.map(m => {
        const statusColor = m.status === 'green' ? '#00B050' : m.status === 'yellow' ? '#FFC000' : '#C00000'
        const statusText = m.status === 'green' ? '✅ בזמן' : m.status === 'yellow' ? '⚠️ בסיכון' : '🔴 חריגה'
        return `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${m.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${new Date(m.date).toLocaleDateString('he-IL')}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;color:${statusColor};font-weight:bold;">${statusText}</td>
        </tr>`
      }).join('')

      const tasksHtml = tasks.map(t => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${t.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${t.responsible}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${t.progress}%</td>
      </tr>`).join('')

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;direction:rtl;color:#333;padding:20px;}
  h1{color:#1F3864;border-bottom:3px solid #1F3864;padding-bottom:8px;}
  table{width:100%;border-collapse:collapse;}
  th{background:#1F3864;color:white;padding:8px 12px;text-align:right;}
</style></head>
<body>
  <h1>📊 דוח שבועי - ${project.name}</h1>
  <p>תאריך: <strong>${dateStr}</strong></p>
  <h2>📍 אבני דרך</h2>
  <table><thead><tr><th>אבן דרך</th><th>תאריך יעד</th><th>סטטוס</th></tr></thead>
  <tbody>${milestonesHtml}</tbody></table>
  <h2>📋 משימות</h2>
  <table><thead><tr><th>משימה</th><th>אחראי</th><th>התקדמות</th></tr></thead>
  <tbody>${tasksHtml}</tbody></table>
  <br><hr><p style="color:#999;font-size:12px;">דוח שבועי אוטומטי — MyDynamics</p>
</body></html>`

      await sendEmail({
        to: recipients.map(r => r.email),
        subject: `📊 דוח שבועי - ${project.name} - ${dateStr}`,
        html
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'שגיאה'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
