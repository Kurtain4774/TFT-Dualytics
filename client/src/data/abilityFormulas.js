// Per-champion ability token formulas.
// CDragon ability descriptions reference @TokenName@ that don't always map
// 1:1 to a variable. This registry maps (championId, tokenName) → a function
// that emits an ordered list of value+icon segments. The tokenizer in
// UnitCard.jsx consults this registry first; on miss it falls back to the
// generic findVariable heuristic.
//
// Champion IDs are matched after normalization (lowercase, strip non-alnum)
// so 'TFT17_Bel\'Veth', 'TFT17_BelVeth', 'TFT17_Belveth' all collapse to the
// same key.

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

// Resolve a variable's value array from the variables list (case-insensitive).
const v = (vars, name) => {
  if (!Array.isArray(vars)) return []
  const target = norm(name)
  const found = vars.find(x => norm(x.name) === target)
  return Array.isArray(found?.value) ? found.value : []
}

// Map star-level indices [1,2,3] over a value array, applying fn to each.
// Falls back to last available index if star-level is missing.
const map3 = (arr, fn) => [1, 2, 3].map(i => fn(arr?.[i] ?? arr?.[arr?.length - 1] ?? 0))

// Combine two value arrays index-wise.
const combine = (a, b, fn) => [1, 2, 3].map(i => {
  const av = a?.[i] ?? a?.[a?.length - 1] ?? 0
  const bv = b?.[i] ?? b?.[b?.length - 1] ?? 0
  return fn(av, bv)
})

