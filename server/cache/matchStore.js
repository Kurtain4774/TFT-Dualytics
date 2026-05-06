const MAX_PUUIDS = 200

const store = new Map()
const rankCache = new Map()

export const getEntry = (puuid) => store.get(puuid)

export const getParticipantRank = (puuid) => rankCache.get(puuid)
export const setParticipantRank = (puuid, info) => rankCache.set(puuid, info ?? null)
export const hasParticipantRank = (puuid) => rankCache.has(puuid)

export const setRankInfo = (puuid, rankInfo) => {
  const entry = store.get(puuid)
  if (entry) entry.rankInfo = rankInfo
  rankCache.set(puuid, rankInfo)
}

export const initEntry = (puuid) => {
  const entry = {
    matchIds: new Set(),
    matches: [],
    latestGameDatetime: 0,
    syncing: false,
    pendingCount: 0,
    lastSyncedAt: Date.now(),
    failedIds: new Set(),
    rankInfo: null,
  }
  store.set(puuid, entry)
  evictIfNeeded()
  return entry
}

export const hasMatchId = (puuid, matchId) => {
  const entry = store.get(puuid)
  if (!entry) return false
  return entry.matchIds.has(matchId) || entry.failedIds.has(matchId)
}

export const upsertMatches = (puuid, normalized) => {
  const entry = store.get(puuid)
  if (!entry) return
  for (const match of normalized) {
    if (!match?.matchId || entry.matchIds.has(match.matchId)) continue
    entry.matchIds.add(match.matchId)
    entry.matches.push(match)
    if (match.date > entry.latestGameDatetime) {
      entry.latestGameDatetime = match.date
    }
  }
  entry.lastSyncedAt = Date.now()
}

export const markFailed = (puuid, matchId) => {
  const entry = store.get(puuid)
  if (!entry) return
  entry.failedIds.add(matchId)
}

export const setPendingCount = (puuid, n) => {
  const entry = store.get(puuid)
  if (!entry) return
  entry.pendingCount = n
}

export const decrementPendingCount = (puuid) => {
  const entry = store.get(puuid)
  if (!entry) return
  entry.pendingCount = Math.max(0, entry.pendingCount - 1)
}

export const markSyncing = (puuid, value) => {
  const entry = store.get(puuid)
  if (!entry) return
  entry.syncing = value
  entry.lastSyncedAt = Date.now()
}

function evictIfNeeded() {
  if (store.size <= MAX_PUUIDS) return
  let oldestKey = null
  let oldestAt = Infinity
  for (const [key, entry] of store) {
    if (entry.syncing) continue
    if (entry.lastSyncedAt < oldestAt) {
      oldestAt = entry.lastSyncedAt
      oldestKey = key
    }
  }
  if (oldestKey) store.delete(oldestKey)
}
