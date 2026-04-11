'use client'

import { Database, Inbox, Clock, CheckCircle } from 'lucide-react'

interface StatsData {
  total_configurations: number
  total_enquiries: number
  enquiries_by_status: { status: string; count: number }[]
}

interface StatsCardsProps {
  stats: StatsData
}

export function StatsCards({ stats }: StatsCardsProps) {
  const getStatusCount = (status: string): number => {
    const match = stats.enquiries_by_status.find((s) => s.status === status)
    return match?.count ?? 0
  }

  const cards = [
    {
      label: 'Total Configurations',
      value: stats.total_configurations,
      accent: 'bg-navy',
      icon: Database,
      iconColor: 'text-navy',
    },
    {
      label: 'Total Enquiries',
      value: stats.total_enquiries,
      accent: 'bg-blue',
      icon: Inbox,
      iconColor: 'text-blue',
    },
    {
      label: 'Pending Review',
      value: getStatusCount('new'),
      accent: 'bg-amber-500',
      icon: Clock,
      iconColor: 'text-amber-600',
    },
    {
      label: 'Quoted',
      value: getStatusCount('quoted'),
      accent: 'bg-green',
      icon: CheckCircle,
      iconColor: 'text-green-d',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm"
          >
            <div className={`h-1 ${card.accent}`} />
            <div className="flex items-start gap-3 p-5">
              <div className={`mt-0.5 ${card.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[28px] font-extrabold leading-none text-ink">
                  {card.value}
                </div>
                <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {card.label}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
