import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/editor/$id/design')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/editor/$id/design"!</div>
}
