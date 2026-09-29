import { auth } from '@/lib/auth'
import { subscribe } from '@/lib/realtime'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = subscribe((event, data) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        )
      })

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'))
      }, 15_000)

      const cleanup = () => {
        unsubscribe()
        clearInterval(keepAlive)
      }

      // Vercel has a 25s timeout for streaming responses on the Hobby plan.
      // On Pro it's 5 minutes. We close after 4.5 minutes to be safe.
      setTimeout(() => {
        cleanup()
        controller.close()
      }, 270_000)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
