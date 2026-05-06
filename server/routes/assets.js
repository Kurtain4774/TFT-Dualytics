import { Router } from 'express'
import { getAllChampions, getAllItems, getAllTraits } from '../services/assetResolver.js'

const router = Router()

router.get('/champions', (req, res) => res.json(getAllChampions()))
router.get('/items', (req, res) => res.json(getAllItems()))
router.get('/traits', (req, res) => res.json(getAllTraits()))

export default router
