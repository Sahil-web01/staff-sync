import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const filter: Record<string, unknown> = {}
    if (session.user.role === 'admin') {
      if (session.user.companyId) {
        filter.companyId = session.user.companyId
      }
    } else {
      filter.employeeId = session.user.id
      if (session.user.companyId) {
        filter.companyId = session.user.companyId
      }
    }

    const requests = await LeaveRequest.find(filter)
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch leave requests'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.companyId) {
      return NextResponse.json({ error: 'No company assigned to user account' }, { status: 400 })
    }

    const { dateRequested, reason, leaveType } = await req.json()

    if (!dateRequested || !reason?.trim()) {
      return NextResponse.json(
        { error: 'Date and reason are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const chosenType = leaveType === 'half_day' ? 'half_day' : 'full_day'

    const request = await LeaveRequest.create({
      employeeId: session.user.id,
      companyId: session.user.companyId,
      dateRequested: new Date(dateRequested),
      reason: reason.trim(),
      leaveType: chosenType,
      status: 'pending',
    })

    return NextResponse.json(
      { success: true, message: 'Leave request submitted successfully', data: request },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting leave request:', error)
    const message = error instanceof Error ? error.message : 'Failed to submit leave request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
