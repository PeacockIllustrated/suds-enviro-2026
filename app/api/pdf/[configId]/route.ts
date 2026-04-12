import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { generateCompliance, generateProductCode } from '@/lib/rule-engine'
import { generateDrawingHTML } from '@/lib/pdf/drawing-template'
import type { ChamberBaseFields, WizardState } from '@/lib/types'

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

  // Extract chamber data from the product_data JSONB
  const productData = config.product_data as { kind: string; data: ChamberBaseFields } | null
  if (!productData || !productData.data) {
    return NextResponse.json({ error: 'No product data found in configuration' }, { status: 400 })
  }

  const chamberData = productData.data

  // Reconstruct a minimal WizardState for code/compliance generation
  const wizardState: WizardState = {
    step: (config.wizard_step as number) || 9,
    product: (config.product as WizardState['product']) || 'chamber',
    productData: productData as WizardState['productData'],
    configId: config.id as string,
  }

  const productCode = (config.product_code as string) || generateProductCode(wizardState)
  const compliance = generateCompliance(wizardState)

  // Determine outlet size
  const outletSize = chamberData.outletLocked
    || chamberData.pipeSizes?.outlet
    || '160mm EN1401'

  const html = generateDrawingHTML({
    productCode,
    quoteRef: (config.quote_ref as string) || null,
    diameter: chamberData.diameter || 600,
    depth: chamberData.depth || 1500,
    inletCount: chamberData.inletCount || 1,
    positions: (chamberData.positions || []) as string[],
    pipeSizes: (chamberData.pipeSizes || {}) as Record<string, string>,
    outletSize,
    outletLocked: chamberData.outletLocked !== null && chamberData.outletLocked !== undefined,
    systemType: chamberData.systemType || 'surface',
    adoptable: chamberData.adoptable ?? false,
    flowControl: chamberData.flowControl ?? false,
    flowType: chamberData.flowType || null,
    flowRate: chamberData.flowRate || '',
    compliance,
    date: new Date().toISOString(),
  })

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
