import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserManagement from './UserManagement'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="fade-in">
      <UserManagement initialUsers={users} />
    </div>
  )
}
