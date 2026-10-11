import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SignupForm from './signup-form'

export const metadata = {
  title: 'Sign Up | StaffSync',
  description: 'Create a new StaffSync account to manage shifts and schedules.',
}

export default async function SignupPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return <SignupForm />
}
