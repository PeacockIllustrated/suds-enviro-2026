import { NextRequest, NextResponse } from 'next/server'
import { loginReviewer, logoutReviewer } from '@/lib/review-auth'

interface LoginBody {
  password: string
  author: string
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

  const { password, author } = body

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'password is required' },
      { status: 400 }
    )
  }

  if (!author || typeof author !== 'string') {
    return NextResponse.json(
      { error: 'author is required' },
      { status: 400 }
    )
  }

  const success = await loginReviewer(password, author)

  if (!success) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  await logoutReviewer()
  return NextResponse.json({ success: true })
}
