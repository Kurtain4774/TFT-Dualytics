import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  aggregateStats,
  buildStatsMatchFilter,
  extractPatch,
} from '../services/statsAggregator.js'
import { CURRENT_SET } from '../constants/game.js'

function unit(id, itemNames = []) {
  return { character_id: id, tier: 2, itemNames }
}

function participant(overrides = {}) {
  return {
    placement: 1,
    units: [],
    traits: [],
    ...overrides,
  }
}

function match(participants, overrides = {}) {
  return {
    tftSetNumber: CURRENT_SET,
    info: {
      tft_game_type: 'pairs',
      game_version: 'Version 17.2.614.1234',
      participants,
      ...overrides.info,
    },
    ...overrides,
  }
}

describe('aggregateStats', () => {
  it('aggregates unit stats with average placement, win rate, frequency, and popular items', () => {
    const results = aggregateStats([
      match([
        participant({
          placement: 1,
          units: [unit('TFT17_ALPHA', ['TFT_Item_A', 'TFT_Item_B']), unit('TFT17_BRAVO')],
        }),
        participant({
          placement: 6,
          units: [unit('TFT17_ALPHA', ['TFT_Item_A'])],
        }),
      ]),
    ], 'units')

    const alpha = results.rows.find(row => row.id === 'TFT17_ALPHA')

    assert.equal(results.matchCount, 1)
    assert.equal(results.participantCount, 2)
    assert.equal(alpha.count, 2)
    assert.equal(alpha.avgPlacement, 2)
    assert.equal(alpha.winRate, 0.5)
    assert.equal(alpha.frequency, 1)
    assert.deepEqual(alpha.popularItems, [
      { id: 'TFT_Item_A', count: 2 },
      { id: 'TFT_Item_B', count: 1 },
    ])
  })

  it('aggregates item and trait stats with popular units', () => {
    const docs = [
      match([
        participant({
          placement: 2,
          units: [unit('TFT17_ALPHA', ['TFT_Item_A']), unit('TFT17_BRAVO', ['TFT_Item_A'])],
          traits: [{ name: 'TFT17_TRAIT', num_units: 2, tier_current: 1 }],
        }),
        participant({
          placement: 7,
          units: [unit('TFT17_ALPHA', ['TFT_Item_B'])],
          traits: [{ name: 'TFT17_TRAIT', num_units: 1, tier_current: 0 }],
        }),
      ]),
    ]

    const itemStats = aggregateStats(docs, 'items')
    const traitStats = aggregateStats(docs, 'traits')
    const itemA = itemStats.rows.find(row => row.id === 'TFT_Item_A')
    const trait = traitStats.rows.find(row => row.id === 'TFT17_TRAIT#1')

    assert.equal(itemStats.itemCount, 3)
    assert.equal(itemA.count, 2)
    assert.equal(itemA.winRate, 1)
    assert.deepEqual(itemA.popularUnits, [
      { id: 'TFT17_ALPHA', count: 1 },
      { id: 'TFT17_BRAVO', count: 1 },
    ])
    assert.equal(trait.count, 1)
    assert.equal(trait.tier, 1)
    assert.equal(trait.traitId, 'TFT17_TRAIT')
    assert.equal(trait.avgUnits, 2)
    assert.deepEqual(trait.popularUnits, [
      { id: 'TFT17_ALPHA', count: 1 },
      { id: 'TFT17_BRAVO', count: 1 },
    ])
  })
})

describe('stats patch helpers', () => {
  it('converts LoL game_version to TFT patch label and builds LoL-format DB filters', () => {
    // LoL 16.9 = TFT Set 17 Patch 2 (17.2)
    assert.equal(extractPatch('Version 16.9.614.1234'), '17.2')
    assert.equal(extractPatch('Version 16.8.614.1234'), '17.1')
    assert.equal(extractPatch('Version 15.9.614.1234'), null) // wrong LoL season
    // buildStatsMatchFilter receives the TFT label and converts back to LoL regex internally
    assert.deepEqual(buildStatsMatchFilter('17.2'), {
      'info.tft_game_type': 'pairs',
      tftSetNumber: CURRENT_SET,
      'info.game_version': { $regex: '\\b16\\.9\\.' },
    })
  })
})
