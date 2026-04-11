import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

interface StatusCount {
  status: string
  count: number
}

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const supabase = getSupabaseServer()

  // Run all count queries in parallel
  const [
    configsResult,
    enquiriesResult,
    enquiryNewResult,
    enquiryReviewedResult,
    enquiryQuotedResult,
    enquiryClosedResult,
    configsByProductResult,
  ] = await Promise.all([
    // Total configurations
    supabase
      .from('se_configurations')
      .select('*', { count: 'exact', head: true }),

    // Total enquiries
    supabase
      .from('se_enquiries')
      .select('*', { count: 'exact', head: true }),

    // Enquiries by status
    supabase
      .from('se_enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabase
      .from('se_enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'reviewed'),
    supabase
      .from('se_enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'quoted'),
    supabase
      .from('se_enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed'),

    // Configs grouped by product - fetch distinct products with counts
    supabase
      .from('se_configurations')
      .select('product'),
  ])

  // Check for errors on critical queries
  if (configsResult.error || enquiriesResult.error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }

  // Build enquiries_by_status
  const enquiries_by_status: StatusCount[] = [
    { status: 'new', count: enquiryNewResult.count ?? 0 },
    { status: 'reviewed', count: enquiryReviewedResult.count ?? 0 },
    { status: 'quoted', count: enquiryQuotedResult.count ?? 0 },
    { status: 'closed', count: enquiryClosedResult.count ?? 0 },
  ]

  // Build configs_by_product from raw rows
  const productCounts: Record<string, number> = {}
  if (configsByProductResult.data) {
    for (const row of configsByProductResult.data) {
      const product = (row.product as string) || 'unknown'
      productCounts[product] = (productCounts[product] || 0) + 1
    }
  }

  const configs_by_product = Object.entries(productCounts).map(
    ([product, count]) => ({ product, count })
  )

  return NextResponse.json({
    total_configurations: configsResult.count ?? 0,
    total_enquiries: enquiriesResult.count ?? 0,
    enquiries_by_status,
    configs_by_product,
  })
}
