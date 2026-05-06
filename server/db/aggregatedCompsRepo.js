import { getAggregatedCompsCollection } from './mongo.js'

export async function replaceAggregatedComps(comps, matchCount = 0) {
  const collection = getAggregatedCompsCollection()
  if (!collection) return
  const now = new Date()
  await collection.deleteMany({})
  const docs = [
    { _type: 'meta', matchCount, lastUpdated: now },
    ...comps.map(c => ({ ...c, lastUpdated: now })),
  ]
  await collection.insertMany(docs)
}

export async function getAggregatedComps(limit = 20) {
  const collection = getAggregatedCompsCollection()
  if (!collection) return { comps: [], matchCount: 0 }
  const all = await collection
    .find({}, { projection: { _id: 0 } })
    .toArray()
  const meta = all.find(d => d._type === 'meta')
  const totalMatches = meta?.matchCount ?? 0
  const MIN_PLAY_RATE = 0.02
  const sorted = all
    .filter(d => d._type !== 'meta')
    .filter(d => totalMatches > 0 && d.playCount / totalMatches > MIN_PLAY_RATE)
    .sort((a, b) => b.playCount - a.playCount || a.avgPlacement - b.avgPlacement)
  const resolvedLimit = Number.isFinite(limit) ? limit : 20
  const comps = resolvedLimit > 0 ? sorted.slice(0, resolvedLimit) : sorted
  return { comps, matchCount: meta?.matchCount ?? 0 }
}
