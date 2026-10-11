import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '403 Unauthorized | StaffSync',
  description: 'You do not have permission to view this page.',
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
          <ShieldAlert className="size-8" />
        </div>

        <p className="text-sm font-semibold tracking-wide text-destructive uppercase">
          403 Error
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Access Denied
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          You do not have permission to view this page.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-4" />
            Go back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
