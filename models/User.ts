import mongoose, { Document, Model, Schema } from 'mongoose'

export type UserRole = 'admin' | 'employee'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  companyId: string
  lastActive?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'employee'],
        message: '{VALUE} is not a valid role',
      },
      default: 'employee',
      required: true,
    },
    companyId: {
      type: String,
      required: [true, 'Please provide a company ID'],
      trim: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
