'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarPlus, LayoutGrid, LogOut, ShieldCheck } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Props {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname()
  const initial = (user?.name || user?.email || 'U')[0].toUpperCase()
  const isAdmin = user?.role === 'admin'

  const homeHref = isAdmin ? '/admin' : '/employee'

  const navItems = isAdmin
    ? [{ label: 'Leave Approvals', href: '/admin', icon: ShieldCheck }]
    : [{ label: 'Request Leave', href: '/employee', icon: CalendarPlus }]

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border/40">
        <Link href={homeHref} className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <LayoutGrid className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">StaffSync</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex gap-1 md:flex-col">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href)

            return (
              <li key={href} className="flex-1 md:flex-none">
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {user && (
        <div className="hidden md:block p-3 border-t border-sidebar-border/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-sidebar-accent/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-sidebar-foreground">
                  {user.name || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate capitalize">
                  {user.role === 'admin' ? 'Administrator' : 'Employee'}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign Out"
              className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
