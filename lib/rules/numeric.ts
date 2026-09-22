/**
 * Numeric input helpers shared by the product rule engines and the
 * wizard steps' canProceed checks, so the Next button and the review
 * validation always agree on what counts as a usable number.
 */

export function isPositiveNumber(value: string | null | undefined): boolean {
  if (value === null || value === undefined || value.trim() === '') return false
  const n = Number(value)
  return Number.isFinite(n) && n > 0
}
