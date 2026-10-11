'use client'

import { useState, useTransition } from 'react'
import { Check, X, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { approveLeave, denyLeave, deleteLeaveRequest } from '@/actions/leaveActions'

export function ActionButtons({ leaveId }: { leaveId: string }) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'deny' | 'delete' | null>(null)
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false)
  const [denialReason, setDenialReason] = useState('')

  function handleApprove() {
    setAction('approve')
    startTransition(async () => {
      try {
        const res = await approveLeave(leaveId)
        if (res && !res.success && res.error) {
          alert(res.error)
        }
      } catch (err) {
        console.error('Failed to approve request:', err)
        alert('An unexpected error occurred.')
      } finally {
        setAction(null)
      }
    })
  }

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return
    }

    setAction('delete')
    startTransition(async () => {
      try {
        const res = await deleteLeaveRequest(leaveId)
        if (res && !res.success && res.error) {
          alert(res.error)
        }
      } catch (err) {
        console.error('Failed to delete request:', err)
        alert('An unexpected error occurred.')
      } finally {
        setAction(null)
      }
    })
  }

  function handleConfirmDenial(e: React.FormEvent) {
    e.preventDefault()
    setAction('deny')
    startTransition(async () => {
      try {
        const res = await denyLeave(leaveId, denialReason)
        if (res && !res.success && res.error) {
          alert(res.error)
        } else {
          setIsDenyModalOpen(false)
          setDenialReason('')
        }
      } catch (err) {
        console.error('Failed to deny request:', err)
        alert('An unexpected error occurred.')
      } finally {
        setAction(null)
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Approve request"
        >
          {isPending && action === 'approve' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Approve
        </button>

        <button
          type="button"
          onClick={() => setIsDenyModalOpen(true)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Deny request with reason"
        >
          {isPending && action === 'deny' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
          Deny
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Delete request"
        >
          {isPending && action === 'delete' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Delete
        </button>
      </div>

      {/* Denial Reason Modal */}
      {isDenyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deny-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 id="deny-modal-title" className="text-base font-semibold text-foreground">
                  Deny Leave Request
                </h3>
                <p className="text-xs text-muted-foreground">
                  Provide a reason for denying this absence request so the employee is informed.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmDenial} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="denial-reason-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Reason for Denial <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="denial-reason-input"
                  required
                  rows={3}
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="e.g. Critical project deadline, overlapping team absences..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setIsDenyModalOpen(false)
                    setDenialReason('')
                  }}
                  className="rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !denialReason.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isPending && action === 'deny' ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Denying...</span>
                    </>
                  ) : (
                    <span>Confirm Denial</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
