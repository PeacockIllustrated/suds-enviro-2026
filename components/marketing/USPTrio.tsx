import { ShieldCheck, Headset, Wrench } from 'lucide-react'
import type { ReactNode } from 'react'

interface USPItem {
  icon: ReactNode
  iconColor: string
  title: string
  description: string
}

const USP_ITEMS: USPItem[] = [
  {
    icon: <ShieldCheck size={40} strokeWidth={1.5} />,
    iconColor: 'text-navy',
    title: 'Reliable Products',
    description:
      'Designed from the ground up and manufactured to our exacting specification and highest standards.',
  },
  {
    icon: <Headset size={40} strokeWidth={1.5} />,
    iconColor: 'text-blue',
    title: 'Fastest Support',
    description:
      'We offer an enormous degree of support and after-sales care. It is simply who we are.',
  },
  {
    icon: <Wrench size={40} strokeWidth={1.5} />,
    iconColor: 'text-green',
    title: 'Bespoke Options',
    description:
      'We understand that not every project is standard. That is why we offer solutions for everyone.',
  },
]

export function USPTrio() {
  return (
    <section className="py-24 md:py-32 bg-[#f8fafb]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USP_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-8 border border-border/60 shadow-sm"
            >
              <div className={`${item.iconColor} mb-5`}>{item.icon}</div>
              <h3 className="text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
