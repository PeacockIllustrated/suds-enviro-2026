import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { isSignedIn } from '@/lib/site-content/auth'

/**
 * Opens a page of the site in draft mode for the visual editor's canvas.
 * Draft mode makes the page render with the unpublished copy and the
 * editor's invisible markers; only a signed-in editor can switch it on.
 */
export async function GET(request: Request) {
  if (!(await isSignedIn())) redirect('/admin/content')
  ;(await draftMode()).enable()
  const requested = new URL(request.url).searchParams.get('path') ?? '/'
  // Only paths on this site, never an absolute or protocol-relative URL.
  const path = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'
  redirect(path)
}
