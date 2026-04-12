import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const { id } = await params
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('se_quotes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  return NextResponse.json({ quote: data })
}

interface PatchQuoteBody {
  lineItems?: { description: string; quantity: number; unitPrice: number; total: number }[]
  notes?: string
  status?: string
  terms?: string
  valid_until?: string
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const { id } = await params

  let body: PatchQuoteBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  // Build update object
  const update: Record<string, unknown> = {}

  if (body.lineItems !== undefined) {
    update.line_items = body.lineItems
    // Recalculate totals
    const subtotal = body.lineItems.reduce((sum, item) => sum + item.total, 0)

    // Get existing vat_rate
    const { data: existing } = await supabase
      .from('se_quotes')
      .select('vat_rate')
      .eq('id', id)
      .single()

    const vatRate = existing ? (existing.vat_rate as number) : 20
    const vat = Math.round(subtotal * (vatRate / 100) * 100) / 100
    const total = Math.round((subtotal + vat) * 100) / 100

    update.subtotal = subtotal
    update.vat = vat
    update.total = total
  }

  if (body.notes !== undefined) update.notes = body.notes
  if (body.terms !== undefined) update.terms = body.terms
  if (body.valid_until !== undefined) update.valid_until = body.valid_until
  if (body.status !== undefined) update.status = body.status

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('se_quotes')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }

  return NextResponse.json({ quote: data })
}
