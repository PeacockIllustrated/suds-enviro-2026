import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

interface SubmitEnquiryBody {
  configurationId?: string
  name: string
  company?: string
  email: string
  phone?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  let body: SubmitEnquiryBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { configurationId, name, company, email, phone, notes } = body

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'name is required' },
      { status: 400 }
    )
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return NextResponse.json(
      { error: 'email is required' },
      { status: 400 }
    )
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServer()

  // Insert the enquiry
  const { data, error } = await supabase
    .from('se_enquiries')
    .insert({
      configuration_id: configurationId || null,
      name: name.trim(),
      company: company?.trim() || null,
      email: email.trim(),
      phone: phone?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    )
  }

  // If a configurationId was provided, update the configuration status to 'submitted'
  if (configurationId) {
    const { error: updateError } = await supabase
      .from('se_configurations')
      .update({ status: 'submitted' })
      .eq('id', configurationId)

    if (updateError) {
      // Log but don't fail the enquiry submission
      console.error('Failed to update configuration status:', updateError.message)
    }
  }

  return NextResponse.json({
    enquiryId: data.id as string,
  })
}
