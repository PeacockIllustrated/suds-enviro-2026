import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ ref: string }>
}

interface StatusResponse {
  product: string | null
  product_code: string | null
  quote_ref: string | null
  status: string
  created_at: string
  updated_at: string
  quote_status: string | null
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { ref } = await params

  if (!ref || typeof ref !== 'string') {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  // Look up configuration by quote_ref
  const { data: config, error } = await supabase
    .from('se_configurations')
    .select('id, product, product_code, quote_ref, status, created_at, updated_at')
    .eq('quote_ref', ref)
    .single()

  if (error || !config) {
    return NextResponse.json(
      { error: 'Configuration not found. Please check your reference number.' },
      { status: 404 }
    )
  }

  // Check if there's a linked enquiry with a quote
  let quoteStatus: string | null = null
  const { data: enquiry } = await supabase
    .from('se_enquiries')
    .select('status')
    .eq('configuration_id', config.id as string)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (enquiry) {
    quoteStatus = enquiry.status as string
  }

  // Also check if there's a quote record
  const { data: quote } = await supabase
    .from('se_quotes')
    .select('status')
    .eq('configuration_id', config.id as string)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (quote) {
    quoteStatus = quote.status as string
  }

  const response: StatusResponse = {
    product: config.product as string | null,
    product_code: config.product_code as string | null,
    quote_ref: config.quote_ref as string | null,
    status: config.status as string,
    created_at: config.created_at as string,
    updated_at: config.updated_at as string,
    quote_status: quoteStatus,
  }

  return NextResponse.json(response)
}
