import { apiGet } from '../api/client.js'
import {
  REGION_CANONICAL_BY_ALIAS,
  REGION_DEFAULT_TAG,
  REGIONS,
} from '../constants/regions.js'
import { buildSummonerPath } from '../constants/routes.js'

export { REGION_DEFAULT_TAG, REGIONS }

export function normalizeRegion(region) {
  const lower = region?.toLowerCase() || 'na'
  return REGION_CANONICAL_BY_ALIAS[lower] || lower
}

export function parseRiotId(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const hashIdx = trimmed.lastIndexOf('#')
  if (hashIdx === -1) {
    return { gameName: trimmed, tagLine: '', hasExplicitTag: false }
  }
  const gameName = trimmed.slice(0, hashIdx).trim()
  const tagLine = trimmed.slice(hashIdx + 1).trim()
  if (!gameName || !tagLine) return null
  return { gameName, tagLine, hasExplicitTag: true }
}

export function defaultTagForRegion(region) {
  return REGION_DEFAULT_TAG[region] || 'NA1'
}

export function validGameNameLength(gameName) {
  return !!gameName && gameName.length >= 3 && gameName.length <= 16
}

export function validGameName(gameName) {
  return validGameNameLength(gameName) && !gameName.includes('/') && !gameName.includes('#')
}

export function validTagLine(tagLine) {
  return /^[a-zA-Z0-9]{2,5}$/.test(tagLine || '')
}

export function validRiotId(id) {
  if (!id || !validGameName(id.gameName)) return false
  return id.hasExplicitTag ? validTagLine(id.tagLine) : true
}

export function parseRiotIdWithDefaultTag(raw, region) {
  const id = parseRiotId(raw)
  if (!id || !validGameNameLength(id.gameName)) return null
  if (id.hasExplicitTag && !validTagLine(id.tagLine)) return null
  return withDefaultTag(id, region)
}

export function withDefaultTag(id, region) {
  return {
    gameName: id.gameName,
    tagLine: id.tagLine || defaultTagForRegion(region),
  }
}

export function summonerPath(region, id) {
  return buildSummonerPath(region, id)
}

export async function resolveRiotIdCandidates(region, gameName) {
  const encodedRegion = encodeURIComponent(region)
  const encodedName = encodeURIComponent(gameName.trim())
  const response = await apiGet(`/api/summoner/resolve/${encodedRegion}/${encodedName}`)
  return response?.players || []
}
