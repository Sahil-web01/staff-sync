'use client'

import React, { useState } from 'react'
import { submitLeaveRequest } from '@/actions/leaveActions'
import { Calendar, Send, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

export function TimeOffForm() {
  const [date, setDate] = useState('')
  const [leaveType, setLeaveType] = useState<'full_day' | 'half_day'>('full_day')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const result = await submitLeaveRequest(date, reason, leaveType)

    if (result.success) {
      setStatus({ type: 'success', message: result.message || 'Leave request submitted successfully!' })
      setDate('')
      setReason('')
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to submit leave request.' })
    }

    setIsSubmitting(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      {status?.type === 'success' && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>{status.message}</p>
        </div>
      )}

      {status?.type === 'error' && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Date Picker */}
          <div className="space-y-2">
            <label
              htmlFor="leave-date"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Date <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                id="leave-date"
                name="date"
                type="date"
                required
                min={today}
                value={date}
                disabled={isSubmitting}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Leave Type Selector (Full Day vs Half Day) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Duration <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType('full_day')}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-sm font-medium transition-colors cursor-pointer ${
                  leaveType === 'full_day'
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Full Day
              </button>
              <button
                type="button"
                onClick={() => setLeaveType('half_day')}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-sm font-medium transition-colors cursor-pointer ${
                  leaveType === 'half_day'
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Half Day
              </button>
            </div>
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-2">
          <label
            htmlFor="leave-reason"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            id="leave-reason"
            name="reason"
            rows={4}
            required
            value={reason}
            disabled={isSubmitting}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain the reason for your time off request (e.g. medical appointment, personal errand)..."
            className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
