import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid enquiry ID format' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServer()

  // Fetch the enquiry
  const { data: enquiry, error: enquiryError } = await supabase
    .from('se_enquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (enquiryError || !enquiry) {
    return NextResponse.json(
      { error: 'Enquiry not found' },
      { status: 404 }
    )
  }

  // Fetch linked configuration if present
  let configuration = null
  if (enquiry.configuration_id) {
    const { data: config } = await supabase
      .from('se_configurations')
      .select('*')
      .eq('id', enquiry.configuration_id)
      .single()

    configuration = config
  }

  return NextResponse.json({
    ...enquiry,
    configuration,
  })
}

interface PatchBody {
  status?: string
  admin_notes?: string
  quoted_by?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid enquiry ID format' },
      { status: 400 }
    )
  }

  let body: PatchBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate status if provided
  const validStatuses = ['new', 'reviewed', 'quoted', 'closed']
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  // Build the update object
  const update: Record<string, string | null> = {}

  if (body.status !== undefined) {
    update.status = body.status
  }

  if (body.admin_notes !== undefined) {
    update.admin_notes = body.admin_notes
  }

  if (body.quoted_by !== undefined) {
    update.quoted_by = body.quoted_by
  }

  // If status changes to 'quoted', set quoted_at
  if (body.status === 'quoted') {
    update.quoted_at = new Date().toISOString()
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: 'No fields to update' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('se_enquiries')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
