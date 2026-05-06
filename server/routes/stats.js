import { Router } from 'express'
import { getStats } from '../services/statsAggregator.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const type = req.query.type || 'units'
    const patch = req.query.patch || null
    const stats = await getStats({ type, patch })
    res.json(stats)
  } catch (err) {
    const status = err.status || 500
    if (status >= 500) console.error('Failed to load stats:', err.message)
    res.status(status).json({
      type: req.query.type || 'units',
      patch: null,
      patches: [],
      rows: [],
      matchCount: 0,
      participantCount: 0,
      itemCount: 0,
      error: status === 400 ? err.message : 'Failed to load stats',
    })
  }
})

export default router
