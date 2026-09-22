/**
 * Rich text primitives for marketing copy.
 *
 * The Webflow site sets long headings as a run of spans, alternating a plain
 * voice with one or two emphasised voices. Modelling copy as segments rather
 * than a single string keeps that two-tone treatment intact without embedding
 * markup in the content files.
 */

export type Emphasis =
  /** Plain body voice. */
  | 'plain'
  /** The accent voice - brand green on the Webflow site. */
  | 'highlight'
  /** The receded voice used for problem statements. */
  | 'lowlight'
  /** Italic, used for the sub-brand names (RoFlo, multiFlo, autoFlo). */
  | 'italic'
  /** Heavier weight within a run of normal text. */
  | 'bold'

export interface Segment {
  text: string
  emphasis?: Emphasis
}

/** A heading or paragraph built from emphasis segments. */
export type RichText = Segment[]

/** Flattens rich text to a plain string, for alt text, SEO and aria labels. */
export function toPlainText(rich: RichText): string {
  return rich
    .map((s) => s.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}
