import mongoose, { Model, Schema } from 'mongoose'

export type ShiftStatus = 'Confirmed' | 'Pending' | 'Cancelled'

export interface IShift {
  id: string
  date: string
  shift: string
  location: string
  status: ShiftStatus
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

const ShiftSchema = new Schema<IShift>(
  {
    id: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    shift: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: {
        values: ['Confirmed', 'Pending', 'Cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
)

export const Shift: Model<IShift> =
  mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema)

export default Shift
