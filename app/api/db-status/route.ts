import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const db = await connectDB()
    const state = mongoose.connection.readyState
    const stateLabels: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    }

    return NextResponse.json({
      status: state === 1 ? 'healthy' : 'degraded',
      connected: state === 1,
      database: db.connection.name,
      host: db.connection.host,
      state: stateLabels[state] || 'Unknown',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database connection error'
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
