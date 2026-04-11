import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

interface PasswordBody {
  currentPassword: string
  newPassword: string
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  let body: PasswordBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Both currentPassword and newPassword are required' },
      { status: 400 }
    )
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: 'New password must be at least 6 characters' },
      { status: 400 }
    )
  }

  // Validate the current password matches the env var
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || currentPassword !== adminPassword) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 403 }
    )
  }

  // In a production environment, you would update the password in a secure store.
  // Since ADMIN_PASSWORD is an environment variable, it cannot be changed at runtime.
  // This endpoint validates the current password and confirms the request.
  return NextResponse.json({
    success: true,
    message: 'Password validated. To change the admin password, update the ADMIN_PASSWORD environment variable in your deployment settings.',
  })
}

export async function DELETE() {
  const authError = await requireAdmin()
  if (authError) return authError

  const supabase = getSupabaseServer()

  // Archive draft configurations older than 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('se_configurations')
    .update({ status: 'archived' })
    .eq('status', 'draft')
    .lt('created_at', thirtyDaysAgo.toISOString())
    .select('id')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to archive configurations' },
      { status: 500 }
    )
  }

  // Log the archive action
  // Audit logging is best-effort, errors are ignored
  await supabase.from('se_audit_log').insert({
    action: 'configurations_archived',
    entity_type: 'configuration',
    details: {
      archived_count: data?.length ?? 0,
      threshold_date: thirtyDaysAgo.toISOString(),
    },
  })

  return NextResponse.json({
    archived: data?.length ?? 0,
  })
}
