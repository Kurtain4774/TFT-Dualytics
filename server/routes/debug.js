import { Router } from 'express'
import { getRateLimitStats } from '../services/riotApi.js'

const router = Router()

router.get('/ratelimit', (req, res) => {
  res.json(getRateLimitStats())
})

export default router
