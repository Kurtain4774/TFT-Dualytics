// Run with: node --test client/src/utils/estimateMatchLp.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { estimateMatchLp, TEAM_LP_BASE } from './estimateMatchLp.js'
import { lpFromRank } from './lpFromRank.js'

const snap = (ms, tier, rank, lp) => ({
  recordedAt: new Date(ms).toISOString(),
  tier,
  rank,
  leaguePoints: lp,
})

const match = (matchId, ms, teamPlacement) => ({ matchId, date: ms, teamPlacement })

test('window matches: snap-to-truth + sum of gains equals real delta', () => {
  // Snapshot A: Plat IV 0 LP. Snapshot B: Plat IV 60 LP. Delta = +60.
  const A = snap(1000, 'PLATINUM', 'IV', 0)
  const B = snap(2000, 'PLATINUM', 'IV', 60)
  const matches = [
    match('m1', 1100, 1), // win
    match('m2', 1300, 4), // big loss
    match('m3', 1500, 2), // small win
    match('m4', 1900, 3), // small loss
  ]
  const points = estimateMatchLp([A, B], matches)
  assert.equal(points.length, 4)
  // Last match snaps exactly to snapshot B
  assert.equal(points[points.length - 1].absLp, lpFromRank(B))
  // Sum of per-match deltas equals real LP delta (60)
  const sum = points.reduce((s, p) => s + p.delta, 0)
  assert.equal(Math.round(sum), 60)
  // First match (a 1st-place win) should have a positive delta above the baseline correction
  assert.ok(points[0].delta > points[1].delta, '1st should gain more than 4th in same window')
})

test('zero matches in window: emits nothing for that window', () => {
  const A = snap(1000, 'GOLD', 'I', 50)
  const B = snap(2000, 'PLATINUM', 'IV', 10)
  const points = estimateMatchLp([A, B], [])
  assert.deepEqual(points, [])
})

test('matches before first snapshot use base table walking backward', () => {
  const first = snap(2000, 'GOLD', 'IV', 100)
  const matches = [
    match('m1', 1000, 1), // 1st: TEAM_LP_BASE[1] = +50
    match('m2', 1500, 4), // 4th: TEAM_LP_BASE[4] = -50
  ]
  const points = estimateMatchLp([first], matches)
  assert.equal(points.length, 2)
  // m2 (the last pre-match) lands on first.absLp
  assert.equal(points[1].absLp, lpFromRank(first))
  // m2's delta is its base (-50)
  assert.equal(points[1].delta, TEAM_LP_BASE[4])
  // m1's absLp is firstAbs - delta(m2) - delta(m1)? No: pre-match accumulator
  // walks backward: m2.lp = firstAbs, m1.lp = firstAbs - m2.delta = firstAbs + 50
  assert.equal(points[0].absLp, lpFromRank(first) - TEAM_LP_BASE[4])
})

test('matches after last snapshot use base table walking forward', () => {
  const last = snap(1000, 'GOLD', 'IV', 100)
  const matches = [
    match('m1', 1500, 1), // +50
    match('m2', 2000, 3), // -25
  ]
  const points = estimateMatchLp([last], matches)
  assert.equal(points.length, 2)
  assert.equal(points[0].absLp, lpFromRank(last) + TEAM_LP_BASE[1])
  assert.equal(points[1].absLp, lpFromRank(last) + TEAM_LP_BASE[1] + TEAM_LP_BASE[3])
})

test('returns [] when no snapshots are present', () => {
  const matches = [match('m1', 1000, 1)]
  assert.deepEqual(estimateMatchLp([], matches), [])
})

test('estimated tier/rank/lp are populated from rankFromLp', () => {
  const A = snap(1000, 'PLATINUM', 'IV', 0)
  const B = snap(2000, 'PLATINUM', 'III', 0) // +100 LP
  const points = estimateMatchLp([A, B], [
    match('m1', 1500, 1),
    match('m2', 1800, 2),
  ])
  for (const p of points) {
    assert.ok(p.tier, 'tier populated')
    assert.ok(p.rank, 'rank populated')
    assert.equal(typeof p.leaguePoints, 'number')
  }
})
