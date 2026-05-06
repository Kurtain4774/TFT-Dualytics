import { lpFromRank, rankFromLp } from './lpFromRank.js'

// Approximate Double Up LP per team placement (1-4). Used as a seed weighting;
// the actual per-match LP is corrected so the cumulative line matches the real
// snapshot at every snapshot boundary.
export const TEAM_LP_BASE = { 1: 50, 2: 25, 3: -25, 4: -50 }

function baseFor(match) {
  const p = Number(match?.teamPlacement)
  return TEAM_LP_BASE[p] ?? 0
}

function snapshotPointsFromRaw(rankSnapshots) {
  return (rankSnapshots || [])
    .map(snap => {
      const ts = new Date(snap.recordedAt).getTime()
      if (!Number.isFinite(ts)) return null
      const absLp = lpFromRank(snap)
      if (absLp == null) return null
      return { ts, absLp }
    })
    .filter(Boolean)
    .sort((a, b) => a.ts - b.ts)
}

function makePoint(match, absLp, delta) {
  const r = rankFromLp(absLp) || { tier: null, rank: null, leaguePoints: 0 }
  return {
    ts: match.date,
    absLp,
    tier: r.tier,
    rank: r.rank,
    leaguePoints: r.leaguePoints,
    teamPlacement: match.teamPlacement ?? null,
    matchId: match.matchId,
    delta,
  }
}

// Build one estimated LP point per match. Snapshots themselves are not emitted
// as points (they only anchor the math).
export function estimateMatchLp(rankSnapshots, matches) {
  const snaps = snapshotPointsFromRaw(rankSnapshots)
  const sortedMatches = [...(matches || [])]
    .filter(m => Number.isFinite(m?.date))
    .sort((a, b) => a.date - b.date)

  if (!sortedMatches.length) return []
  if (!snaps.length) return [] // nothing to anchor on

  const points = []

  // 1) Matches strictly before the first snapshot: walk backward from firstSnap
  //    using base placement values directly (no scaling).
  const first = snaps[0]
  const pre = sortedMatches.filter(m => m.date <= first.ts)
  if (pre.length) {
    // Walk from the last pre-match (closest to first snapshot) backward.
    // We want the cumulative LP to land at first.absLp at first.ts.
    // Approach: assign base delta to each pre-match, accumulating backward
    // from first.absLp. The earliest pre-match ends up lowest/highest.
    let runningAfter = first.absLp
    const reversed = []
    for (let i = pre.length - 1; i >= 0; i--) {
      const m = pre[i]
      const delta = baseFor(m)
      const absLp = runningAfter - delta // LP before this match's gain
      // The "point" represents LP after this match. So actually:
      // pointLp(i) = runningAfter (LP at end of this match)
      // and runningAfter for next iteration becomes pointLp(i) - delta(i).
      reversed.push({ match: m, absLp: runningAfter, delta })
      runningAfter = absLp
    }
    reversed.reverse()
    for (const r of reversed) points.push(makePoint(r.match, r.absLp, r.delta))
  }

  // 2) Windows between consecutive snapshots.
  for (let i = 0; i < snaps.length - 1; i++) {
    const a = snaps[i]
    const b = snaps[i + 1]
    const inWindow = sortedMatches.filter(m => m.date > a.ts && m.date <= b.ts)
    if (!inWindow.length) continue
    const bases = inWindow.map(baseFor)
    const sumBase = bases.reduce((s, x) => s + x, 0)
    const realDelta = b.absLp - a.absLp
    const residual = realDelta - sumBase
    const correction = residual / inWindow.length
    let running = a.absLp
    for (let j = 0; j < inWindow.length; j++) {
      const m = inWindow[j]
      let gain = bases[j] + correction
      let absLp
      if (j === inWindow.length - 1) {
        // Snap-to-truth: the last match in the window lands exactly on snapshot B.
        absLp = b.absLp
        gain = absLp - running
      } else {
        absLp = running + gain
      }
      points.push(makePoint(m, absLp, gain))
      running = absLp
    }
  }

  // 3) Matches strictly after the last snapshot: walk forward from lastSnap
  //    using base placement values directly (no scaling).
  const last = snaps[snaps.length - 1]
  const post = sortedMatches.filter(m => m.date > last.ts)
  if (post.length) {
    let running = last.absLp
    for (const m of post) {
      const delta = baseFor(m)
      running = running + delta
      points.push(makePoint(m, running, delta))
    }
  }

  return points.sort((a, b) => a.ts - b.ts)
}
