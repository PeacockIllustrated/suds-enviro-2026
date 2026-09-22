/**
 * Rich text primitives for marketing copy.
 *
 * The Webflow site sets long headings as a run of spans, alternating a plain
 * voice with one or two emphasised voices. Modelling copy as segments rather
 * than a single string keeps that two-tone treatment intact without embedding
 * markup in the content files.
 */

/**
 * Which voice a segment is spoken in - not which colour it takes.
 *
 * The Webflow site flips the polarity between blocks: in the hero the
 * plain text is green and the emphasised spans are bold blue, while in
 * body copy the plain text is dark blue and the emphasised words are
 * green. So the component decides the colour for each voice; the content
 * only says which voice it is. See reference/webflow/DESIGN.md.
 */
export type Emphasis =
  /** The block's default voice. */
  | 'plain'
  /** The block's emphasised voice. */
  | 'highlight'
  /** A receded voice, used for problem statements. */
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
