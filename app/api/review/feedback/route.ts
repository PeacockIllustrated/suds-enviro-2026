import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

interface FeedbackBody {
  author: string
  page_url: string
  page_title?: string
  section?: string
  pin_x?: number
  pin_y?: number
  comment: string
  priority?: string
  category?: string
  structured_data?: Record<string, string>[] | null
}

/**
 * GET /api/review/feedback
 * List feedback with optional filters.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page_url = searchParams.get('page_url')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const category = searchParams.get('category')
  const author = searchParams.get('author')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = getSupabaseServer()

  let query = supabase
    .from('se_feedback')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (page_url) {
    query = query.eq('page_url', page_url)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (author) {
    query = query.eq('author', author)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    feedback: data || [],
    total: count ?? 0,
  })
}

/**
 * POST /api/review/feedback
 * Create new feedback item.
 */
export async function POST(request: NextRequest) {
  let body: FeedbackBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  if (!body.comment || typeof body.comment !== 'string') {
    return NextResponse.json(
      { error: 'comment is required' },
      { status: 400 }
    )
  }

  if (!body.author || typeof body.author !== 'string') {
    return NextResponse.json(
      { error: 'author is required' },
      { status: 400 }
    )
  }

  if (!body.page_url || typeof body.page_url !== 'string') {
    return NextResponse.json(
      { error: 'page_url is required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServer()

  const insertData: Record<string, unknown> = {
    author: body.author,
    page_url: body.page_url,
    comment: body.comment,
  }

  if (body.page_title) insertData.page_title = body.page_title
  if (body.section) insertData.section = body.section
  if (body.pin_x !== undefined) insertData.pin_x = body.pin_x
  if (body.pin_y !== undefined) insertData.pin_y = body.pin_y
  if (body.priority) insertData.priority = body.priority
  if (body.category) insertData.category = body.category
  if (body.structured_data) insertData.structured_data = body.structured_data

  const { data, error } = await supabase
    .from('se_feedback')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }

  return NextResponse.json({ feedback: data }, { status: 201 })
}
