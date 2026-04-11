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
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const supabase = getSupabaseServer()

  let query = supabase
    .from('se_configurations')
    .select('*', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  if (product) {
    query = query.eq('product', product)
  }

  if (search) {
    // Search by product_code
    query = query.ilike('product_code', `%${search}%`)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    configurations: data || [],
    total: count ?? 0,
  })
}
