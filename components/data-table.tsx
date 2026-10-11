'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertCircle, Database, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type Status = 'Confirmed' | 'Pending' | 'Cancelled'

export interface ShiftItem {
  _id?: string
  id: string
  date: string
  shift: string
  location: string
  status: Status
  notes?: string
}

const statusStyles: Record<Status, string> = {
  Confirmed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  Cancelled: 'bg-destructive/10 text-destructive border border-destructive/20',
}

export function DataTable() {
  const [shifts, setShifts] = useState<ShiftItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; database?: string; host?: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form state
  const [newDate, setNewDate] = useState('')
  const [newShift, setNewShift] = useState('09:00 – 17:00')
  const [newLocation, setNewLocation] = useState('Main Office')
  const [newStatus, setNewStatus] = useState<Status>('Confirmed')

  async function checkDbStatus() {
    try {
      const res = await fetch('/api/db-status')
      const data = await res.json()
      setDbStatus(data)
    } catch {
      setDbStatus({ connected: false })
    }
  }

  async function fetchShifts() {
    setErrorMsg(null)
    try {
      const res = await fetch('/api/shifts')
      const result = await res.json()
      if (result.success) {
        setShifts(result.data)
      } else {
        setErrorMsg(result.error || 'Failed to load shifts')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error connecting to database API'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      try {
        const [statusRes, shiftsRes] = await Promise.all([
          fetch('/api/db-status'),
          fetch('/api/shifts'),
        ])
        const statusData = await statusRes.json()
        const shiftsData = await shiftsRes.json()

        if (active) {
          setDbStatus(statusData)
          if (shiftsData.success) {
            setShifts(shiftsData.data)
          } else {
            setErrorMsg(shiftsData.error || 'Failed to load shifts')
          }
        }
      } catch (err) {
        if (active) {
          setDbStatus({ connected: false })
          setErrorMsg(err instanceof Error ? err.message : 'Error connecting to database API')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [])

  async function handleAddShift(e: React.FormEvent) {
    e.preventDefault()
    if (!newDate || !newShift || !newLocation) return

    setIsSaving(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          shift: newShift,
          location: newLocation,
          status: newStatus,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setNewDate('')
        setShowAddForm(false)
        fetchShifts()
      } else {
        setErrorMsg(result.error || 'Failed to create shift')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding shift to MongoDB'
      setErrorMsg(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteShift(id: string) {
    if (!confirm(`Are you sure you want to delete shift ${id}?`)) return
    try {
      const res = await fetch(`/api/shifts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        setShifts((prev) => prev.filter((s) => s.id !== id))
      } else {
        alert(result.error || 'Failed to delete shift')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting shift from MongoDB'
      alert(message)
    }
  }

  return (
    <div className="space-y-4">
      {/* MongoDB Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Database className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">MongoDB Atlas</span>
              {dbStatus?.connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Connecting...
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Database: <span className="font-mono font-medium text-foreground">{dbStatus?.database || 'staffsync'}</span>
              {dbStatus?.host && (
                <span className="hidden sm:inline"> • Cluster: <span className="font-mono">{dbStatus.host.split('.')[0]}</span></span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              checkDbStatus()
              fetchShifts()
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            {showAddForm ? 'Cancel' : 'Add Shift'}
          </Button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Shift Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddShift}
          className="rounded-lg border border-border bg-card p-4 transition-all"
        >
          <h3 className="mb-3 font-semibold text-sm">Add New Shift to MongoDB</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <input
                type="text"
                placeholder="e.g. Sat, Oct 24"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Shift Time</label>
              <input
                type="text"
                placeholder="e.g. 09:00 – 17:00"
                value={newShift}
                onChange={(e) => setNewShift(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
              <input
                type="text"
                placeholder="e.g. Main Office / Remote"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Status)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving to DB...' : 'Save Shift'}
            </Button>
          </div>
        </form>
      )}

      {/* Shifts Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Upcoming shifts stored in MongoDB</caption>
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">ID</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                <th scope="col" className="px-4 py-3 font-medium">Shift</th>
                <th scope="col" className="px-4 py-3 font-medium">Location</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="size-4 animate-spin text-primary" />
                      <span>Loading shifts from MongoDB cluster...</span>
                    </div>
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No shifts found in MongoDB database. Click &quot;Add Shift&quot; above to create one.
                  </td>
                </tr>
              ) : (
                shifts.map((row) => (
                  <tr key={row.id || row._id} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-card-foreground">
                      {row.date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-card-foreground">
                      {row.shift}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-card-foreground">
                      {row.location}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.status] || ''}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteShift(row.id)}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete shift from database"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}