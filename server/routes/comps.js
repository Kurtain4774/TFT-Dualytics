import { Router } from 'express'
import { getAggregatedComps } from '../db/aggregatedCompsRepo.js'
import { runCompAggregation } from '../services/compsAggregator.js'

const router = Router()
const DEMAND_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour
let lastDemandAggregation = 0

router.get('/', async (req, res) => {
  try {
    const now = Date.now()
    if (now - lastDemandAggregation >= DEMAND_COOLDOWN_MS) {
      lastDemandAggregation = now // set before await to prevent concurrent triggers
      await runCompAggregation()
    }
    const limit = req.query.limit == null ? 20 : Number(req.query.limit)
    const { comps, matchCount } = await getAggregatedComps(limit)
    const lastUpdated = comps.reduce((max, c) => {
      const t = c.lastUpdated ? new Date(c.lastUpdated).getTime() : 0
      return t > max ? t : max
    }, 0)
    res.json({ comps, matchCount, lastUpdated: lastUpdated || null })
  } catch (err) {
    console.error('Failed to load aggregated comps:', err.message)
    res.status(500).json({ comps: [], matchCount: 0, lastUpdated: null, error: 'Failed to load comps' })
  }
})

export default router
