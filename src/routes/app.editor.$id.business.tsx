import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/editor/$id/business')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/editor/$id/business"!</div>
}
