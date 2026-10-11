'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteLeaveRequest } from '@/actions/leaveActions'

interface DeleteButtonProps {
  requestId: string
}

export function DeleteRequestButton({ requestId }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return
    }

    startTransition(async () => {
      try {
        const res = await deleteLeaveRequest(requestId)
        if (res && !res.success && res.error) {
          alert(res.error)
        }
      } catch (err) {
        console.error('Failed to delete request:', err)
        alert('Failed to delete leave request.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      title="Delete this request"
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Trash2 className="size-3" />
      )}
      <span>Delete</span>
    </button>
  )
}
