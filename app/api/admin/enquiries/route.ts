import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const product = searchParams.get('product')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const supabase = getSupabaseServer()

  // Query the dashboard view for joined data
  let query = supabase
    .from('se_enquiry_dashboard')
    .select('*', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  if (product) {
    query = query.eq('product', product)
  }

  if (search) {
    // Search across name, email, and product_code
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,product_code.ilike.%${search}%`)
  }

  // Apply sort - only allow known column names to prevent injection
  const allowedSorts = ['created_at', 'name', 'email', 'status']
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at'
  const ascending = order === 'asc'

  query = query
    .order(sortColumn, { ascending })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    enquiries: data || [],
    total: count ?? 0,
  })
}
