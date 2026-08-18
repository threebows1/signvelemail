import { createFileRoute } from '@tanstack/react-router'

/**
 * Serves the logo / profile image of a saved signature over plain HTTPS.
 * Email clients (Gmail in particular) strip base64 `data:` image URIs on paste,
 * which is why exported signatures showed a broken image placeholder.
 * Only the image bytes are returned — never any other signature field.
 */
export const Route = createFileRoute('/api/public/sig-image/$id/$kind')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id, kind } = params as { id: string; kind: string }
        if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Not found', { status: 404 })
        const field = kind === 'logo' ? 'logoUrl' : kind === 'photo' ? 'photoUrl' : null
        if (!field) return new Response('Not found', { status: 404 })

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const { data, error } = await supabaseAdmin
          .from('signatures')
          .select('data')
          .eq('id', id)
          .limit(1)
          .maybeSingle()
        if (error || !data) return new Response('Not found', { status: 404 })

        const raw = (data.data as Record<string, unknown> | null)?.[field]
        if (typeof raw !== 'string' || !raw.startsWith('data:')) {
          return new Response('Not found', { status: 404 })
        }
        const match = /^data:([^;,]+);base64,(.*)$/s.exec(raw)
        if (!match) return new Response('Not found', { status: 404 })
        const [, mime, b64] = match
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        return new Response(bytes, {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
