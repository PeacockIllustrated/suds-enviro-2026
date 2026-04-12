import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { generateProductCode, generateCompliance } from '@/lib/rule-engine'
import type { WizardState } from '@/lib/types'

interface SaveConfigBody {
  sessionId: string
  state: WizardState
}

export async function POST(request: NextRequest) {
  let body: SaveConfigBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { sessionId, state } = body

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    )
  }

  if (!state) {
    return NextResponse.json(
      { error: 'state is required' },
      { status: 400 }
    )
  }

  const productCode = generateProductCode(state)
  const compliance = generateCompliance(state)

  const row = {
    session_id: sessionId,
    product: state.product,
    product_data: state.productData,
    product_code: productCode,
    compliance,
    wizard_step: state.step,
    status: 'draft' as const,
  }

  const supabase = getSupabaseServer()

  // Check for existing draft by session_id
  const { data: existing, error: lookupError } = await supabase
    .from('se_configurations')
    .select('id')
    .eq('session_id', sessionId)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json(
      { error: 'Failed to look up existing configuration' },
      { status: 500 }
    )
  }

  if (existing) {
    // Update existing draft
    const { data, error } = await supabase
      .from('se_configurations')
      .update(row)
      .eq('id', existing.id)
      .select('id, product_code, quote_ref')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Failed to update configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      configId: data.id as string,
      productCode: data.product_code as string,
      quoteRef: (data.quote_ref as string) || null,
    })
  }

  // Insert new configuration
  const { data, error } = await supabase
    .from('se_configurations')
    .insert(row)
    .select('id, product_code')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }

  // Generate quote reference: SE-Q-{year}-{first 4 chars of UUID uppercase}
  const configId = data.id as string
  const year = new Date().getFullYear()
  const quoteRef = `SE-Q-${year}-${configId.slice(0, 4).toUpperCase()}`

  // Update with quote_ref (fire-and-forget to not block response)
  void supabase
    .from('se_configurations')
    .update({ quote_ref: quoteRef })
    .eq('id', configId)
    .then(() => { /* updated */ })

  return NextResponse.json({
    configId,
    productCode: data.product_code as string,
    quoteRef,
  })
}