const RAW_FORMULAS = {
  TFT17_Aatrox: {
    ModifiedDamage: ({ vars, stats }) => [
      { values: v(vars, 'DamageAD'), icon: 'ad' },
      { values: map3(v(vars, 'DamagePercentArmor'), x => x * (stats.armor ?? 0)), icon: 'armor' },
    ],
    ModifiedHeal: ({ vars }) => [{ values: v(vars, 'HealAP'), icon: 'ap' }],
    ModifiedNovaDamage: ({ vars, stats }) => [
      { values: map3(v(vars, 'DamageAD'), x => x * 0.5), icon: 'ad' },
      { values: map3(v(vars, 'DamagePercentArmor'), x => x * (stats.armor ?? 0) * 0.5), icon: 'armor' },
    ],
  },

  TFT17_Briar: {
    ModifiedDamage: ({ vars }) => [{ values: v(vars, 'ADDamage'), icon: 'ad' }],
  },

  TFT17_Caitlyn: {
    ModifiedHeadshotDamage: ({ vars }) => [
      { values: v(vars, 'Damage'), icon: 'ad' },
      { values: v(vars, 'BonusDamage'), icon: 'ap' },
    ],
    ModifiedNovaHeadshotDamage: ({ vars }) => [
      { values: combine(v(vars, 'NovaHeadshotModifier'), v(vars, 'Damage'), (a, b) => a * b), icon: 'ad' },
      { values: v(vars, 'BonusDamage'), icon: 'ap' },
    ],
  },

  TFT17_Chogath: {
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'PercentMaximumHealthDamage'), icon: 'hp', percent: true },
      { values: v(vars, 'BonusDamage'), icon: 'ap' },
    ],
  },

  TFT17_Ezreal: {
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
  },

  TFT17_Leona: {
    ModifiedShield: ({ vars }) => [{ values: v(vars, 'ShieldAmount'), icon: 'ap' }],
  },

  TFT17_Nasus: {
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'DamageHealth'), icon: 'hp', percent: true },
      { values: v(vars, 'DamageAP'), icon: 'ap' },
    ],
  },

  TFT17_RekSai: {
    TotalHealing: ({ vars }) => [
      { values: v(vars, 'PercentMaximumHealthHealing'), icon: 'hp', percent: true },
      { values: v(vars, 'APHealing'), icon: 'ap' },
    ],
  },

  TFT17_Talon: {
    ModifiedBleedDamage: ({ vars }) => [
      { values: v(vars, 'ADBleedDamage'), icon: 'ad' },
      { values: v(vars, 'APBleedDamage'), icon: 'ap' },
    ],
  },

  TFT17_Akali: {
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'DamageAD'), icon: 'ad' },
      { values: v(vars, 'DamageAP'), icon: 'ap' },
    ],
    ModifiedSecondaryDamage: ({ vars }) => [
      {
        values: combine(
          combine(v(vars, 'DamageAD'), v(vars, 'DamageAP'), (a, b) => a + b),
          v(vars, 'SecondaryDamageModifier'),
          (sum, mod) => sum * mod,
        ),
        icon: 'ad',
      },
    ],
    ModifiedNovaDamage: ({ vars }) => [
      { values: v(vars, 'NovaDamagePerSecond'), icon: 'ad' },
    ],
  },

  // Bel'Veth — 'TotalNumSlashes' has a special compound rendering.
  TFT17_BelVeth: {
    TotalNumSlashes: ({ vars }) => [
      { values: v(vars, 'BaseNumSlashes'), icon: null },
      { text: ' + 1 PER ' },
      { values: v(vars, 'BonusASBreakpoint'), icon: null },
      { text: ' BONUS ' },
      { iconOnly: 'as' },
    ],
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
  },

  TFT17_Gnar: {
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'DamageAD'), icon: 'ad' },
      { values: v(vars, 'DamageAP'), icon: 'ap' },
    ],
    ModifiedMeepDPS: ({ vars }) => [
      {
        values: combine(
          v(vars, 'MeepPercentBAD'),
          combine(v(vars, 'DamageAD'), v(vars, 'DamageAP'), (a, b) => a + b),
          (mult, sum) => mult * sum,
        ),
        icon: 'ad',
      },
    ],
  },

  TFT17_Gragas: {
    ModifiedHeal: ({ vars }) => [
      { values: v(vars, 'HealingPercentHealth'), icon: 'hp', percent: true },
      { values: v(vars, 'Healing'), icon: 'ap' },
    ],
    DamageTotal: ({ vars }) => [{ values: v(vars, 'Damage'), icon: 'ap' }],
  },

  TFT17_Jax: {
    ModifiedShield: ({ vars }) => [{ values: v(vars, 'ShieldAP'), icon: 'ap' }],
    ModifiedDamage: ({ vars, stats }) => [
      { values: map3(v(vars, 'ArmorMRScale'), x => x * (stats.armor ?? 0)), icon: 'armor' },
      { values: map3(v(vars, 'ArmorMRScale'), x => x * (stats.magicResist ?? 0)), icon: 'mr' },
    ],
  },

  TFT17_Jinx: {
    ModifiedNumRockets: ({ vars }) => [{ values: v(vars, 'BaseBullets'), icon: 'as' }],
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
  },

  TFT17_Meepsie: {
    ModifiedHeal: ({ vars }) => [
      { values: v(vars, 'HealingPercentHealth'), icon: 'hp', percent: true },
      { values: v(vars, 'HealingAP'), icon: 'ap' },
    ],
  },

  TFT17_Pantheon: {
    ModifiedShield: ({ vars }) => [
      { values: v(vars, 'PercentHealthShield'), icon: 'hp', percent: true },
      { values: v(vars, 'APShield'), icon: 'ap' },
    ],
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'TrueDamagePerSecond'), icon: 'ad' },
    ],
  },

  TFT17_Pyke: {
    ModifiedDamage: ({ vars }) => [{ values: v(vars, 'SpearDamage'), icon: 'ap' }],
    ModifiedAreaDamage: ({ vars }) => [{ values: v(vars, 'AoEDamage'), icon: 'ad' }],
  },

  TFT17_Diana: {
    ModifiedDamage: ({ vars }) => [{ values: v(vars, 'BaseDamage'), icon: 'ap' }],
  },

  TFT17_Fizz: {
    ModifiedDamage: ({ vars }) => [{ values: v(vars, 'DashDamage'), icon: 'ap' }],
    ModifiedChompDamage: ({ vars }) => [
      { values: v(vars, 'BiteDamageAP'), icon: 'ap' },
      { iconOnly: 'amp' },
    ],
    ModifiedMeepBonusDamage: ({ vars }) => [
      { values: v(vars, 'BiteDamageMeep'), icon: 'ap' },
    ],
  },

  TFT17_KaiSa: {
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
  },

  TFT17_Maokai: {
    DamageTotal: ({ vars }) => [{ values: v(vars, 'Damage'), icon: 'ap' }],
    ModifiedNovaDamage: ({ vars }) => [
      { values: v(vars, 'NovaHealthDamage'), icon: 'hp', percent: true },
    ],
  },

  TFT17_Rhaast: {
    ModifiedHeal: ({ vars }) => [{ values: v(vars, 'HealAmount'), icon: 'ap' }],
  },

  TFT17_Samira: {
    ModifiedPassiveDamage: ({ vars }) => [
      { values: v(vars, 'PassiveAD'), icon: 'ad' },
      { values: v(vars, 'PassiveAP'), icon: 'ap' },
    ],
  },

  TFT17_Urgot: {
    ModifiedShield: ({ vars }) => [{ values: v(vars, 'ShieldAmount'), icon: 'ap' }],
  },

  TFT17_AurelionSol: {
    ModifiedDamage: ({ vars }) => [{ values: v(vars, 'DamagePerSecond'), icon: 'ap' }],
    // MagicPen appears as an @MagicPen@ token in AurelionSol's desc — render
    // the raw value as percent rather than the default plain number.
    MagicPen: ({ vars }) => [{ values: v(vars, 'MagicPen'), icon: null, percent: true }],
  },

  TFT17_Corki: {
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'MissileAD'), icon: 'ad' },
      { values: v(vars, 'MissileAP'), icon: 'ap' },
    ],
    ModifiedProcDamage: ({ vars }) => [
      {
        values: combine(
          v(vars, 'ProcDamageMult'),
          combine(v(vars, 'MissileAD'), v(vars, 'MissileAP'), (a, b) => a + b),
          (mult, sum) => mult * sum,
        ),
        icon: 'ad',
      },
    ],
  },

  TFT17_Kindred: {
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
    ModifiedDamage: ({ vars }) => [{ values: v(vars, 'SpellDamage'), icon: 'ad' }],
  },

  TFT17_Leblanc: {
    ModifiedBaseAttackDamage: ({ vars }) => [
      { values: v(vars, 'BasicAttackDamage'), icon: 'ap' },
    ],
  },

  TFT17_MasterYi: {
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'DamageAD'), icon: 'ad' },
      { values: v(vars, 'DamageAP'), icon: 'ap' },
    ],
  },

  TFT17_Rammus: {
    ModifiedShield: ({ vars }) => [{ values: v(vars, 'ShieldAP'), icon: 'ap' }],
    ModifiedDamage: ({ vars, stats }) => [
      { values: v(vars, 'DamageAP'), icon: 'ap' },
      { values: map3(v(vars, 'DamageArmor'), x => x * (stats.armor ?? 0)), icon: 'armor' },
    ],
    ModifiedPassiveDamage: ({ vars }) => [
      { values: v(vars, 'PassivePercentArmor'), icon: 'armor', percent: true },
      { iconOnly: 'amp' },
    ],
  },

  TFT17_Riven: {
    ModifiedPassiveAPDamage: ({ vars }) => [{ values: v(vars, 'PassiveDamage'), icon: 'ap' }],
    ModifiedPassiveADDamage: ({ vars }) => [{ values: v(vars, 'PassiveDamage'), icon: 'ad' }],
    ModifiedAPDamage: ({ vars }) => [{ values: v(vars, 'Damage'), icon: 'ap' }],
    ModifiedADDamage: ({ vars }) => [{ values: v(vars, 'Damage'), icon: 'ad' }],
    ModifiedAPWaveDamage: ({ vars }) => [{ values: v(vars, 'WaveDamage'), icon: 'ap' }],
    ModifiedADWaveDamage: ({ vars }) => [{ values: v(vars, 'WaveDamage'), icon: 'ad' }],
  },

  TFT17_TahmKench: {
    ModifiedHeal: ({ vars }) => [
      { values: v(vars, 'HealHP'), icon: 'hp', percent: true },
      { values: v(vars, 'HealAP'), icon: 'ap' },
    ],
    ModifiedDamage: ({ vars }) => [
      { values: v(vars, 'DamageHP'), icon: 'hp', percent: true },
      { values: v(vars, 'DamageAP'), icon: 'ap' },
    ],
  },

  TFT17_TheMightyMech: {
    ModifiedDamage: ({ vars, stats }) => [
      { values: map3(v(vars, 'ARMARScaling'), x => x * (stats.armor ?? 0)), icon: 'armor' },
      { values: map3(v(vars, 'ARMARScaling'), x => x * (stats.magicResist ?? 0)), icon: 'mr' },
    ],
  },

  TFT17_Xayah: {
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
  },

  TFT17_Graves: {
    ModifiedSecondaryDamage: ({ vars }) => [
      { values: v(vars, 'SecondaryDamageAD'), icon: 'ad' },
      { values: v(vars, 'SecondaryDamageAP'), icon: 'ap' },
    ],
  },

  TFT17_Jhin: {
    TotalDamage: ({ vars }) => [
      { values: v(vars, 'ADDamage'), icon: 'ad' },
      { values: v(vars, 'APDamage'), icon: 'ap' },
    ],
  },

  TFT17_Shen: {
    ModifiedBonusDamage: ({ vars }) => [
      { values: v(vars, 'BonusDamageOnAttack'), icon: 'ap' },
    ],
    ModifiedShield: ({ vars }) => [
      { values: v(vars, 'ShieldHP'), icon: 'hp', percent: true },
      { values: v(vars, 'ShieldAP'), icon: 'ap' },
    ],
  },
}

// Build a normalized lookup so champion ID variants (Bel'Veth / BelVeth /
// Belveth) all resolve to the same registry entry.
const FORMULAS = Object.fromEntries(
  Object.entries(RAW_FORMULAS).map(([id, tokens]) => [norm(id), tokens]),
)

// Look up a formula. Tries exact normalized match first.
export function getFormula(championId, tokenName) {
  const champKey = norm(championId)
  const champEntry = FORMULAS[champKey]
  if (!champEntry) return null
  const tokenKey = Object.keys(champEntry).find(k => norm(k) === norm(tokenName))
  return tokenKey ? champEntry[tokenKey] : null
}
