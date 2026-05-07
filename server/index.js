import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import compsRouter from './routes/comps.js'
import summonerRouter from './routes/summoner.js'
import assetsRouter from './routes/assets.js'
import debugRouter from './routes/debug.js'
import leaderboardRouter from './routes/leaderboard.js'
import playersRouter from './routes/players.js'
import statsRouter from './routes/stats.js'
import { fetchAndCacheAssets } from './services/assetResolver.js'
import { runCompAggregation } from './services/compsAggregator.js'
import { runLeaderboardMatchSync } from './services/leaderboardMatchSync.js'
import { connectMongo, createIndexes } from './db/mongo.js'

const app = express()
const PORT = process.env.PORT || 3001
const backgroundJobsEnabled = process.env.ENABLE_BACKGROUND_JOBS !== 'false'
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
}))
app.use(express.json())

app.use('/api/comps', compsRouter)
app.use('/api/summoner', summonerRouter)
app.use('/api/assets', assetsRouter)
app.use('/api/debug', debugRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/players', playersRouter)
app.use('/api/stats', statsRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Load assets first, then start server so champions are available immediately
async function start() {
  try {
    await connectMongo()
    await createIndexes()
    console.log('MongoDB connected')
  } catch (err) {
    console.warn('MongoDB unavailable, running in memory-only mode:', err.message)
  }

  await fetchAndCacheAssets().catch(err => console.error('Asset fetch failed:', err.message))
  if (backgroundJobsEnabled) {
    await runCompAggregation().catch(err => console.error('Initial comp aggregation failed:', err.message))
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    if (!backgroundJobsEnabled) {
      console.log('Background jobs disabled')
      return
    }

    // Re-aggregate every 10 minutes (Mongo-only, cheap)
    cron.schedule('*/10 * * * *', () => runCompAggregation().catch(console.error))
    // Sync top-50 leaderboard players' match histories every hour, then re-aggregate
    cron.schedule('0 * * * *', () => runLeaderboardMatchSync().catch(console.error))
  })
}

start().catch(err => {
  console.error('Startup failed:', err)
  process.exit(1)
})
