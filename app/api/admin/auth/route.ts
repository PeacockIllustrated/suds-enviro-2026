import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin, logoutAdmin } from '@/lib/admin-auth'

interface LoginBody {
  password: string
}

export async function POST(request: NextRequest) {
  let body: LoginBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { password } = body

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'password is required' },
      { status: 400 }
    )
  }

  const success = await loginAdmin(password)

  if (!success) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  await logoutAdmin()
  return NextResponse.json({ success: true })
}
