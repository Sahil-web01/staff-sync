import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Shift from '@/models/Shift'

export async function GET() {
  try {
    await connectDB()
    const shifts = await Shift.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json({
      success: true,
      data: shifts,
      count: shifts.length,
      database: 'staffsync',
    })
  } catch (error) {
    console.error('Error fetching shifts:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch shifts'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { id, date, shift, location, status, notes } = body

    if (!date || !shift || !location) {
      return NextResponse.json(
        { success: false, error: 'Date, shift time, and location are required' },
        { status: 400 }
      )
    }

    const shiftId = id || `SH-${Math.floor(1000 + Math.random() * 9000)}`
    const newShift = await Shift.create({
      id: shiftId,
      date,
      shift,
      location,
      status: status || 'Confirmed',
      notes,
    })

    return NextResponse.json({ success: true, data: newShift }, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)
    const message = error instanceof Error ? error.message : 'Failed to create shift'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Shift ID is required' }, { status: 400 })
    }

    const result = await Shift.findOneAndDelete({ id })
    if (!result) {
      return NextResponse.json({ success: false, error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Shift deleted successfully' })
  } catch (error) {
    console.error('Error deleting shift:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete shift'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
