import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/shell/Sidebar'
import TopBar from '@/components/shell/TopBar'
import { SessionProvider } from 'next-auth/react'

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <SessionProvider session={session}>
      <Sidebar userName={session.user.name} userRole={session.user.role} />
      <div style={{ marginRight: 'var(--sidebar-width)' }}>
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </SessionProvider>
  )
}
