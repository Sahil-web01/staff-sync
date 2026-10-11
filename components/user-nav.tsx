'use client'

import React, { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, ChevronDown, Shield, Loader2 } from 'lucide-react'

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  const displayName = user.name || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()
  const roleLabel = user.role === 'admin' ? 'Administrator' : 'Employee'

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="user-menu-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 rounded-full p-1 pr-3 text-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20">
          {initial}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-medium text-foreground leading-none">{displayName}</p>
          <p className="text-[10px] text-muted-foreground capitalize leading-tight mt-0.5">
            {user.role || 'Staff'}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="user-dropdown-menu"
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-border bg-card p-2 shadow-xl shadow-black/10 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}
                >
                  <Shield className="h-2.5 w-2.5" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 text-xs text-muted-foreground flex items-center justify-between border-b border-border/40">
            <span>Status</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          <div className="pt-1">
            <button
              id="dropdown-signout-btn"
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
