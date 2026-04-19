'use client'

import { useState, type ComponentType, type SVGProps } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Globe,
  Shield,
  MessageSquare,
  FileText,
  BookOpen,
  ListChecks,
  Library,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
  Inbox,
  Wrench,
} from 'lucide-react'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

interface AccessCard {
  href: string
  title: string
  subtitle: string
  description: string
  icon: IconType
  external?: boolean
  highlights: string[]
  accent: 'green' | 'blue' | 'navy'
}

const ACCESS_CARDS: AccessCard[] = [
  {
    href: '/',
    title: 'Live Application',
    subtitle: 'Public-facing site',
    description:
      'The marketing landing page, product catalogue, brochure library and the configurator wizard - everything a customer sees.',
    icon: Globe,
    highlights: ['Marketing landing', '/products catalog', '/configurator wizard', 'Brochure library'],
    accent: 'navy',
  },
  {
    href: '/admin',
    title: 'Admin Portal',
    subtitle: 'Operations + back office',
    description:
      'Six workspaces for managing customer enquiries, saved configurations, quotes, feedback and settings. Sign in with the same team password.',
    icon: Shield,
    highlights: ['Dashboard + stats', 'Enquiries inbox', 'Configurations library', 'Quote builder', 'Feedback triage'],
    accent: 'green',
  },
  {
    href: '/review',
    title: 'Review Tool',
    subtitle: 'Pin and comment on the live app',
    description:
      'Browse the live app inside a phone frame and drop pinned comments anywhere on the page. Three reviewer accounts: Sean, Mark and Test.',
    icon: MessageSquare,
    highlights: ['Pin-drop comments', 'Per-page filtering', 'Priority + category', 'Comments land in /admin/feedback'],
    accent: 'blue',
  },
]

interface DocCard {
  href: string
  title: string
  description: string
  icon: IconType
  meta: string
  external?: boolean
}

const DOC_CARDS: DocCard[] = [
  {
    href: '/project-brochure.html',
    title: 'Project Specification',
    description:
      'The full project scope and capability brochure - what was built and what it does. Click Save as PDF to keep a copy.',
    icon: FileText,
    meta: '7-page A4 brochure',
    external: true,
  },
  {
    href: '/admin-walkthrough.html',
    title: 'Admin Portal Walkthrough',
    description:
      'A guided tour of every admin workspace, with mock screens and a day-in-the-life flow. Hand to anyone joining the team.',
    icon: BookOpen,
    meta: '8-page A4 walkthrough',
    external: true,
  },
  {
    href: '/punch-list.html',
    title: 'Internal Punch List',
    description:
      'Live status of remaining work, broken down by priority. Updated each time something ships.',
    icon: ListChecks,
    meta: '7-page status report',
    external: true,
  },
  {
    href: '/brochures/index.html',
    title: 'Product Brochure Library',
    description:
      'Every product datasheet in one place, including SERSIC, SERFIC, SERS, SERDS, SERF, ROTEX, SEHDS and RHINOLIFT.',
    icon: Library,
    meta: '14 product datasheets',
    external: true,
  },
]

interface QuickStartStep {
  num: number
  title: string
  body: string
}

const QUICK_START: QuickStartStep[] = [
  {
    num: 1,
    title: 'Browse the live application',
    body:
      'Open the public site to see what your customers see. Try the configurator and walk through the wizard for an inspection chamber.',
  },
  {
    num: 2,
    title: 'Sign in to the admin portal',
    body:
      'Same password, different door. The dashboard shows your live pipeline of configurations and enquiries.',
  },
  {
    num: 3,
    title: 'Drop pinned feedback in the review tool',
    body:
      'Anything you want changed - copy, layout, product info - drop a pin on the page and leave a comment. It lands in the feedback workspace.',
  },
  {
    num: 4,
    title: 'Read the project brochure',
    body:
      'For a full overview of what was built, save the project specification as a PDF. The admin walkthrough goes deeper on the back-office side.',
  },
]

const ACCENT_GRADIENT: Record<AccessCard['accent'], string> = {
  green: 'from-green via-green-d to-[#1f7a1e]',
  blue: 'from-blue via-[#0e6a87] to-[#053f54]',
  navy: 'from-navy via-navy-d to-[#001f30]',
}

const ACCENT_GLOW: Record<AccessCard['accent'], string> = {
  green: 'shadow-[0_20px_60px_-20px_rgba(68,175,67,0.5)]',
  blue: 'shadow-[0_20px_60px_-20px_rgba(26,130,162,0.5)]',
  navy: 'shadow-[0_20px_60px_-20px_rgba(0,77,112,0.55)]',
}

