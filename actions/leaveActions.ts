'use server'

import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import LeaveRequest, { type LeaveType } from '@/models/LeaveRequest'
import { revalidatePath } from 'next/cache'

export interface ActionResponse {
  success: boolean
  message?: string
  error?: string
  requestId?: string
}

export async function submitLeaveRequest(
  date: string | Date,
  reason: string,
  leaveType: LeaveType = 'full_day'
): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be logged in to request time off.' }
    }

    const userCompanyId = session.user.companyId || 'default-org'

    if (!date || !reason?.trim()) {
      return { success: false, error: 'Date and reason are required.' }
    }

    await connectDB()

    const chosenType: LeaveType = leaveType === 'half_day' ? 'half_day' : 'full_day'

    const request = await LeaveRequest.create({
      employeeId: session.user.id,
      companyId: userCompanyId,
      dateRequested: new Date(date),
      reason: reason.trim(),
      leaveType: chosenType,
      status: 'pending',
    })

    revalidatePath('/employee')
    revalidatePath('/admin')

    return {
      success: true,
      message: `${chosenType === 'half_day' ? 'Half-day' : 'Full-day'} leave request submitted successfully.`,
      requestId: request._id.toString(),
    }
  } catch (error) {
    console.error('submitLeaveRequest failed:', error)
    return { success: false, error: 'Failed to submit leave request. Please try again.' }
  }
}

export async function approveLeave(id: string): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin permissions required.' }
    }

    await connectDB()

    const filter: Record<string, unknown> = { _id: id }
    if (session.user.companyId) {
      filter.companyId = session.user.companyId
    }

    const updated = await LeaveRequest.findOneAndUpdate(filter, { status: 'approved' })
    if (!updated) {
      return { success: false, error: 'Leave request not found or not in your organization.' }
    }

    revalidatePath('/admin')
    revalidatePath('/employee')

    return { success: true, message: 'Leave request approved successfully.' }
  } catch (error) {
    console.error('approveLeave failed:', error)
    return { success: false, error: 'Failed to approve leave request.' }
  }
}

export async function denyLeave(id: string, reason?: string): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin permissions required.' }
    }

    await connectDB()

    const filter: Record<string, unknown> = { _id: id }
    if (session.user.companyId) {
      filter.companyId = session.user.companyId
    }

    const denialReason = reason?.trim() || 'No reason provided'

    const updated = await LeaveRequest.findOneAndUpdate(
      filter,
      { status: 'denied', denialReason }
    )
    if (!updated) {
      return { success: false, error: 'Leave request not found or not in your organization.' }
    }

    revalidatePath('/admin')
    revalidatePath('/employee')

    return { success: true, message: 'Leave request denied successfully.' }
  } catch (error) {
    console.error('denyLeave failed:', error)
    return { success: false, error: 'Failed to deny leave request.' }
  }
}

export async function deleteLeaveRequest(id: string): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be logged in to delete a request.' }
    }

    await connectDB()

    const query: Record<string, unknown> = { _id: id }
    if (session.user.companyId) {
      query.companyId = session.user.companyId
    }

    if (session.user.role !== 'admin') {
      query.employeeId = session.user.id
    }

    const deleted = await LeaveRequest.findOneAndDelete(query)
    if (!deleted) {
      return { success: false, error: 'Leave request not found or not authorized to delete.' }
    }

    revalidatePath('/admin')
    revalidatePath('/employee')

    return { success: true, message: 'Leave request deleted successfully.' }
  } catch (error) {
    console.error('deleteLeaveRequest failed:', error)
    return { success: false, error: 'Failed to delete leave request.' }
  }
}
