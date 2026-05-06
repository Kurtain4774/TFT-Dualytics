export function placementBucket(avgPlacement) {
  return Math.max(1, Math.min(4, Math.round(avgPlacement)))
}

export function formatGames(playCount) {
  return `${playCount} ${playCount === 1 ? 'game' : 'games'}`
}

export function formatPairings(pairCount) {
  return `${pairCount} ${pairCount === 1 ? 'game' : 'games'}`
}

export function formatWinRate(winRate) {
  return `${(winRate * 100).toFixed(1)}% win`
}

export function formatAveragePlacement(avgPlacement) {
  return `Avg ${avgPlacement.toFixed(2)}`
}
