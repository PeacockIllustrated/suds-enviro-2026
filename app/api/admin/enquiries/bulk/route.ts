import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

interface BulkPatchBody {
  ids: string[]
  status: string
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  let body: BulkPatchBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { ids, status } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: 'ids must be a non-empty array' },
      { status: 400 }
    )
  }

  const validStatuses = ['new', 'reviewed', 'quoted', 'closed']
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate all IDs are UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const invalidIds = ids.filter((id) => !uuidRegex.test(id))
  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: 'One or more IDs are not valid UUIDs' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServer()

  // Build the update payload
  const update: Record<string, string> = { status }
  if (status === 'quoted') {
    update.quoted_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('se_enquiries')
    .update(update)
    .in('id', ids)
    .select('id, status')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update enquiries' },
      { status: 500 }
    )
  }

  // Insert audit log entries for each updated enquiry
  const auditEntries = ids.map((id) => ({
    action: `enquiry_status_bulk_changed_to_${status}`,
    entity_type: 'enquiry',
    entity_id: id,
    details: { new_status: status, bulk: true },
  }))

  // Audit logging is best-effort, errors are ignored
  await supabase.from('se_audit_log').insert(auditEntries)

  return NextResponse.json({
    updated: data?.length ?? 0,
    ids: data?.map((d) => d.id) ?? [],
  })
}
