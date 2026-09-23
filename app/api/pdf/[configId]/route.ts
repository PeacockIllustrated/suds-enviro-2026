import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { buildSpecSheetData } from '@/lib/pdf/spec-sheet-data'
import { generateSpecSheetHTML } from '@/lib/pdf/spec-sheet'
import type { ProductData } from '@/lib/types'

interface RouteParams {
  params: Promise<{ configId: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { configId } = await params

  if (!configId || typeof configId !== 'string') {
    return NextResponse.json({ error: 'Invalid configId' }, { status: 400 })
  }

  const supabase = getSupabaseServer()
  const startTime = Date.now()

  const { data: config, error } = await supabase
    .from('se_configurations')
    .select('*')
    .eq('id', configId)
    .single()

  if (error || !config) {
    return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
  }

  const productData = config.product_data as ProductData | null
  if (!productData || !productData.data) {
    return NextResponse.json({ error: 'No product data found in configuration' }, { status: 400 })
  }

  // The drawing models a round chamber with clock-position inlets, so
  // only the inspection chamber and catchpit get one. Other products
  // would be drawn with made-up geometry and are refused instead.
  const sheet = buildSpecSheetData(productData, {
    configId: config.id as string,
    quoteRef: (config.quote_ref as string) || null,
    productCode: (config.product_code as string) || null,
    date: new Date().toISOString(),
  })
  if (!sheet) {
    return NextResponse.json(
      { error: 'An engineering drawing is not available for this product' },
      { status: 422 }
    )
  }

  const html = generateSpecSheetHTML(sheet)

  // Fire-and-forget PDF log
  const durationMs = Date.now() - startTime
  void supabase
    .from('se_pdf_logs')
    .insert({
      configuration_id: configId,
      duration_ms: durationMs,
    })
    .then(() => { /* logged */ })

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