export function WelcomeHub() {
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {
      // proceed regardless
    }
    window.location.href = '/welcome'
  }

  return (
    <div className="min-h-dvh bg-[#f4f7fa]">
      {/* HERO */}
      <header className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-d to-[#001f30] text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full bg-green/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 -bottom-40 h-[600px] w-[600px] rounded-full bg-blue/15 blur-3xl" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
          <Image
            src="/logos/suds/logo-slogan-white.png"
            alt="SuDS Enviro"
            width={150}
            height={90}
            className="object-contain"
            priority
          />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-[12px] font-bold text-white/80 backdrop-blur transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? 'Signing out' : 'Sign out'}
          </button>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-8 sm:px-10 sm:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 backdrop-blur">
            <Sparkles className="h-3 w-3 text-green" />
            Welcome Pack &middot; Sean &amp; Mark
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Everything you<br />
            have access to,<br />
            <span className="text-green">in one place.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-[16px]">
            A private hub for the SuDS Enviro team. Jump straight to the live app, the admin portal, the reviewer tools and every supporting document - no hunting for links.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#access"
              className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(68,175,67,0.35)] transition-colors hover:bg-green-d"
            >
              Get started
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#docs"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[13px] font-bold text-white backdrop-blur transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Download documents
            </a>
          </div>

          {/* Stat strip */}
          <div className="mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat icon={Layers} value="11" label="Products live" />
            <HeroStat icon={Inbox} value="6" label="Admin workspaces" />
            <HeroStat icon={Library} value="14" label="Product datasheets" />
            <HeroStat icon={Wrench} value="3" label="Phases shipped" />
          </div>
        </div>
      </header>

      {/* ACCESS CARDS */}
      <section id="access" className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24">
        <SectionHeading
          eyebrow="Your access"
          title="Three doors into the platform."
          subtitle="Each one signs you in with the same team password."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {ACCESS_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
                className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-white p-7 transition-all hover:-translate-y-1 hover:border-border ${ACCENT_GLOW[card.accent]}`}
              >
                {/* Top accent bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENT_GRADIENT[card.accent]}`}
                />

                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENT_GRADIENT[card.accent]} text-white shadow-md`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                  {card.subtitle}
                </div>
                <h3 className="text-[22px] font-extrabold leading-tight text-ink">
                  {card.title}
                </h3>

                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  {card.description}
                </p>

                <ul className="mt-5 space-y-1.5">
                  {card.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-[12px] text-ink/80"
                    >
                      <span className="h-1 w-1 rounded-full bg-green" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-1.5 text-[12px] font-bold text-navy transition-colors group-hover:text-green-d">
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* DOCUMENTS */}
      <section id="docs" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionHeading
            eyebrow="Documents"
            title="Brochures, walkthroughs and status reports."
            subtitle="Each opens in a new tab. Use Save as PDF inside the document to keep a copy."
          />

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DOC_CARDS.map((doc) => {
              const Icon = doc.icon
              return (
                <a
                  key={doc.href}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-5 rounded-2xl border border-border/60 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-[0_4px_24px_rgba(0,77,112,0.12)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/8 text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[16px] font-extrabold leading-tight text-ink">
                        {doc.title}
                      </h3>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy" />
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                      {doc.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                      {doc.meta}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* QUICK START */}
      <section className="bg-light">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionHeading
            eyebrow="Quick start"
            title="A four-step tour for your first session."
          />

          <div className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-4">
            {QUICK_START.map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-border/60 bg-white p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-[15px] font-extrabold text-white shadow-sm">
                  {step.num}
                </div>
                <h3 className="text-[14px] font-extrabold leading-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <div className="flex items-center gap-4">
            <Image
              src="/logos/suds/logo-slogan-main.png"
              alt="SuDS Enviro"
              width={130}
              height={78}
              className="object-contain"
            />
            <div className="border-l border-border pl-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
                Client Hub
              </div>
              <div className="text-[12px] text-ink">SuDS Enviro Configurator</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:hello@sudsenviro.com"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[12px] font-bold text-ink transition-colors hover:bg-light"
            >
              hello@sudsenviro.com
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[12px] font-bold text-muted transition-colors hover:bg-light hover:text-ink disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-d">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[14px] leading-relaxed text-muted">{subtitle}</p>
      )}
    </div>
  )
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: IconType
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <Icon className="mb-2 h-4 w-4 text-green" />
      <div className="text-[24px] font-extrabold text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/50">
        {label}
      </div>
    </div>
  )
}
