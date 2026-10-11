import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export type LeaveStatus = 'pending' | 'approved' | 'denied'
export type LeaveType = 'full_day' | 'half_day'

export interface ILeaveRequest extends Document {
  employeeId: Types.ObjectId
  companyId: string
  dateRequested: Date
  reason: string
  status: LeaveStatus
  leaveType: LeaveType
  denialReason?: string
  createdAt: Date
  updatedAt: Date
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an employee ID'],
    },
    companyId: {
      type: String,
      required: [true, 'Please provide a company ID'],
      trim: true,
    },
    dateRequested: {
      type: Date,
      required: [true, 'Please provide the requested date'],
      default: Date.now,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave request'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'denied'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    leaveType: {
      type: String,
      enum: {
        values: ['full_day', 'half_day'],
        message: '{VALUE} is not a valid leave type',
      },
      default: 'full_day',
      required: true,
    },
    denialReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models && mongoose.models.LeaveRequest) {
  delete mongoose.models.LeaveRequest
}

export const LeaveRequest: Model<ILeaveRequest> =
  mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema)

export default LeaveRequest
