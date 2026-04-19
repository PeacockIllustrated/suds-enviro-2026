import { isAdminAuthenticated } from '@/lib/admin-auth'
import { WelcomeLogin } from '@/components/welcome/WelcomeLogin'
import { WelcomeHub } from '@/components/welcome/WelcomeHub'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome - SuDS Enviro Client Hub',
  description:
    'Private welcome pack for the SuDS Enviro team. Live application, admin portal, review tools and project documents in one place.',
  robots: { index: false, follow: false },
}

export default async function WelcomePage() {
  const authed = await isAdminAuthenticated()
  if (!authed) return <WelcomeLogin />
  return <WelcomeHub />
}
