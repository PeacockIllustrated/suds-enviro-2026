import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { isReviewerAuthenticated } from '@/lib/review-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/review/feedback/[id]
 * Fetch a single feedback item by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('se_feedback')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Feedback not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ feedback: data })
}

interface PatchBody {
  status?: string
  dev_notes?: string
}

/**
 * PATCH /api/review/feedback/[id]
 * Update feedback status or dev notes.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  let body: PatchBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServer()

  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    updates.status = body.status

    // Set resolved_at when status changes to resolved
    if (body.status === 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }
  }

  if (body.dev_notes !== undefined) {
    updates.dev_notes = body.dev_notes
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('se_feedback')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }

  return NextResponse.json({ feedback: data })
}

/**
 * DELETE /api/review/feedback/[id]
 * Permanently delete a feedback item. Reviewer-only - requires the reviewer
 * session cookie. The admin dashboard goes through a different code path.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const authed = await isReviewerAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseServer()

  const { error } = await supabase
    .from('se_feedback')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
