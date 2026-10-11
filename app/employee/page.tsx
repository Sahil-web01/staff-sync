import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserNav } from '@/components/user-nav'
import { TimeOffForm } from './time-off-form'
import { DeleteRequestButton } from '@/components/delete-request-button'
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Request Time Off | StaffSync',
  description: 'Submit and track employee time off and leave requests.',
}

interface UserLeaveItem {
  _id: { toString(): string }
  dateRequested?: Date | string
  reason: string
  leaveType?: 'full_day' | 'half_day'
  status: 'pending' | 'approved' | 'denied'
  denialReason?: string
  createdAt?: Date | string
}

export default async function EmployeePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'admin') {
    redirect('/admin')
  }

  let myRequests: UserLeaveItem[] = []

  try {
    await connectDB()
    const filter: Record<string, unknown> = { employeeId: session.user.id }
    if (session.user.companyId) {
      filter.companyId = session.user.companyId
    }

    myRequests = (await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean()) as unknown as UserLeaveItem[]
  } catch (err) {
    console.error('Failed to load employee leave requests:', err)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <DashboardSidebar user={session.user} />

      <div className="flex min-w-0 flex-1 flex-col md:h-screen md:overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Employee Portal</h1>
            <p className="text-xs text-muted-foreground">
              Welcome back, {session.user.name || session.user.email} (Employee)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserNav user={session.user} />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Request Time Off
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Submit your absence request for review and supervisor approval.
            </p>
          </div>

          <TimeOffForm />

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                My Submitted Requests
              </h3>
              <p className="text-xs text-muted-foreground">
                Track the approval status of your time off submissions.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Date Requested</th>
                      <th scope="col" className="px-6 py-3.5">Duration</th>
                      <th scope="col" className="px-6 py-3.5">Reason</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-xs text-muted-foreground">
                          No leave requests submitted yet. Use the form above to submit your first request.
                        </td>
                      </tr>
                    ) : (
                      myRequests.map((req) => {
                        const dateFormatted = req.dateRequested
                          ? new Date(req.dateRequested).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'

                        const isHalfDay = req.leaveType === 'half_day'

                        return (
                          <tr key={req._id.toString()} className="transition-colors hover:bg-muted/40">
                            <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-muted-foreground" />
                                <span>{dateFormatted}</span>
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
                            <td className="px-6 py-4 text-foreground/85">
                              {req.reason}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {req.status === 'pending' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                  <Clock className="size-3" />
                                  Pending
                                </span>
                              )}
                              {req.status === 'approved' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="size-3" />
                                  Approved
                                </span>
                              )}
                              {req.status === 'denied' && (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-500/20 w-fit">
                                    <XCircle className="size-3" />
                                    Denied
                                  </span>
                                  {req.denialReason && (
                                    <span className="text-[11px] text-rose-600/90 dark:text-rose-400/90 max-w-xs break-words">
                                      <span className="font-semibold">Reason:</span> {req.denialReason}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <DeleteRequestButton requestId={req._id.toString()} />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
