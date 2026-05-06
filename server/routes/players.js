import { Router } from 'express'
import { searchPlayers } from '../db/playerRepo.js'

const router = Router()

router.get('/search', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : ''
  const limit = req.query.limit
  try {
    const results = await searchPlayers(q, limit)
    res.json(results)
  } catch (err) {
    console.error('Player search failed:', err.message)
    res.status(500).json({ error: 'Player search failed' })
  }
})

export default router
