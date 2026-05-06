// Maps CDragon `{{TFT<set>_<TRAIT>_<BUFFNAME>}}` references to their display names.
// Extend this map as new buff references are encountered. Keys are case-insensitive
// (lookup normalizes to UPPER_SNAKE_CASE).
export const BUFF_NAMES = {
  TFT17_SPACEGROOVE_THEGROOVE: 'The Groove',
}

// Title-case fallback when a reference isn't in the map.
// "TFT17_SPACEGROOVE_THEGROOVE" → "Thegroove" (best-effort)
export function fallbackBuffName(ref) {
  const tail = ref.split('_').pop() || ref
  if (!tail) return ref
  return tail.charAt(0).toUpperCase() + tail.slice(1).toLowerCase()
}

export function lookupBuffName(ref) {
  if (!ref) return ''
  const key = ref.toUpperCase()
  return BUFF_NAMES[key] || fallbackBuffName(ref)
}
