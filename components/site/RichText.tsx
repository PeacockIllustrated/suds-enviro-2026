import type { Emphasis, RichText as RichTextContent } from '@/lib/content/rich-text'

/**
 * Renders copy stored as emphasis segments.
 *
 * The Webflow site flips which colour carries the emphasis depending on
 * the block - green-on-blue in body copy, blue-on-green in the hero - so
 * the caller passes a `voices` map and this component stays neutral about
 * colour. See reference/webflow/DESIGN.md.
 */

export type VoiceMap = Partial<Record<Emphasis, string>>

/** Body copy: dark blue by default, green for emphasis. */
export const BODY_VOICES: VoiceMap = {
  plain: 'text-site-blue-dark',
  highlight: 'text-site-green',
  lowlight: 'text-site-green',
  italic: 'italic font-bold text-site-green',
  bold: 'font-bold',
}

/** Headings: green by default, bold blue for emphasis. */
export const HEADING_VOICES: VoiceMap = {
  plain: 'text-site-green',
  highlight: 'font-bold text-site-blue',
  lowlight: 'text-site-green',
  italic: 'italic font-bold text-site-green',
  bold: 'font-bold text-site-blue',
}

/** Headings that lead in blue and emphasise in green. */
export const HEADING_VOICES_INVERTED: VoiceMap = {
  plain: 'text-site-blue',
  highlight: 'font-bold text-site-green',
  lowlight: 'text-site-blue',
  italic: 'italic font-bold text-site-green',
  bold: 'font-bold text-site-blue',
}

interface RichTextProps {
  content: RichTextContent
  voices?: VoiceMap
}

export function RichText({ content, voices = BODY_VOICES }: RichTextProps) {
  return (
    <>
      {content.map((segment, i) => {
        const voice = segment.emphasis ?? 'plain'
        const className = voices[voice] ?? voices.plain
        return (
          <span key={i} className={className}>
            {segment.text}
          </span>
        )
      })}
    </>
  )
}
