import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** Leaves draft mode, back to the live site. */
export async function GET(request: Request) {
  ;(await draftMode()).disable()
  const requested = new URL(request.url).searchParams.get('path') ?? '/'
  redirect(requested.startsWith('/') && !requested.startsWith('//') ? requested : '/')
}
