import { getRankSnapshotsCollection } from './mongo.js'

// Compact, append-on-change rank snapshots used to draw an LP graph over time.
// Riot's match-v5 payload does not include LP, so we capture (tier, rank, lp)
// each refresh and derive deltas between consecutive snapshots.

export async function findLatestRankSnapshot(puuid) {
  const col = getRankSnapshotsCollection()
  if (!col || !puuid) return null
  return col.findOne({ puuid }, { sort: { recordedAt: -1 } })
}

export async function findRankSnapshots(puuid, { sinceMs = null } = {}) {
  const col = getRankSnapshotsCollection()
  if (!col || !puuid) return []
  const filter = { puuid }
  if (sinceMs) filter.recordedAt = { $gte: new Date(sinceMs) }
  return col.find(filter).sort({ recordedAt: 1 }).toArray()
}

export async function insertRankSnapshot(puuid, { tier, rank, leaguePoints, recordedAt = new Date() }) {
  const col = getRankSnapshotsCollection()
  if (!col || !puuid || !tier) return null
  const doc = {
    puuid,
    tier,
    rank: rank ?? null,
    leaguePoints: leaguePoints ?? 0,
    recordedAt,
  }
  await col.insertOne(doc)
  return doc
}

// Append only when (tier, rank, leaguePoints) changed since the last record —
// this keeps the snapshot stream sparse without losing transitions.
export async function recordRankSnapshotIfChanged(puuid, rankInfo) {
  if (!puuid || !rankInfo?.tier) return null
  const latest = await findLatestRankSnapshot(puuid).catch(() => null)
  const sameTier = latest && latest.tier === rankInfo.tier
  const sameRank = latest && (latest.rank ?? null) === (rankInfo.rank ?? null)
  const sameLp = latest && (latest.leaguePoints ?? 0) === (rankInfo.leaguePoints ?? 0)
  if (latest && sameTier && sameRank && sameLp) return latest
  return insertRankSnapshot(puuid, rankInfo)
}
