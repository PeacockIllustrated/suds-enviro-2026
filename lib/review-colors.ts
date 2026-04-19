/**
 * Shared visual constants for the reviewer feedback tool.
 * Used by PhoneFrame pin nodes, CommentForm priority pills, and the
 * FeedbackPanel priority dots so the same priority always reads the
 * same colour across the UI.
 */

export type ReviewPriority = 'low' | 'medium' | 'high' | 'critical'

export interface PriorityStyle {
  /** Tailwind classes for a small filled dot (e.g. priority indicator in a list row) */
  dot: string
  /** Tailwind classes for a large filled circle (the pin shown over the iframe) */
  pin: string
  /** Tailwind classes for a soft pill (the priority chip in the comment form) */
  pill: string
  /** Display label */
  label: string
}

export const PRIORITY_STYLES: Record<ReviewPriority, PriorityStyle> = {
  low: {
    dot: 'bg-blue',
    pin: 'bg-blue border-blue',
    pill: 'bg-blue/15 text-blue border-blue/30',
    label: 'Low',
  },
  medium: {
    dot: 'bg-amber-400',
    pin: 'bg-amber-400 border-amber-500',
    pill: 'bg-amber-100 text-amber-700 border-amber-300',
    label: 'Medium',
  },
  high: {
    dot: 'bg-red-500',
    pin: 'bg-red-500 border-red-600',
    pill: 'bg-red-100 text-red-700 border-red-300',
    label: 'High',
  },
  critical: {
    dot: 'bg-purple-500',
    pin: 'bg-purple-500 border-purple-600',
    pill: 'bg-purple-100 text-purple-700 border-purple-300',
    label: 'Critical',
  },
}

export function getPriorityStyle(priority: string): PriorityStyle {
  if (priority in PRIORITY_STYLES) {
    return PRIORITY_STYLES[priority as ReviewPriority]
  }
  return PRIORITY_STYLES.medium
}

export const PRIORITY_ORDER: ReviewPriority[] = ['low', 'medium', 'high', 'critical']

export const CATEGORY_LABELS: Record<string, string> = {
  design: 'Design',
  content: 'Content',
  'product-data': 'Product Data',
  bug: 'Bug',
  feature: 'Feature Request',
  general: 'General',
}
