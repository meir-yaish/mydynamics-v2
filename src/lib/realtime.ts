type ListenerContext = { userId: string; role: string }
type Listener = (event: string, data: unknown) => void

const listeners = new Map<Listener, ListenerContext>()

export function subscribe(fn: Listener, ctx: ListenerContext) {
  listeners.set(fn, ctx)
  return () => listeners.delete(fn)
}

export function broadcast(
  event: string,
  data: unknown,
  filter?: { userId?: string; roles?: string[] },
) {
  for (const [fn, ctx] of listeners) {
    if (filter?.userId && ctx.userId !== filter.userId) continue
    if (filter?.roles && !filter.roles.includes(ctx.role)) continue
    fn(event, data)
  }
}
