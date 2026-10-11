import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'
import '@/models/User'
import { ActionButtons } from './action-buttons'
import { DeleteRequestButton } from '@/components/delete-request-button'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserNav } from '@/components/user-nav'
import {
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
} from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard | StaffSync',
  description: 'Manage pending employee time off requests and monthly decision history.',
}

interface LeaveItem {
  _id: { toString(): string }
  employeeId?: {
    name?: string
    email?: string
  }
  companyId?: string
  dateRequested?: Date | string
  leaveType?: 'full_day' | 'half_day'
  reason: string
  status?: 'pending' | 'approved' | 'denied'
  denialReason?: string
  updatedAt?: Date | string
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/employee')
  }

  const adminCompanyId = session.user.companyId || 'default-org'

  let pendingRequests: LeaveItem[] = []
  let historyRequests: LeaveItem[] = []
  let dbError: string | null = null

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  try {
    await connectDB()

      pendingRequests = (await LeaveRequest.find({
        status: 'pending',
        companyId: adminCompanyId,
      })
        .populate('employeeId', 'name email')
        .sort({ createdAt: -1 })
        .lean()) as unknown as LeaveItem[]

      historyRequests = (await LeaveRequest.find({
        status: { $in: ['approved', 'denied'] },
        companyId: adminCompanyId,
        $or: [
          { updatedAt: { $gte: startOfMonth, $lte: endOfMonth } },
          { createdAt: { $gte: startOfMonth, $lte: endOfMonth } },
        ],
      })
        .populate('employeeId', 'name email')
        .sort({ updatedAt: -1 })
        .lean()) as unknown as LeaveItem[]
    } catch (err) {
      console.error('Failed to fetch leave requests:', err)
      dbError = 'Unable to connect to the database. Check your MongoDB Atlas connection and IP whitelist.'
    }

  const approvedThisMonth = historyRequests.filter((r) => r.status === 'approved').length
  const deniedThisMonth = historyRequests.filter((r) => r.status === 'denied').length

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <DashboardSidebar user={session.user} />

      <div className="flex min-w-0 flex-1 flex-col md:h-screen md:overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Leave Request Management & Approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserNav user={session.user} />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 space-y-10">
          {dbError && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0" />
              <p>{dbError}</p>
            </div>
          )}

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Pending Time Off Requests
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review and take action on waiting absence submissions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Clock className="size-3.5" />
                  {pendingRequests.length} Pending Review
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Employee Name</th>
                      <th scope="col" className="px-6 py-3.5">Date Requested</th>
                      <th scope="col" className="px-6 py-3.5">Duration</th>
                      <th scope="col" className="px-6 py-3.5">Reason</th>
                      <th scope="col" className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          <CheckCircle2 className="mx-auto size-8 text-emerald-500/60 mb-2" />
                          No pending time off requests right now. All caught up!
                        </td>
                      </tr>
                    ) : (
                      pendingRequests.map((request) => {
                        const employee = request.employeeId
                        const employeeName = employee?.name || 'Unknown Employee'
                        const employeeEmail = employee?.email || ''
                        const initial = employeeName.charAt(0).toUpperCase()
                        const dateRequested = request.dateRequested
                          ? new Date(request.dateRequested).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'
                        const isHalfDay = request.leaveType === 'half_day'

                        return (
                          <tr key={request._id.toString()} className="transition-colors hover:bg-muted/40">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                  {initial || <User className="size-4" />}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{employeeName}</p>
                                  {employeeEmail && (
                                    <p className="text-xs text-muted-foreground">{employeeEmail}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-2 text-foreground/90 font-medium">
                                <Calendar className="size-4 text-muted-foreground" />
                                <span>{dateRequested}</span>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                  isHalfDay
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isHalfDay ? 'Half Day' : 'Full Day'}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-start gap-2">
                                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span className="text-foreground/80 max-w-xs md:max-w-md break-words">
                                  {request.reason}
                                </span>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <ActionButtons leaveId={request._id.toString()} />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <History className="size-5 text-muted-foreground" />
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Monthly Decision History
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Decisions recorded for {currentMonthName}. Automatically scoped to the current calendar month.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="size-3" />
                  {approvedThisMonth} Approved
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  <XCircle className="size-3" />
                  {deniedThisMonth} Denied
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Employee Name</th>
                      <th scope="col" className="px-6 py-3.5">Date Requested</th>
                      <th scope="col" className="px-6 py-3.5">Duration</th>
                      <th scope="col" className="px-6 py-3.5">Reason</th>
                      <th scope="col" className="px-6 py-3.5">Decision Status</th>
                      <th scope="col" className="px-6 py-3.5">Decided On</th>
                      <th scope="col" className="px-6 py-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-xs text-muted-foreground">
                          No leaves approved or denied yet in {currentMonthName}.
                        </td>
                      </tr>
                    ) : (
                      historyRequests.map((request) => {
                        const employee = request.employeeId
                        const employeeName = employee?.name || 'Unknown Employee'
                        const employeeEmail = employee?.email || ''
                        const initial = employeeName.charAt(0).toUpperCase()
                        const dateRequested = request.dateRequested
                          ? new Date(request.dateRequested).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'
                        const decidedOn = request.updatedAt
                          ? new Date(request.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'
                        const isHalfDay = request.leaveType === 'half_day'

                        return (
                          <tr key={request._id.toString()} className="transition-colors hover:bg-muted/40">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                                  {initial || <User className="size-3.5" />}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{employeeName}</p>
                                  {employeeEmail && (
                                    <p className="text-xs text-muted-foreground">{employeeEmail}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                              {dateRequested}
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                  isHalfDay
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isHalfDay ? 'Half Day' : 'Full Day'}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-foreground/80 max-w-xs truncate">
                              {request.reason}
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              {request.status === 'approved' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="size-3" />
                                  Approved
                                </span>
                              )}
                              {request.status === 'denied' && (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-500/20 w-fit">
                                    <XCircle className="size-3" />
                                    Denied
                                  </span>
                                  {request.denialReason && (
                                    <span className="text-[11px] text-rose-600/90 dark:text-rose-400/90 max-w-xs break-words">
                                      <span className="font-semibold">Reason:</span> {request.denialReason}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">
                              {decidedOn}
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <DeleteRequestButton requestId={request._id.toString()} />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
