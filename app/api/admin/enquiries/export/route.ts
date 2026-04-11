import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const product = searchParams.get('product')

  const supabase = getSupabaseServer()

  let query = supabase
    .from('se_enquiry_dashboard')
    .select('*')

  if (status) {
    query = query.eq('status', status)
  }

  if (product) {
    query = query.eq('product', product)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch enquiries for export' },
      { status: 500 }
    )
  }

  const rows = data || []

  // Build CSV
  const headers = [
    'ID',
    'Date',
    'Name',
    'Email',
    'Company',
    'Phone',
    'Product Type',
    'Product Code',
    'Status',
    'Notes',
    'Admin Notes',
  ]

  const csvRows = [headers.join(',')]

  for (const row of rows) {
    const r = row as Record<string, unknown>
    const values = [
      escapeCSV(String(r.id || '')),
      escapeCSV(String(r.created_at || '')),
      escapeCSV(String(r.name || '')),
      escapeCSV(String(r.email || '')),
      escapeCSV(String(r.company || '')),
      escapeCSV(String(r.phone || '')),
      escapeCSV(String(r.product_type || r.product || '')),
      escapeCSV(String(r.product_code || '')),
      escapeCSV(String(r.status || '')),
      escapeCSV(String(r.notes || '')),
      escapeCSV(String(r.admin_notes || '')),
    ]
    csvRows.push(values.join(','))
  }

  const csv = csvRows.join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="enquiries-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
