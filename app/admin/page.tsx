import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from './admin-dashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/admin/login')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return <AdminDashboard email={user.email ?? ''} />
}