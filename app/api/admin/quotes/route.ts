import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

interface CreateQuoteBody {
  configurationId?: string
  enquiryId?: string
  customerName: string
  customerEmail: string
  customerCompany?: string
  lineItems: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  notes?: string
  validDays?: number
}

export async function GET(request: NextRequest) {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = getSupabaseServer()
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')

  let query = supabase
    .from('se_quotes')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,quote_ref.ilike.%${search}%`
    )
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }

  return NextResponse.json({ quotes: data })
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  let body: CreateQuoteBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    configurationId,
    enquiryId,
    customerName,
    customerEmail,
    customerCompany,
    lineItems,
    notes,
    validDays = 30,
  } = body

  if (!customerName || !customerEmail) {
    return NextResponse.json(
      { error: 'customerName and customerEmail are required' },
      { status: 400 }
    )
  }

  if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    return NextResponse.json(
      { error: 'At least one line item is required' },
      { status: 400 }
    )
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const vatRate = 20
  const vat = Math.round(subtotal * (vatRate / 100) * 100) / 100
  const total = Math.round((subtotal + vat) * 100) / 100

  // Generate quote ref
  const year = new Date().getFullYear()
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  const quoteRef = `SE-Q-${year}-${randomSuffix}`

  // Valid until date
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + validDays)

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('se_quotes')
    .insert({
      configuration_id: configurationId || null,
      enquiry_id: enquiryId || null,
      quote_ref: quoteRef,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_company: customerCompany || null,
      line_items: lineItems,
      subtotal,
      vat_rate: vatRate,
      vat,
      total,
      valid_until: validUntil.toISOString().split('T')[0],
      notes: notes || null,
      status: 'draft',
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }

  return NextResponse.json({ quote: data }, { status: 201 })
}
