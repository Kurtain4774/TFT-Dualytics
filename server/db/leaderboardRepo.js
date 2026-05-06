import { getLeaderboardsCollection } from './mongo.js'

export async function getLeaderboard(region) {
  const collection = getLeaderboardsCollection()
  if (!collection) return null
  return collection.findOne({ region }, { projection: { _id: 0 } })
}

export async function replaceLeaderboard(region, entries) {
  const collection = getLeaderboardsCollection()
  if (!collection) return
  await collection.updateOne(
    { region },
    { $set: { region, entries, updatedAt: new Date() } },
    { upsert: true }
  )
}
