import type { Role } from '@/generated/prisma/client'

type Action =
  | 'manage_users'
  | 'crud_all'
  | 'edit_tasks'
  | 'view'
  | 'order_equipment'
  | 'edit_quotes'

const PERMISSIONS: Record<Action, Role[]> = {
  manage_users: ['ADMIN'],
  crud_all: ['ADMIN', 'MANAGER'],
  edit_tasks: ['ADMIN', 'MANAGER', 'SITE_MANAGER'],
  view: ['ADMIN', 'MANAGER', 'SITE_MANAGER', 'WORKER', 'VIEWER'],
  order_equipment: ['ADMIN', 'MANAGER', 'SITE_MANAGER', 'WORKER'],
  edit_quotes: ['ADMIN', 'MANAGER'],
}

export function can(role: Role, action: Action): boolean {
  return PERMISSIONS[action]?.includes(role) ?? false
}

export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) {
    throw new Error(`Forbidden: role ${role} cannot ${action}`)
  }
}
