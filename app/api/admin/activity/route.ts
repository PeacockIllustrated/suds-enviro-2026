import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const supabase = getSupabaseServer()

  const { data, error, count } = await supabase
    .from('se_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    // If the table doesn't exist yet, return empty results gracefully
    return NextResponse.json({
      activities: [],
      total: 0,
    })
  }

  return NextResponse.json({
    activities: data || [],
    total: count ?? 0,
  })
}
