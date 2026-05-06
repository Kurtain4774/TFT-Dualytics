// Converts Riot API last_round integer to a TFT stage string like "3-2".
// Stage 1 has rounds 1-4 (1-1 through 1-4 carousel).
// Stages 2+ each have 7 rounds (6 combat + 1 carousel/miniboss).
export function lastRoundToStage(round) {
  if (round <= 4) return `1-${round}`
  const r = round - 5
  const stage = 2 + Math.floor(r / 7)
  const sub = (r % 7) + 1
  return `${stage}-${sub}`
}
